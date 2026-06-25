// Free-tier onboarding helpers — async, DB-writing counterparts to src/lib/access.ts.
// Kept separate to avoid circular imports with src/lib/energy.ts.
//
// Freemium model: brand-new free users get a ONE-TIME Goblin Studio starter
// energy grant (no 7-day Pro trial, no day-7 revoke). The grant is gated by the
// has_received_free_studio_grant flag + anti-abuse guards, and is race-proof via
// an atomic flag claim.

import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { grantStudioStarterEnergy } from "@/lib/energy";
import { normalizeEmail } from "@/lib/email-normalize";
import { ENERGY_CONFIG } from "@/lib/energy-config";
import type { UserAccess } from "@/lib/access";

// Max free-starter grants allowed from one IP hash within the lookback window
const IP_GRANT_LIMIT = 3;
const IP_WINDOW_HOURS = 24;

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export interface StarterGrantContext {
  email: string;
  emailConfirmedAt: string | null;
  ipHash?: string;
}

export type StarterGrantResult =
  | { granted: true }
  | { granted: false; reason: "already_granted" | "unverified" | "ip_limit" | "paid" | "normalized_email_used" };

/**
 * Grants a one-time free Goblin Studio starter energy allotment to a brand-new
 * free user. Replaces the old 7-day reverse trial.
 * Guards: email verification, one-per-normalized-email, IP rate limit.
 * Idempotent + race-proof via an atomic flag claim — safe to call on every
 * authenticated page load.
 */
export async function grantFreeStudioStarterIfEligible(
  userId: string,
  ctx: StarterGrantContext
): Promise<StarterGrantResult> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("users")
    .select("has_received_free_studio_grant, plan")
    .eq("id", userId)
    .single();

  if (!data) return { granted: false, reason: "already_granted" };
  if (data.plan === "pro" || data.plan === "agency") return { granted: false, reason: "paid" };
  if (data.has_received_free_studio_grant) return { granted: false, reason: "already_granted" };

  // Guard A: email must be verified to receive free energy
  if (!ctx.emailConfirmedAt) return { granted: false, reason: "unverified" };

  // Guard B: one grant per normalized email (catches +aliases and Gmail dot tricks)
  const normalized = normalizeEmail(ctx.email);
  const { data: existingNorm } = await supabase
    .from("users")
    .select("id")
    .eq("normalized_email", normalized)
    .eq("has_received_free_studio_grant", true)
    .neq("id", userId)
    .limit(1)
    .single();

  if (existingNorm) return { granted: false, reason: "normalized_email_used" };

  // Guard C: soft IP rate limit — deny when >IP_GRANT_LIMIT grants from same IP in window
  if (ctx.ipHash) {
    const windowStart = new Date(Date.now() - IP_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("signup_ip_hash", ctx.ipHash)
      .eq("has_received_free_studio_grant", true)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= IP_GRANT_LIMIT) {
      console.warn(`[starter] IP limit hit for hash ${ctx.ipHash.slice(0, 8)}…`);
      return { granted: false, reason: "ip_limit" };
    }
  }

  // Atomic claim — only the request that flips the flag false→true grants energy.
  // This is the idempotency lock: concurrent page loads can never double-grant.
  const { data: claimed } = await supabase
    .from("users")
    .update({
      has_received_free_studio_grant: true,
      normalized_email: normalized,
      signup_ip_hash: ctx.ipHash ?? null,
    })
    .eq("id", userId)
    .eq("has_received_free_studio_grant", false)
    .select("id");

  if (!claimed || claimed.length === 0) {
    // Lost the race — another request already claimed and granted.
    return { granted: false, reason: "already_granted" };
  }

  await grantStudioStarterEnergy(userId, ENERGY_CONFIG.FREE_STUDIO_STARTER_ENERGY);
  return { granted: true };
}

/**
 * Lazily clears a stale legacy trial flag for the mid-transition cohort.
 * Energy is NO LONGER revoked — free users keep whatever energy they have until
 * it runs out. Idempotent; safe to call on every gated request.
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
}
