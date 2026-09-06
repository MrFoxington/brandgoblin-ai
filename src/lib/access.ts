// Single source of truth for Pro access decisions.
// Pure functions only — no DB calls, no energy imports (avoids circular deps).

export interface UserAccess {
  plan: string;
  is_trial: boolean;
  trial_ends_at: string | null;
  has_used_trial?: boolean;
}

/**
 * True for every PAID plan that unlocks Pro features: Creator Pro, Creator Max,
 * and the legacy "agency" value. Use this instead of `plan === "pro"` so a new
 * tier can never silently lock a paying member out of a feature.
 */
export function hasProAccess(plan: string | null | undefined): boolean {
  return plan === "pro" || plan === "max" || plan === "agency";
}

/** True only for Creator Max ($49/mo). */
export function isMaxPlan(plan: string | null | undefined): boolean {
  return plan === "max";
}

/**
 * The user's tier for display/limits: "max" | "pro" | "free". Trials count as
 * "pro". (Prefer getEffectivePlan() when you only need pro-or-not.)
 */
export function getPlanTier(u: UserAccess): "max" | "pro" | "free" {
  if (u.plan === "max") return "max";
  return getEffectivePlan(u);
}

/** Returns "pro" if the user has paid Pro/Max/agency OR is within an active trial window. */
export function getEffectivePlan(u: UserAccess): "pro" | "free" {
  if (hasProAccess(u.plan)) return "pro";
  if (u.is_trial && u.trial_ends_at && new Date(u.trial_ends_at) > new Date()) return "pro";
  return "free";
}

/** True only when the user is in an active trial (not a paid sub). */
export function isTrialing(u: UserAccess): boolean {
  return (
    u.is_trial &&
    !!u.trial_ends_at &&
    new Date(u.trial_ends_at) > new Date() &&
    !hasProAccess(u.plan)
  );
}

/** Calendar days remaining in the trial (0 when expired). */
export function trialDaysLeft(u: UserAccess): number {
  if (!u.trial_ends_at) return 0;
  const ms = new Date(u.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** True when the user has exhausted their trial and is not a paid subscriber. */
export function trialExpired(u: UserAccess): boolean {
  return (
    !!u.has_used_trial &&
    !u.is_trial &&
    !hasProAccess(u.plan)
  );
}
