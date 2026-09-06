import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { grantMonthlyEnergy, addRefillEnergy, downgradeToFree } from "@/lib/energy";
import { getPlanPerks } from "@/lib/energy-config";

const PRO_CREDITS = 999999;
const FREE_CREDITS = 3;

// ── Plan resolution (Sept 2026: Creator Pro + Creator Max) ───────────────────
// Which paid plan does a Stripe subscription represent? Price ID is the ground
// truth (set in Vercel env), subscription metadata is the fallback (set at
// checkout), and anything unrecognised is treated as Pro (never locks a payer out).
type PaidPlan = "pro" | "max";

function planFromPriceId(priceId: string | undefined | null): PaidPlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ID_MAX) return "max";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  return null;
}

function planFromSubscription(sub: Stripe.Subscription): PaidPlan {
  const priceId = sub.items?.data?.[0]?.price?.id;
  const byPrice = planFromPriceId(priceId);
  if (byPrice) return byPrice;
  const meta = sub.metadata?.plan;
  return meta === "max" ? "max" : "pro";
}

// Monthly allowance for a subscription: metadata stamped at checkout →
// the price's own `energy_amount` metadata → the plan default in code.
function monthlyEnergyFromSubscription(sub: Stripe.Subscription, plan: PaidPlan): number {
  const fromSubMeta = parseInt(sub.metadata?.monthlyEnergy ?? "", 10);
  if (Number.isFinite(fromSubMeta) && fromSubMeta > 0) return fromSubMeta;
  const fromPriceMeta = parseInt(sub.items?.data?.[0]?.price?.metadata?.energy_amount ?? "", 10);
  if (Number.isFinite(fromPriceMeta) && fromPriceMeta > 0) return fromPriceMeta;
  return getPlanPerks(plan).monthlyEnergy;
}

