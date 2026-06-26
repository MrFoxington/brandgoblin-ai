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

      if (userRow?.plan !== "pro") {
        return NextResponse.json(
          { error: "Creator Pro subscription required to purchase a refill." },
          { status: 403 }
        );
      }

      // Read energy_amount metadata from Stripe so the webhook is metadata-driven
      // (no hardcoded price→energy map anywhere in the codebase)
      let energyAmount: string | undefined;
      try {
        const price = await stripe.prices.retrieve(requestedPriceId);
        energyAmount = price.metadata?.energy_amount;
      } catch (err) {
        console.error("[checkout] price metadata fetch failed:", err);
        // Non-fatal — webhook falls back to ENERGY_CONFIG.REFILL_AMOUNT
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: requestedPriceId, quantity: 1 }],
        ...customerParams,
        success_url: `${appUrl}/dashboard/creator-pro?refill=success`,
        cancel_url:  `${appUrl}/dashboard/creator-pro`,
        metadata: {
          userId: authData.user.id,
          type: "energy_refill",
          ...(energyAmount ? { energyAmount } : {}),
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
