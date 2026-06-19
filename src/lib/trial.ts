// Trial lifecycle helpers — async, DB-writing counterparts to src/lib/access.ts.
// Kept separate to avoid circular imports with src/lib/energy.ts.

import { createAdminClient } from "@/lib/supabase/server";
import { grantMonthlyEnergy, revokeEnergy } from "@/lib/energy";
import type { UserAccess } from "@/lib/access";

const TRIAL_DAYS = 7;

/**
 * Starts a 7-day trial for a brand-new user.
 * Idempotent: guarded by has_used_trial so it can be called on every page load safely.
 */
export async function startTrialIfEligible(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("has_used_trial, plan")
    .eq("id", userId)
    .single();

  if (!data || data.has_used_trial || data.plan === "pro" || data.plan === "agency") return;

  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("users")
    .update({ is_trial: true, has_used_trial: true, trial_ends_at: trialEnd })
    .eq("id", userId);

  await grantMonthlyEnergy(userId, now.toISOString(), trialEnd);
}

/**
 * Lazily expires a trial that has passed its end date.
 * Idempotent: safe to call on every gated request.
 */
export async function expireTrialIfNeeded(userId: string, u: UserAccess): Promise<void> {
  if (!u.is_trial || !u.trial_ends_at) return;
  if (u.plan === "pro" || u.plan === "agency") return;
  if (new Date(u.trial_ends_at) > new Date()) return;

  const supabase = createAdminClient();
  await supabase
    .from("users")
    .update({ is_trial: false })
    .eq("id", userId);

  await revokeEnergy(userId);
}