// Does this customer still have ANOTHER live subscription? Used so cancelling
// the OLD plan during a Pro→Max switch never downgrades a paying member.
async function otherLiveSubscription(
  stripe: Stripe,
  customerId: string,
  exceptSubId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
    return (
      subs.data.find(
        (s) => s.id !== exceptSubId && (s.status === "active" || s.status === "trialing" || s.status === "past_due")
      ) ?? null
    );
  } catch (err) {
    console.error("[webhook] subscription list failed:", err);
    return null;
  }
}

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
        // ⚡ Energy Refill — amount comes from Stripe price metadata (set at checkout)
        const paymentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id;
        const energyAmount = session.metadata?.energyAmount
          ? parseInt(session.metadata.energyAmount)
          : undefined; // falls back to ENERGY_CONFIG.REFILL_AMOUNT inside addRefillEnergy
        await addRefillEnergy(userId, paymentId, energyAmount);
        console.log(`[webhook] energy refill +${energyAmount ?? "default"} for user ${userId}`);

      } else {
        // 🆕 New subscription (Creator Pro or Creator Max). Clear the trial
        // flag so state is unambiguous. Plan comes from the session metadata
        // stamped at checkout; the subscription's price ID double-checks it.
        const subId = typeof session.subscription === "string" ? session.subscription : null;
        let sub: Stripe.Subscription | null = null;
        if (subId) {
          try { sub = await stripe.subscriptions.retrieve(subId); } catch { /* non-fatal */ }
        }
        const plan: PaidPlan = sub
          ? planFromSubscription(sub)
          : session.metadata?.plan === "max" ? "max" : "pro";

        await supabase
          .from("users")
          .update({ plan, credits: PRO_CREDITS, stripe_customer_id: customerId, is_trial: false })
          .eq("id", userId);

        // Monthly energy: session metadata (stamped at checkout from the price)
        // → subscription/price metadata → plan default. Never a silent 1,000.
        const fromSession = parseInt(session.metadata?.monthlyEnergy ?? "", 10);
        const allowance =
          Number.isFinite(fromSession) && fromSession > 0
            ? fromSession
            : sub
            ? monthlyEnergyFromSubscription(sub, plan)
            : getPlanPerks(plan).monthlyEnergy;

        const periodStart = sub ? new Date(sub.current_period_start * 1000).toISOString() : undefined;
        const periodEnd   = sub ? new Date(sub.current_period_end   * 1000).toISOString() : undefined;

        await grantMonthlyEnergy(userId, periodStart, periodEnd, { plan, allowance });
        console.log(`[webhook] ${plan} subscription + ${allowance} energy granted for user ${userId}`);

        // Plan switch (Pro→Max or Max→Pro): the customer now has TWO
        // subscriptions. Cancel the old one with proration so they aren't
        // billed twice. The resulting `customer.subscription.deleted` event is
        // ignored by the downgrade handlers below because another live
        // subscription exists.
        if (customerId && subId) {
          const old = await otherLiveSubscription(stripe, customerId, subId);
          if (old) {
            try {
              await stripe.subscriptions.cancel(old.id, { prorate: true });
              console.log(`[webhook] plan switch: cancelled previous subscription ${old.id} (${planFromSubscription(old)}) for user ${userId}`);
            } catch (err) {
              console.error(`[webhook] failed to cancel previous subscription ${old.id}:`, err);
            }
          }
        }
      }
      break;
    }

    // ── Subscription renewed / updated ────────────────────────────────────
    case "customer.subscription.updated": {
      const sub        = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      if (!customerId) break;

      // past_due = retrying, NOT canceled. Only downgrade when Stripe gives up.
      const downgrade = sub.status === "canceled" || sub.status === "unpaid";

      if (downgrade) {
        // Plan switch guard: if another subscription is still live for this
        // customer (Pro→Max just happened), this is the OLD plan dying. Keep
        // the member on their current plan.
        const other = await otherLiveSubscription(stripe, customerId, sub.id);
        if (other) {
          const keepPlan = planFromSubscription(other);
          await supabase
            .from("users")
            .update({ plan: keepPlan, credits: PRO_CREDITS })
            .eq("stripe_customer_id", customerId);
          console.log(`[webhook] ${sub.id} ended but ${other.id} is live — keeping customer ${customerId} on ${keepPlan}`);
          break;
        }

        await supabase
          .from("users")
          .update({ plan: "free", credits: FREE_CREDITS, payment_status: "canceled" })
          .eq("stripe_customer_id", customerId);

        const { data: userRow } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        // Soft downgrade — preserve any remaining energy (no harsh revoke-to-zero).
        if (userRow) await downgradeToFree(userRow.id);

      } else if (sub.status === "active" || sub.status === "trialing") {
        // Active/renewed — make sure the RIGHT paid plan is granted (Pro or Max)
        const plan = planFromSubscription(sub);
        await supabase
          .from("users")
          .update({ plan, credits: PRO_CREDITS })
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
            const allowance   = monthlyEnergyFromSubscription(sub, plan);
            await grantMonthlyEnergy(userRow.id, periodStart, periodEnd, { plan, allowance });
            console.log(`[webhook] monthly energy reset (${plan}, ${allowance}) for user ${userRow.id}`);
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

      // Plan switch guard (see subscription.updated): another live sub means
      // this deletion is the OLD plan being retired, not a cancellation.
      const other = await otherLiveSubscription(stripe, customerId, sub.id);
      if (other) {
        const keepPlan = planFromSubscription(other);
        await supabase
          .from("users")
          .update({ plan: keepPlan, credits: PRO_CREDITS })
          .eq("stripe_customer_id", customerId);
        console.log(`[webhook] ${sub.id} deleted but ${other.id} is live — keeping customer ${customerId} on ${keepPlan}`);
        break;
      }

      await supabase
        .from("users")
        .update({ plan: "free", credits: FREE_CREDITS })
        .eq("stripe_customer_id", customerId);

      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      // Soft downgrade — preserve any remaining energy (no harsh revoke-to-zero).
      if (userRow) await downgradeToFree(userRow.id);

      await supabase
        .from("users")
        .update({ payment_status: "canceled" })
        .eq("stripe_customer_id", customerId);
      break;
    }

    // ── Invoice payment failed → grace window (past_due, keep Pro) ────────
    case "invoice.payment_failed": {
      const invoice    = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      if (!customerId) break;

      await supabase
        .from("users")
        .update({ payment_status: "past_due", payment_issue_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId);

      console.log(`[webhook] payment failed — grace window started for customer ${customerId}`);
      break;
    }

    // ── Invoice payment succeeded → clear recovery state ──────────────────
    case "invoice.payment_succeeded": {
      const invoice    = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      if (!customerId) break;

      await supabase
        .from("users")
        .update({ payment_status: "active", payment_issue_at: null })
        .eq("stripe_customer_id", customerId);

      // Robust renewal trigger (the long-standing TODO): a paid invoice with
      // billing_reason "subscription_cycle" IS the monthly renewal. The grant
      // is idempotent per period, so this and subscription.updated can both
      // fire safely.
      if (invoice.billing_reason === "subscription_cycle" && typeof invoice.subscription === "string") {
        try {
          const sub  = await stripe.subscriptions.retrieve(invoice.subscription);
          const plan = planFromSubscription(sub);
          const { data: userRow } = await supabase
            .from("users")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();
          if (userRow) {
            const periodStart = new Date(sub.current_period_start * 1000).toISOString();
            const periodEnd   = new Date(sub.current_period_end   * 1000).toISOString();
            const allowance   = monthlyEnergyFromSubscription(sub, plan);
            await grantMonthlyEnergy(userRow.id, periodStart, periodEnd, { plan, allowance });
            console.log(`[webhook] cycle invoice → monthly energy (${plan}, ${allowance}) for user ${userRow.id}`);
          }
        } catch (err) {
          console.error("[webhook] cycle grant failed:", err);
        }
      }

      console.log(`[webhook] payment recovered for customer ${customerId}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
