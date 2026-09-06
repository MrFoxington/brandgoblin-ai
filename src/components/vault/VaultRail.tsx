"use client";

/**
 * VaultRail (Creator Studio Phase B, Sept 2026).
 * The quiet right rail on desktop: streak / brands / plan strip, Creative
 * Energy, Today's Idea, the Trophy Shelf, and the plan card. On phones the
 * same rail renders under the gallery, and MobileStrip (below) puts the
 * three numbers that matter right under the greeting.
 */

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NixPose from "@/components/primitives/NixPose";
import BadgeShelf from "@/components/BadgeShelf";
import { XPBar } from "@/components/XPSystem";
import type { BadgeStats } from "@/lib/badges";
import { studioHrefFor, type StudioIdea } from "@/lib/studio/today";

export interface EnergyData {
  plan?: string;
  tier?: string;
  totalRemaining?: number;
  monthlyRemaining?: number;
  refillRemaining?: number;
  monthlyAllowance?: number;
  percentRemaining?: number;
  warningLevel?: "low" | "critical" | "empty" | null;
  estimates?: string[];
  periodEnd?: string | null;
}

export interface DailyIdea {
  idea: string;
  brandName?: string;
}

/** "Today in the Studio": one suggested creation per brand per day (Phase D). */
export interface TodayStudio {
  brandId: string;
  brandName: string;
  idea: StudioIdea;
  /** Other brands' picks, for the small links under the card. */
  others: { brandId: string; brandName: string; idea: StudioIdea }[];
}

interface RailProps {
  plan: string;
  isPro: boolean;
  isMax: boolean;
  mounted: boolean;
  streak: number;
  brandCount: number;
  energy: EnergyData | null;
  onRefill: () => void;
  idea: DailyIdea;
  today: TodayStudio | null;
  ideaDismissed: boolean;
  onDismissIdea: () => void;
  latestBrandId: string | null;
  badgeStats: BadgeStats;
}

function energyView(energy: EnergyData | null) {
  const total = energy?.totalRemaining ?? 0;
  const allowance = energy?.monthlyAllowance ?? 0;
  const overMax = allowance > 0 && total > allowance;
  const pct = overMax ? 100 : allowance > 0 ? Math.max(0, Math.min(100, energy?.percentRemaining ?? 0)) : total > 0 ? 100 : 0;
  const wl = energy?.warningLevel;
  const level = wl === "low" || wl === "critical" || wl === "empty" ? wl : null;
  const barColor =
    level === "empty" ? "#ef4444" :
    level === "critical" ? "#f97316" :
    level === "low" ? "#eab308" :
    "#2E7D5B";
  return { total, allowance, overMax, pct, level, barColor };
}

function resetLabel(periodEnd?: string | null): string | null {
  if (!periodEnd) return null;
  const ms = new Date(periodEnd).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  const days = Math.max(0, Math.ceil(ms / 86400000));
  return days === 0 ? "Resets today" : `Resets in ${days}d`;
}

