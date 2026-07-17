import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// Lazily construct the Stripe client so a missing key fails loudly with a
// clear message rather than silently behaving as a fake "placeholder" account.
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments aren't switched on yet. (STRIPE_SECRET_KEY is missing.)" },
      { status: 503 }
    );
  }

  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    return NextResponse.json(
      { error: "Payments aren't switched on yet. (STRIPE_PRICE_ID_PRO is missing.)" },
      { status: 503 }
    );
  }

  // Normalize: strip any trailing dots or slashes so a stray char in the env var
  // (e.g. "https://app.brandgoblinai.com.") can't produce an unreachable redirect URL.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/[./]+$/, "");
  if (!appUrl) {
    return NextResponse.json(
      { error: "App URL isn't configured. (Set NEXT_PUBLIC_APP_URL.)" },
      { status: 503 }
    );
  }
  // localhost is fine for LOCAL TEST-MODE rehearsal, but never with a live key —
  // that would send real paying customers back to your laptop.
  const isLiveKey = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live");
  if (appUrl.includes("localhost") && isLiveKey) {
    return NextResponse.json(
      { error: "Live Stripe key is pointed at localhost. Set NEXT_PUBLIC_APP_URL to your real domain in production." },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const checkoutType = body.type ?? "subscription"; // "subscription" | "energy_refill"

    // Reuse an existing Stripe customer if we already have one
    const { data: userRow } = await supabase
      .from("users")
      .select("stripe_customer_id, plan")
      .eq("id", authData.user.id)
      .single();

    const existingCustomerId = userRow?.stripe_customer_id ?? undefined;
    const customerParams = existingCustomerId
      ? { customer: existingCustomerId }
      : { customer_email: authData.user.email ?? undefined };

    // ── Energy Refill (one-time payment — supports all three pack sizes) ──────
    if (checkoutType === "energy_refill") {
      // Allowlist the three valid refill price IDs from env
      const allowedRefillPrices = [
        process.env.STRIPE_PRICE_ID_ENERGY_REFILL,
        process.env.STRIPE_PRICE_ID_ENERGY_3000,
        process.env.STRIPE_PRICE_ID_ENERGY_7000,
      ].filter(Boolean) as string[];

      if (allowedRefillPrices.length === 0) {
        return NextResponse.json(
          { error: "Energy refills aren't configured. (STRIPE_PRICE_ID_ENERGY_REFILL missing.)" },
          { status: 503 }
        );
      }

      // Resolve pack key → price ID (keeps price IDs server-side only)
      const packKeyMap: Record<string, string | undefined> = {
        starter: process.env.STRIPE_PRICE_ID_ENERGY_REFILL,
        value:   process.env.STRIPE_PRICE_ID_ENERGY_3000,
        creator: process.env.STRIPE_PRICE_ID_ENERGY_7000,
      };
      const packKey = body.packKey as string | undefined;
      const byPackKey = packKey ? packKeyMap[packKey] : undefined;
      // Also accept a literal priceId for backward compatibility / direct API calls
      const byPriceId = body.priceId as string | undefined;
      const requestedPriceId = byPackKey ?? byPriceId ?? process.env.STRIPE_PRICE_ID_ENERGY_REFILL;

      if (!requestedPriceId || !allowedRefillPrices.includes(requestedPriceId)) {
        return NextResponse.json(
          { error: "Invalid refill pack. Please choose a valid pack." },
          { status: 400 }
        );
      }

      // July 17 2026: refills are open to EVERYONE — "energy is the gate, not
      // the plan" (same doctrine as Studio/Labs). The old Pro-only 403 here was
      // silently breaking the free-tier "Top up energy" funnel the EnergyWidget
      // has offered all along.

      // ── Determine the energy amount for this pack ──────────────────────────
      // July 10 2026 bug: the $49 pack credited only 1,000 because the amount
      // relied ENTIRELY on `energy_amount` metadata set on the Stripe price —
      // when missing, the webhook silently fell back to the $19 default and
      // SHORT-CHANGED a real paying customer. New rules:
      //   1. Server-side pack map is the authoritative source of truth.
      //   2. Stripe price metadata may OVERRIDE it (lets us tune packs without deploys).
      //   3. If we cannot determine an amount, REFUSE to sell — never silently default.
      const PACK_ENERGY: Record<string, number> = {
        starter: 1000, // $19
        value:   3000, // $49
        creator: 7000, // $99
      };
      // Resolve which pack this price belongs to (works for both packKey and
      // legacy direct-priceId calls).
      const resolvedPackKey =
        packKey && PACK_ENERGY[packKey] !== undefined
          ? packKey
          : requestedPriceId === process.env.STRIPE_PRICE_ID_ENERGY_REFILL
          ? "starter"
          : requestedPriceId === process.env.STRIPE_PRICE_ID_ENERGY_3000
          ? "value"
          : requestedPriceId === process.env.STRIPE_PRICE_ID_ENERGY_7000
          ? "creator"
          : undefined;

      let metadataAmount: number | undefined;
      try {
        const price = await stripe.prices.retrieve(requestedPriceId);
        const raw = price.metadata?.energy_amount;
        const parsed = raw ? parseInt(raw, 10) : NaN;
        if (Number.isFinite(parsed) && parsed > 0) metadataAmount = parsed;
      } catch (err) {
        console.error("[checkout] price metadata fetch failed:", err);
        // Non-fatal — the pack map below still covers us.
      }

      const packAmount = resolvedPackKey ? PACK_ENERGY[resolvedPackKey] : undefined;
      const finalEnergyAmount = metadataAmount ?? packAmount;
      if (!finalEnergyAmount) {
        console.error(
          `[checkout] REFUSING refill checkout — cannot determine energy amount (price ${requestedPriceId}, packKey ${packKey ?? "none"})`
        );
        return NextResponse.json(
          { error: "This refill pack is misconfigured. Please try again shortly — no charge was made." },
          { status: 503 }
        );
      }
      // Warn loudly if Stripe metadata disagrees with the code map (drift detector)
      if (metadataAmount && packAmount && metadataAmount !== packAmount) {
        console.warn(
          `[checkout] energy_amount drift: Stripe metadata says ${metadataAmount}, pack map says ${packAmount} (price ${requestedPriceId}) — using metadata`
        );
      }

      // ── MEMBER BONUS FLYWHEEL (July 17 2026, Fox-approved) ─────────────────
      // Creator Pro subscribers get +20% bonus energy on every refill pack.
      // Applied here (not the webhook) so the boosted amount rides the session
      // metadata that the webhook already trusts. Raw plan === "pro" only —
      // real subscribers, not trials.
      const PRO_PACK_BONUS = 1.2;
      const isProMember = userRow?.plan === "pro";
      const grantedAmount = isProMember
        ? Math.round(finalEnergyAmount * PRO_PACK_BONUS)
        : finalEnergyAmount;
      if (isProMember) {
        console.log(
          `[checkout] Pro member bonus: ${finalEnergyAmount} → ${grantedAmount} (+20%) for user ${authData.user.id}`
        );
      }
      const energyAmount = String(grantedAmount);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: requestedPriceId, quantity: 1 }],
        ...customerParams,
        success_url: `${appUrl}/dashboard/creator-pro?refill=success`,
        cancel_url:  `${appUrl}/dashboard/creator-pro`,
        metadata: {
          userId: authData.user.id,
          type: "energy_refill",
          energyAmount, // ALWAYS set now — the webhook never falls back to a default
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // ── Creator Pro subscription ───────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...customerParams,
      success_url: `${appUrl}/settings?upgraded=1`,
      cancel_url:  `${appUrl}/pricing`,
      metadata: { userId: authData.user.id, plan: "pro", type: "subscription" },
      subscription_data: { metadata: { userId: authData.user.id, plan: "pro" } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/stripe/checkout] error:", err);
    return NextResponse.json(
      { error: "Couldn't start checkout. Please try again in a moment." },
      { status: 500 }
    );
  }
}
