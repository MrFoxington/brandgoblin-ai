// ⚡ Creative Energy — server-side utilities
// All balance reads/writes go through here. Never trust the client.

import { createAdminClient } from "@/lib/supabase/server";
import { ENERGY_CONFIG, getEnergyCost } from "@/lib/energy-config";
import { getEffectivePlan } from "@/lib/access";

export interface EnergyBalance {
  monthlyTotal: number;
  monthlyRemaining: number;
  refillTotal: number;
  refillRemaining: number;
  totalRemaining: number;
  periodEnd: string | null;
}

export interface EnergyCheckResult {
  allowed: boolean;
  cost: number;
  totalRemaining: number;
  reason?: "empty" | "not_pro";
}

// ── Get balance ────────────────────────────────────────────────────────────

export async function getUserEnergyBalance(userId: string): Promise<EnergyBalance | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_energy_balances")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    monthlyTotal:     data.monthly_energy_total,
    monthlyRemaining: data.monthly_energy_remaining,
    refillTotal:      data.refill_energy_total,
    refillRemaining:  data.refill_energy_remaining,
    totalRemaining:   data.monthly_energy_remaining + data.refill_energy_remaining,
    periodEnd:        data.current_period_end,
  };
}

// ── Check before generation ────────────────────────────────────────────────

export async function checkEnergyForGeneration(
  userId: string,
  contentType: string
): Promise<EnergyCheckResult> {
  const supabase = createAdminClient();

  // Verify access — check trial columns so getEffectivePlan can include active trials
  const { data: userRow } = await supabase
    .from("users")
    .select("plan, is_trial, trial_ends_at")
    .eq("id", userId)
    .single();

  if (!userRow) return { allowed: false, cost: 0, totalRemaining: 0, reason: "not_pro" };

  // Lazy trial expiry — inline to avoid circular import with trial.ts
  if (
    userRow.is_trial &&
    userRow.trial_ends_at &&
    new Date(userRow.trial_ends_at) <= new Date() &&
    userRow.plan !== "pro" &&
    userRow.plan !== "agency"
  ) {
    await supabase.from("users").update({ is_trial: false }).eq("id", userId);
    await revokeEnergy(userId);
    return { allowed: false, cost: 0, totalRemaining: 0, reason: "not_pro" };
  }

  if (getEffectivePlan(userRow) === "free") {
    return { allowed: false, cost: 0, totalRemaining: 0, reason: "not_pro" };
  }

  const cost = getEnergyCost(contentType);
  const balance = await getUserEnergyBalance(userId);

  // Lazy-init: if no balance row exists yet, create one (handles edge cases)
  if (!balance) {
    await grantMonthlyEnergy(userId, undefined, undefined);
    const fresh = await getUserEnergyBalance(userId);
    const total = fresh?.totalRemaining ?? 0;
    return { allowed: total >= cost, cost, totalRemaining: total };
  }

  return {
    allowed: balance.totalRemaining >= cost,
    cost,
    totalRemaining: balance.totalRemaining,
    reason: balance.totalRemaining < cost ? "empty" : undefined,
  };
}

// ── Deduct energy after successful generation ──────────────────────────────

export async function deductEnergy(
  userId: string,
  contentType: string,
  options: {
    generationId?: string;
    modelUsed?: string;
    promptTokens?: number;
    completionTokens?: number;
  } = {}
): Promise<{ success: boolean; balanceAfter: number }> {
  const supabase = createAdminClient();
  const cost = getEnergyCost(contentType);

  const { data, error } = await supabase
    .from("user_energy_balances")
    .select("monthly_energy_remaining, refill_energy_remaining")
    .eq("user_id", userId)
    .single();

  if (error || !data) return { success: false, balanceAfter: 0 };

  let monthlyRemaining = data.monthly_energy_remaining;
  let refillRemaining  = data.refill_energy_remaining;
  let toDeduce = cost;

  // Deduct from monthly first, then refill
  if (monthlyRemaining >= toDeduce) {
    monthlyRemaining -= toDeduce;
    toDeduce = 0;
  } else {
    toDeduce -= monthlyRemaining;
    monthlyRemaining = 0;
    refillRemaining = Math.max(0, refillRemaining - toDeduce);
  }

  const balanceAfter = monthlyRemaining + refillRemaining;

  await supabase
    .from("user_energy_balances")
    .update({ monthly_energy_remaining: monthlyRemaining, refill_energy_remaining: refillRemaining })
    .eq("user_id", userId);

  // Log transaction
  await supabase.from("energy_transactions").insert({
    user_id: userId,
    transaction_type: "usage",
    amount: -cost,
    balance_after: balanceAfter,
    description: `Used for: ${contentType}`,
    related_generation_id: options.generationId ?? null,
  });

  // Log generation details for analytics
  await supabase.from("generation_usage_logs").insert({
    user_id: userId,
    brand_id: options.generationId ?? null,
    content_type: contentType,
    energy_cost: cost,
    model_used: options.modelUsed ?? null,
    prompt_tokens: options.promptTokens ?? null,
    completion_tokens: options.completionTokens ?? null,
    status: "success",
  });

  return { success: true, balanceAfter };
}

// ── Refund energy (called when generation fails after deduction) ───────────

