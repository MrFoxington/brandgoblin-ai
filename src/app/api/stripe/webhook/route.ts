import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

// Stripe webhook placeholder. Point your Stripe webhook endpoint here
// (e.g. https://yourapp.com/api/stripe/webhook) once STRIPE_WEBHOOK_SECRET
// is set, then handle subscription lifecycle events to sync `plan`/`credits`.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan ?? "pro";

      if (userId) {
        await supabase.from("users").update({ plan, credits: 999999 }).eq("id", userId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      // TODO: look up the user by Stripe customer ID and downgrade to "free".
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
