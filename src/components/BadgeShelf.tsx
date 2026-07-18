"use client";

/**
 * 🏆 BadgeShelf — the Trophy Shelf (July 18 2026, Fox's collector-badge idea).
 * Lives on the dashboard where users see it every day. Earned badges glow on
 * the shelf; locked slots tease the next quest; tap any badge for the
 * fullscreen trophy view. Art auto-lights-up: when a conjured emblem PNG lands
 * at /badges/achievements/<id>.png it replaces the emoji fallback — no code
 * change per badge. (Future Feel Plan pass: spin/float/particle effects.)
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { computeBadges, type BadgeStats, type BadgeState } from "@/lib/badges";

const STREAK_KEY = "brandgoblin_streak_v1"; // same key DailyCreatorDashboard maintains

function readStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { count?: number };
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

/** Badge medallion with graceful art fallback (emoji until the PNG exists). */
function BadgeArt({ badge, size, dim }: { badge: BadgeState; size: number; dim: boolean }) {
  const [artMissing, setArtMissing] = useState(false);

  if (artMissing) {
    return (
      <span
        className={`flex items-center justify-center rounded-full border ${
          dim ? "border-white/10 bg-white/5 grayscale opacity-50" : "border-[#D4AF37]/50 bg-primary/15"
        }`}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        aria-hidden
      >
        {badge.icon}
      </span>
    );
  }

  return (
    <Image
      src={badge.art}
      alt={badge.title}
      width={size}
      height={size}
      className={`h-auto ${dim ? "grayscale opacity-40" : ""}`}
      style={{ width: size }}
      onError={() => setArtMissing(true)}
      unoptimized
    />
  );
}

export default function BadgeShelf({ stats }: { stats: BadgeStats }) {
  const reduce = useReducedMotion();
  const [streakDays, setStreakDays] = useState(0);
  const [selected, setSelected] = useState<BadgeState | null>(null);

  // Streak lives client-side — merge it in after mount.
  useEffect(() => {
    setStreakDays(readStreak());
  }, []);

  const badges = useMemo(
    () => computeBadges({ ...stats, streakDays }),
    [stats, streakDays]
  );

  const earnedCount = badges.filter((b) => b.earned).length;
  // The next quest: first unearned badge that's actually earnable today.
  const nextBadge = badges.find((b) => !b.earned && !b.comingSoon);

  return (
    <>
      <section className="rounded-2xl border border-[#D4AF37]/20 bg-white/3 p-5 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h2 className="font-display font-bold text-white text-sm">Trophy Shelf</h2>
          </div>
          <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-0.5 text-xs font-semibold text-[#E9C75A] tabular-nums">
            {earnedCount}/{badges.length} collected
          </span>
        </div>

        {/* The shelf */}
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {badges.map((b, i) => (
            <motion.button
              key={b.id}
              type="button"
              onClick={() => setSelected(b)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : i * 0.04 }}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
              aria-label={`${b.title} — ${b.earned ? "earned" : "locked"}`}
            >
              <span
                className={`relative flex items-center justify-center rounded-full p-1 transition-transform group-hover:scale-110 group-active:scale-95 ${
                  b.earned
                    ? "drop-shadow-[0_0_14px_rgba(212,175,55,0.45)]"
                    : ""
                }`}
              >
                <BadgeArt badge={b} size={64} dim={!b.earned} />
                {!b.earned && (
                  <span className="absolute -bottom-0.5 -right-0.5 text-[11px]" aria-hidden>
                    {b.comingSoon ? "🔮" : "🔒"}
                  </span>
                )}
              </span>
              <span className={`text-[10px] leading-tight text-center ${b.earned ? "text-[#E9C75A] font-semibold" : "text-faint"}`}>
                {b.title}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Next quest strip */}
        {nextBadge && (
          <Link
            href={nextBadge.href}
            className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 hover:border-primary/40 transition-colors"
          >
            <span className="text-xs text-muted">
              <span className="text-faint font-medium">Next badge:</span>{" "}
              <span className="font-semibold text-white">{nextBadge.title}</span>
              {" "}— {nextBadge.hint}
              {nextBadge.progress && (
                <span className="text-[#E9C75A] font-semibold tabular-nums">
                  {" "}({nextBadge.progress.current}/{nextBadge.progress.target})
                </span>
              )}
            </span>
            <span className="shrink-0 text-secondary text-xs font-semibold">Go →</span>
          </Link>
        )}
      </section>

      {/* ── Fullscreen trophy view ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="badge-modal"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.9, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
              className="relative flex max-w-sm flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute -top-2 -right-2 z-10 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-sm text-white hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>

              <motion.div
                animate={reduce || !selected.earned ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6"
              >
                {selected.earned && (
                  <>
                    <div aria-hidden className="absolute inset-0 scale-110 rounded-full bg-[#D4AF37]/25 blur-3xl motion-safe:animate-pulse" />
                    <div aria-hidden className="absolute inset-8 rounded-full bg-primary/25 blur-2xl" />
                  </>
                )}
                <div className={selected.earned ? "relative drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" : "relative"}>
                  <BadgeArt badge={selected} size={256} dim={!selected.earned} />
                </div>
              </motion.div>

              {selected.earned ? (
                <span className="mb-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C75A]">
                  ✦ Earned ✦
                </span>
              ) : (
                <span className="mb-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-faint">
                  {selected.comingSoon ? "🔮 Coming soon" : "🔒 Locked"}
                </span>
              )}

              <h3 className="font-display text-2xl font-black text-white mb-2">{selected.title}</h3>
              <p className="text-sm text-muted mb-4 max-w-xs">
                {selected.earned ? selected.desc : selected.hint}
                {!selected.earned && selected.progress && (
                  <span className="block mt-1 text-[#E9C75A] font-semibold tabular-nums">
                    {selected.progress.current}/{selected.progress.target}
                  </span>
                )}
              </p>

              {!selected.earned && !selected.comingSoon && (
                <Link
                  href={selected.href}
                  className="btn-primary px-5 py-2.5 text-sm"
                  onClick={() => setSelected(null)}
                >
                  ✦ Start the quest →
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
