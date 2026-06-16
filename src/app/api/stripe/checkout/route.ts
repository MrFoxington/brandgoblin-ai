import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// Stripe-ready placeholder. Wire up a real price ID and webhook handler
// (see /api/stripe/webhook) before going live.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { plan } = await request.json(); // "pro" | "agency"

    const priceId =
      plan === "agency"
        ? process.env.STRIPE_PRICE_ID_AGENCY
        : process.env.STRIPE_PRICE_ID_PRO;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID not configured yet." },
        { status: 501 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: authData.user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { userId: authData.user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/stripe/checkout] error:", err);
    return NextResponse.json(
      { error: "Stripe is not fully configured yet. Add your keys to .env." },
      { status: 500 }
    );
  }
}
