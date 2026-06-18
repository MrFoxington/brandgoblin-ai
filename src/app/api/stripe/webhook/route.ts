import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

// Unlimited-plan sentinel for Pro users. Free users get a real countable balance.
const PRO_CREDITS = 999999;
const FREE_CREDITS = 3;

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
      const customerId = typeof session.customer === "string" ? session.customer : null;

      if (userId) {
        await supabase
          .from("users")
          .update({ plan, credits: PRO_CREDITS, stripe_customer_id: customerId })
          .eq("id", userId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (!customerId) break;

      const downgrade =
        event.type === "customer.subscription.deleted" ||
        sub.status === "canceled" ||
        sub.status === "unpaid";

      if (downgrade) {
        await supabase
          .from("users")
          .update({ plan: "free", credits: FREE_CREDITS })
          .eq("stripe_customer_id", customerId);
      } else if (sub.status === "active" || sub.status === "trialing") {
        // Recovered or renewed subscription — make sure Pro access is (re)granted.
        await supabase
          .from("users")
          .update({ plan: "pro", credits: PRO_CREDITS })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