export default function VaultRail({
  isPro,
  isMax,
  mounted,
  streak,
  brandCount,
  energy,
  onRefill,
  idea,
  today,
  ideaDismissed,
  onDismissIdea,
  latestBrandId,
  badgeStats,
}: RailProps) {
  const reduce = useReducedMotion();
  const e = energyView(energy);
  const reset = mounted ? resetLabel(energy?.periodEnd) : null;
  const planLabel = isMax ? "Max" : isPro ? "Pro" : "Free";
  const planSub = isMax ? "Creator Max" : isPro ? "Creator Pro" : "Free plan";

  return (
    <div className="space-y-4">
      {/* Streak · brands · plan */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[rgba(250,247,242,0.08)] bg-surface"
      >
        <div className="border-r border-[rgba(250,247,242,0.08)] px-3 py-3 text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-gold">{mounted ? streak : 1}</p>
          <p className="text-[11px] text-faint">day streak</p>
        </div>
        <div className="border-r border-[rgba(250,247,242,0.08)] px-3 py-3 text-center">
          <p className="font-display text-2xl font-bold tabular-nums text-white">{brandCount}</p>
          <p className="text-[11px] text-faint">brand{brandCount === 1 ? "" : "s"}</p>
        </div>
        <Link href={isPro ? "/settings" : "/pricing"} className="px-3 py-3 text-center transition-colors hover:bg-white/[0.03]">
          <p className={`font-display text-2xl font-bold ${isPro ? "text-primary-light" : "text-white"}`}>{planLabel}</p>
          <p className="text-[11px] text-faint">{planSub}</p>
        </Link>
      </motion.div>

      {mounted && (
        <div className="px-1">
          <XPBar compact />
        </div>
      )}

      {/* Creative Energy */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.3 }}
        className={`rounded-2xl border p-4 ${
          e.level === "empty" || e.level === "critical"
            ? "border-red-500/25 bg-red-500/5"
            : e.level === "low"
            ? "border-yellow-500/25 bg-yellow-500/5"
            : "border-[rgba(250,247,242,0.08)] bg-surface"
        }`}
        aria-label="Creative Energy"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-white">⚡ Creative Energy</p>
          {reset && <span className="text-[11px] text-faint">{reset}</span>}
        </div>
        {energy ? (
          <>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="font-display text-xl font-bold tabular-nums text-white">{e.total.toLocaleString()}</span>
              <span className="text-[11px] text-faint">
                {e.overMax
                  ? `${(energy.monthlyRemaining ?? 0).toLocaleString()} monthly + ${(energy.refillRemaining ?? 0).toLocaleString()} refill`
                  : e.allowance > 0
                  ? `of ${e.allowance.toLocaleString()} this month`
                  : "starter energy"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: e.barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(e.pct > 0 ? 2 : 0, e.pct)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            {e.level && (
              <p className={`mt-2 text-[11px] ${e.level === "low" ? "text-yellow-400" : "text-red-400"}`}>
                {e.level === "empty"
                  ? "Out of energy. Refill to keep creating."
                  : e.level === "critical"
                  ? "Almost out. Refill anytime."
                  : "Less than a quarter left."}
              </p>
            )}
          </>
        ) : (
          <div className="h-1.5 w-full animate-pulse rounded-full bg-white/8" />
        )}
        <button type="button" onClick={onRefill} className="btn-green mt-3 w-full !py-2 text-xs">
          {isPro ? "Refill energy" : "Top up energy"}
        </button>
        <p className="mt-2 text-center text-[11px] text-faint">Energy powers new creations. Saving and sharing are free.</p>
      </motion.section>

      {/* Today: one Studio creation + one content idea, per brand, per day */}
      <AnimatePresence initial={false}>
        {mounted && !ideaDismissed && (
          <motion.section
            key="today"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-nix/25 bg-nix/5 p-4"
            aria-label="Today"
          >
            <button
              type="button"
              onClick={onDismissIdea}
              className="absolute right-3 top-3 text-xs text-faint transition-colors hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <NixPose pose="conjuring" size={44} glow={false} float={false} animated={false} />
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-nix">
                  Today
                  {(today?.brandName ?? idea.brandName) && (
                    <span className="ml-1.5 font-normal normal-case tracking-normal text-faint">for {today?.brandName ?? idea.brandName}</span>
                  )}
                </p>

                {today && (
                  <div className="mt-2 rounded-xl border border-gold/25 bg-gold/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold">In the Studio</p>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-white">{today.idea.label}</p>
                    <Link href={studioHrefFor(today.brandId, today.idea)} className="btn-green mt-2 !px-3 !py-1.5 text-xs">
                      Make it
                    </Link>
                    {today.others.length > 0 && (
                      <p className="mt-2 text-[11px] text-faint">
                        Also today:{" "}
                        {today.others.map((o, i) => (
                          <span key={o.brandId}>
                            {i > 0 && " · "}
                            <Link href={studioHrefFor(o.brandId, o.idea)} className="text-muted hover:text-white hover:underline" title={o.idea.label}>
                              {o.brandName}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-nix/80">Content idea</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white">{idea.idea}</p>
                  {isPro && latestBrandId && (
                    <Link
                      href={`/dashboard/creator-pro?brandId=${latestBrandId}`}
                      className="mt-1 inline-block text-xs text-primary-light hover:underline"
                    >
                      Write it now →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Trophy Shelf */}
      <BadgeShelf stats={badgeStats} compact />

      {/* Plan card */}
      {!isPro ? (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <span className="badge-purple !px-2.5 !py-0.5 text-[11px]">Creator Pro · $19/mo</span>
          <p className="mt-2 font-display text-base font-bold leading-snug text-white">Your full AI marketing department</p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            <li className="flex gap-2"><span className="text-secondary">✓</span> 1,000 Creative Energy every month</li>
            <li className="flex gap-2"><span className="text-secondary">✓</span> Posts, blogs, emails and ad copy</li>
            <li className="flex gap-2"><span className="text-secondary">✓</span> Unlimited brand kits</li>
          </ul>
          {/* The dashboard's one spark: the buy action. */}
          <Link href="/pricing" className="btn-primary mt-3 w-full !py-2.5 text-sm">
            Upgrade to Creator Pro
          </Link>
          <p className="mt-2 text-center text-[11px] text-faint">Cancel anytime</p>
        </section>
      ) : (
        <Link
          href="/dashboard/creator-pro"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-[rgba(250,247,242,0.08)] bg-surface p-4 transition-colors hover:border-primary/40"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-light">Creator Pro</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Need words? Posts, blogs, emails, ads.</p>
          </div>
          <span className="shrink-0 text-muted transition-colors group-hover:text-white">→</span>
        </Link>
      )}
    </div>
  );
}

// ── Phone strip: streak · energy · plan, right under the greeting ─────────────

export function MobileStrip({
  mounted,
  streak,
  energy,
  isPro,
  isMax,
  onRefill,
}: {
  mounted: boolean;
  streak: number;
  energy: EnergyData | null;
  isPro: boolean;
  isMax: boolean;
  onRefill: () => void;
}) {
  const e = energyView(energy);
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-[rgba(250,247,242,0.08)] bg-surface px-4 py-3 lg:hidden">
      <div className="text-center">
        <p className="font-display text-lg font-bold leading-none tabular-nums text-gold">{mounted ? streak : 1}</p>
        <p className="mt-0.5 text-[10px] text-faint">streak</p>
      </div>
      <button type="button" onClick={onRefill} className="min-w-0 text-left" aria-label="Creative Energy, tap to refill">
        <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-white">⚡ {energy ? e.total.toLocaleString() : "…"}</span>
          <span className="text-faint">{e.overMax ? "fully charged" : e.allowance > 0 ? `of ${e.allowance.toLocaleString()}` : "energy"}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${e.pct}%`, backgroundColor: e.barColor }} />
        </div>
      </button>
      <Link href={isPro ? "/settings" : "/pricing"} className="rounded-full border border-[rgba(250,247,242,0.12)] px-2.5 py-1 text-[11px] font-semibold text-white">
        {isMax ? "Max" : isPro ? "Pro" : "Free"}
      </Link>
    </div>
  );
}
