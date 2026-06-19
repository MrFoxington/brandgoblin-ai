// Trial lifecycle helpers — async, DB-writing counterparts to src/lib/access.ts.
// Kept separate to avoid circular imports with src/lib/energy.ts.

import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { grantMonthlyEnergy, revokeEnergy } from "@/lib/energy";
import { normalizeEmail } from "@/lib/email-normalize";
import type { UserAccess } from "@/lib/access";

const TRIAL_DAYS = 7;
// Max trials allowed from one IP hash within the lookback window
const IP_TRIAL_LIMIT = 3;
const IP_WINDOW_HOURS = 24;

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export interface TrialStartContext {
  email: string;
  emailConfirmedAt: string | null;
  ipHash?: string;
}

export type TrialStartResult =
  | { started: true }
  | { started: false; reason: "already_used" | "unverified" | "ip_limit" | "paid" | "normalized_email_used" };

/**
 * Starts a 7-day trial for a brand-new user.
 * Guards: email verification, one-per-normalized-email, IP rate limit.
 * Idempotent: safe to call on every authenticated page load.
 */
export async function startTrialIfEligible(
  userId: string,
  ctx: TrialStartContext
): Promise<TrialStartResult> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("users")
    .select("has_used_trial, plan")
    .eq("id", userId)
    .single();

  if (!data) return { started: false, reason: "already_used" };
  if (data.plan === "pro" || data.plan === "agency") return { started: false, reason: "paid" };
  if (data.has_used_trial) return { started: false, reason: "already_used" };

  // Layer 4a: email must be verified to start a trial
  if (!ctx.emailConfirmedAt) return { started: false, reason: "unverified" };

  // Layer 4b: one trial per normalized email (catches +aliases and Gmail dot tricks)
  const normalized = normalizeEmail(ctx.email);
  const { data: existingNorm } = await supabase
    .from("users")
    .select("id")
    .eq("normalized_email", normalized)
    .eq("has_used_trial", true)
    .neq("id", userId)
    .limit(1)
    .single();

  if (existingNorm) return { started: false, reason: "normalized_email_used" };

  // Layer 4c: soft IP rate limit — flag/deny when >IP_TRIAL_LIMIT trials from same IP in window
  if (ctx.ipHash) {
    const windowStart = new Date(Date.now() - IP_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("signup_ip_hash", ctx.ipHash)
      .eq("has_used_trial", true)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= IP_TRIAL_LIMIT) {
      console.warn(`[trial] IP limit hit for hash ${ctx.ipHash.slice(0, 8)}…`);
      return { started: false, reason: "ip_limit" };
    }
  }

  // All guards passed — start the trial
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("users")
    .update({
      is_trial: true,
      has_used_trial: true,
      trial_ends_at: trialEnd,
      normalized_email: normalized,
      signup_ip_hash: ctx.ipHash ?? null,
    })
    .eq("id", userId);

  await grantMonthlyEnergy(userId, now.toISOString(), trialEnd);
  return { started: true };
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