export async function refundEnergy(
  userId: string,
  amount: number,
  reason: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("user_energy_balances")
    .select("monthly_energy_total, monthly_energy_remaining, refill_energy_remaining")
    .eq("user_id", userId)
    .single();

  if (!data) return;

  // Refund back to monthly first (up to monthly total), rest goes to refill
  const monthlySpace = data.monthly_energy_total - data.monthly_energy_remaining;
  const toMonthly = Math.min(amount, monthlySpace);
  const toRefill  = amount - toMonthly;

  const newMonthly = data.monthly_energy_remaining + toMonthly;
  const newRefill  = data.refill_energy_remaining + toRefill;
  const balanceAfter = newMonthly + newRefill;

  await supabase
    .from("user_energy_balances")
    .update({ monthly_energy_remaining: newMonthly, refill_energy_remaining: newRefill })
    .eq("user_id", userId);

  await supabase.from("energy_transactions").insert({
    user_id: userId,
    transaction_type: "refund",
    amount,
    balance_after: balanceAfter,
    description: reason,
  });
}

// ── Grant monthly energy (on new sub or renewal) ──────────────────────────

export async function grantMonthlyEnergy(
  userId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<void> {
  const supabase = createAdminClient();
  const allowance = ENERGY_CONFIG.MONTHLY_ALLOWANCE;

  const { data: existing } = await supabase
    .from("user_energy_balances")
    .select("id, refill_energy_total, refill_energy_remaining")
    .eq("user_id", userId)
    .single();

  const payload = {
    user_id:                  userId,
    plan:                     "pro",
    monthly_energy_total:     allowance,
    monthly_energy_remaining: allowance,
    refill_energy_total:      existing?.refill_energy_total     ?? 0,
    refill_energy_remaining:  existing?.refill_energy_remaining ?? 0,
    current_period_start:     periodStart ?? new Date().toISOString(),
    current_period_end:       periodEnd   ?? null,
  };

  if (existing) {
    await supabase
      .from("user_energy_balances")
      .update(payload)
      .eq("user_id", userId);
  } else {
    await supabase.from("user_energy_balances").insert(payload);
  }

  const balanceAfter = allowance + (existing?.refill_energy_remaining ?? 0);

  await supabase.from("energy_transactions").insert({
    user_id:          userId,
    transaction_type: "monthly_grant",
    amount:           allowance,
    balance_after:    balanceAfter,
    description:      "Monthly Creative Energy grant",
  });
}

// ── Add refill energy (on $19 refill purchase) ────────────────────────────

export async function addRefillEnergy(
  userId: string,
  stripePaymentId: string
): Promise<void> {
  const supabase = createAdminClient();
  const refillAmount = ENERGY_CONFIG.REFILL_AMOUNT;

  // ── Idempotency guard ──────────────────────────────────────────────────────
  // Stripe delivers webhooks at-least-once and retries on any error. Without
  // this check, a redelivered "checkout.session.completed" would grant the
  // refill twice for a single payment. Bail if we've already processed it.
  if (stripePaymentId) {
    const { data: existingTx } = await supabase
      .from("energy_transactions")
      .select("id")
      .eq("transaction_type", "refill_purchase")
      .eq("stripe_payment_id", stripePaymentId)
      .maybeSingle();

    if (existingTx) {
      console.log(`[energy] refill ${stripePaymentId} already processed — skipping`);
      return;
    }
  }

  const { data } = await supabase
    .from("user_energy_balances")
    .select("monthly_energy_remaining, refill_energy_total, refill_energy_remaining")
    .eq("user_id", userId)
    .single();

  const newRefillTotal     = (data?.refill_energy_total     ?? 0) + refillAmount;
  const newRefillRemaining = (data?.refill_energy_remaining ?? 0) + refillAmount;
  const balanceAfter = (data?.monthly_energy_remaining ?? 0) + newRefillRemaining;

  // ── Write the ledger row FIRST as the idempotency lock ──────────────────────
  // A partial unique index on stripe_payment_id (see migration) means a duplicate
  // webhook fails here BEFORE we touch the balance — so a single payment can never
  // grant energy twice, even if two redeliveries race past the guard above.
  const { error: ledgerError } = await supabase.from("energy_transactions").insert({
    user_id:          userId,
    transaction_type: "refill_purchase",
    amount:           refillAmount,
    balance_after:    balanceAfter,
    description:      "⚡ Creative Energy Refill purchase",
    stripe_payment_id: stripePaymentId,
  });

  if (ledgerError) {
    // 23505 = unique_violation → this payment was already granted. Safe to skip.
    if (ledgerError.code === "23505") {
      console.log(`[energy] refill ${stripePaymentId} already processed (race) — skipping`);
      return;
    }
    throw ledgerError;
  }

  // Ledger insert succeeded → we own this grant. Now apply it to the balance.
  if (data) {
    await supabase
      .from("user_energy_balances")
      .update({ refill_energy_total: newRefillTotal, refill_energy_remaining: newRefillRemaining })
      .eq("user_id", userId);
  } else {
    // User somehow has no balance row — create it with just refill energy
    await supabase.from("user_energy_balances").insert({
      user_id:                  userId,
      plan:                     "pro",
      monthly_energy_total:     0,
      monthly_energy_remaining: 0,
      refill_energy_total:      newRefillTotal,
      refill_energy_remaining:  newRefillRemaining,
    });
  }
}

// ── Revoke energy on plan downgrade ───────────────────────────────────────

export async function revokeEnergy(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("user_energy_balances")
    .update({
      plan:                     "free",
      monthly_energy_remaining: 0,
      refill_energy_remaining:  0,
      current_period_end:       new Date().toISOString(),
    })
    .eq("user_id", userId);

  await supabase.from("energy_transactions").insert({
    user_id:          userId,
    transaction_type: "reset",
    amount:           0,
    balance_after:    0,
    description:      "Subscription cancelled — energy cleared",
  });
}
