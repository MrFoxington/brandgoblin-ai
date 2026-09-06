import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getPlanPerks } from "@/lib/energy-config";
import { hasProAccess } from "@/lib/access";

// ── Subscription plans (Sept 2026: Creator Pro $19 + Creator Max $49) ─────────
// Price IDs stay server-side. The client only ever sends a plan key.
const SUBSCRIPTION_PRICE_IDS: Record<"pro" | "max", string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
  max: process.env.STRIPE_PRICE_ID_MAX,
};

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

  if (!SUBSCRIPTION_PRICE_IDS.pro) {
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
      // Subscribers get bonus energy on every refill pack: Creator Pro +20%,
      // Creator Max +30% (Sept 2026). Applied here (not the webhook) so the
      // boosted amount rides the session metadata that the webhook already
      // trusts. Raw paid plan only — real subscribers, not trials.
      const isMember = hasProAccess(userRow?.plan);
      const packBonus = isMember ? getPlanPerks(userRow?.plan).packBonus : 1;
      const grantedAmount = Math.round(finalEnergyAmount * packBonus);
      if (isMember) {
        console.log(
          `[checkout] ${getPlanPerks(userRow?.plan).label} member bonus: ${finalEnergyAmount} → ${grantedAmount} (x${packBonus}) for user ${authData.user.id}`
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

    // ── Subscription: Creator Pro ($19) or Creator Max ($49) ───────────────
    const requestedPlan = body.plan === "max" ? "max" : "pro";
    const priceId = SUBSCRIPTION_PRICE_IDS[requestedPlan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Creator ${requestedPlan === "max" ? "Max" : "Pro"} isn't switched on yet. (STRIPE_PRICE_ID_${requestedPlan.toUpperCase()} is missing.)` },
        { status: 503 }
      );
    }

    // Already on this plan? Don't sell it twice — send them to the portal instead.
    if (userRow?.plan === requestedPlan) {
      return NextResponse.json(
        { error: `You're already on Creator ${requestedPlan === "max" ? "Max" : "Pro"}. Manage your plan from Settings.` },
        { status: 409 }
      );
    }

    // Monthly energy for this plan. Code map is authoritative; the Stripe
    // price's `energy_amount` metadata may override it (tune without a deploy).
    // Same rule as refills: the amount ALWAYS rides the session metadata so the
    // webhook never has to guess.
    const planAllowance = getPlanPerks(requestedPlan).monthlyEnergy;
    let metadataMonthly: number | undefined;
    try {
      const price = await stripe.prices.retrieve(priceId);
      const raw = price.metadata?.energy_amount;
      const parsed = raw ? parseInt(raw, 10) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) metadataMonthly = parsed;
    } catch (err) {
      console.error("[checkout] subscription price metadata fetch failed:", err);
    }
    const monthlyEnergy = metadataMonthly ?? planAllowance;
    if (metadataMonthly && metadataMonthly !== planAllowance) {
      console.warn(
        `[checkout] monthly energy drift for ${requestedPlan}: Stripe metadata says ${metadataMonthly}, code says ${planAllowance} — using metadata`
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...customerParams,
      success_url: `${appUrl}/settings?upgraded=1&plan=${requestedPlan}`,
      cancel_url:  `${appUrl}/pricing`,
      metadata: {
        userId: authData.user.id,
        plan: requestedPlan,
        type: "subscription",
        monthlyEnergy: String(monthlyEnergy),
      },
      subscription_data: {
        metadata: { userId: authData.user.id, plan: requestedPlan, monthlyEnergy: String(monthlyEnergy) },
      },
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
