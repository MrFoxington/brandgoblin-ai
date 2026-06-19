import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { grantMonthlyEnergy, addRefillEnergy, revokeEnergy } from "@/lib/energy";

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

    // ── New checkout completed ──────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId     = session.metadata?.userId;
      const type       = session.metadata?.type ?? "subscription";
      const customerId = typeof session.customer === "string" ? session.customer : null;

      if (!userId) break;

      if (type === "energy_refill") {
        // ⚡ Energy Refill purchase — add energy, don't touch plan
        const paymentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id;
        await addRefillEnergy(userId, paymentId);
        console.log(`[webhook] energy refill added for user ${userId}`);

      } else {
        // 🆕 New Creator Pro subscription
        await supabase
          .from("users")
          .update({ plan: "pro", credits: PRO_CREDITS, stripe_customer_id: customerId })
          .eq("id", userId);

        // Determine billing period from subscription if available
        let periodStart: string | undefined;
        let periodEnd: string | undefined;
        if (session.subscription && typeof session.subscription === "string") {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            periodStart = new Date(sub.current_period_start * 1000).toISOString();
            periodEnd   = new Date(sub.current_period_end   * 1000).toISOString();
          } catch { /* non-fatal */ }
        }

        await grantMonthlyEnergy(userId, periodStart, periodEnd);
        console.log(`[webhook] pro subscription + energy granted for user ${userId}`);
      }
      break;
    }

    // ── Subscription renewed / updated ────────────────────────────────────
    case "customer.subscription.updated": {
      const sub        = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (!customerId) break;

      const downgrade =
        sub.status === "canceled" ||
        sub.status === "unpaid"   ||
        sub.status === "past_due";

      if (downgrade) {
        await supabase
          .from("users")
          .update({ plan: "free", credits: FREE_CREDITS })
          .eq("stripe_customer_id", customerId);

        const { data: userRow } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userRow) await revokeEnergy(userRow.id);

      } else if (sub.status === "active" || sub.status === "trialing") {
        // Active/renewed — make sure Pro access is granted
        await supabase
          .from("users")
          .update({ plan: "pro", credits: PRO_CREDITS })
          .eq("stripe_customer_id", customerId);

        // Check if this is a period renewal (billing_cycle_anchor changed or new period)
        const prevAttributes = event.data.previous_attributes as Record<string, unknown> | undefined;
        const isPeriodRenewal = prevAttributes?.current_period_start !== undefined;

        if (isPeriodRenewal) {
          const { data: userRow } = await supabase
            .from("users")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (userRow) {
            const periodStart = new Date(sub.current_period_start * 1000).toISOString();
            const periodEnd   = new Date(sub.current_period_end   * 1000).toISOString();
            await grantMonthlyEnergy(userRow.id, periodStart, periodEnd);
            console.log(`[webhook] monthly energy reset for user ${userRow.id}`);
          }
        }
      }
      break;
    }

    // ── Subscription cancelled ────────────────────────────────────────────
    case "customer.subscription.deleted": {
      const sub        = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (!customerId) break;

      await supabase
        .from("users")
        .update({ plan: "free", credits: FREE_CREDITS })
        .eq("stripe_customer_id", customerId);

      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (userRow) await revokeEnergy(userRow.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
