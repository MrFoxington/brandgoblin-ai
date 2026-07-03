"use client";

/**
 * RefillCelebration — full celebration moment after an energy refill.
 * Replaces the old auto-dismissing RefillSuccessBanner. Fetches the live
 * balance so the number is fresh, animates the energy bar filling up with a
 * sparkle burst, plays the celebration fanfare (muteable), and strips
 * ?refill=success from the URL so a refresh doesn't replay it.
 *
 * Rendered inside a relatively-positioned <main>; uses an absolute overlay
 * (NOT position:fixed) so the layout keeps its flow height.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getCapacityEstimates } from "@/lib/energy-config";
import { useSoundFx } from "@/components/primitives/SoundFx";

interface BalanceShape {
  totalRemaining?: number;
  monthlyAllowance?: number;
  refillRemaining?: number;
  percentRemaining?: number;
}

const SPARKLES = [
  { x: -120, y: -90, d: 0 },
  { x: 110, y: -70, d: 0.08 },
  { x: -90, y: 60, d: 0.16 },
  { x: 130, y: 50, d: 0.12 },
  { x: 0, y: -130, d: 0.2 },
  { x: -150, y: -10, d: 0.06 },
  { x: 150, y: -20, d: 0.18 },
  { x: 40, y: 110, d: 0.24 },
];

export default function RefillCelebration({ contentGeneratorId = "content-generator" }: { contentGeneratorId?: string }) {
  const reduce = useReducedMotion();
  const { playLevelUp } = useSoundFx();

  const [visible, setVisible] = useState(true);
  const [balance, setBalance] = useState<BalanceShape | null>(null);
  const [barFilled, setBarFilled] = useState(false);

  // Fetch the NEW balance on mount — never trust stale props.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/energy/balance", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as BalanceShape;
        if (!cancelled) setBalance(data);
      } catch {
        /* fail soft — overlay still shows with celebratory copy */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Strip ?refill=success so a refresh won't replay the celebration.
  // IMPORTANT: use history.replaceState, NOT router.replace. router.replace
  // re-renders the server page without the query param, which unmounted this
  // overlay before the user ever saw it (the "celebration never shows" bug).
  // history.replaceState updates the URL only, so the overlay stays up.
  useEffect(() => {
    window.history.replaceState(null, "", "/dashboard/creator-pro");
  }, []);

  // Play the celebration fanfare once the balance is in (respects global mute).
  useEffect(() => {
    if (balance) playLevelUp();
  }, [balance, playLevelUp]);

  const total = balance?.totalRemaining ?? 0;
  const allowance = balance?.monthlyAllowance ?? 0;
  const refill = balance?.refillRemaining ?? 0;

  // Bar fills from the pre-refill level up to the new total (as % of allowance).
  const newPct = allowance > 0 ? Math.min(100, Math.round((total / allowance) * 100)) : 100;
  const prevPct = allowance > 0 ? Math.min(100, Math.max(0, Math.round(((total - refill) / allowance) * 100))) : 0;

  const capacityLine = useMemo(() => {
    if (!balance || total <= 0) return null;
    const estimates = getCapacityEstimates(total);
    return estimates[0] ? `Enough for ${estimates[0]}` : null;
  }, [balance, total]);

  // Trigger the bar fill after first paint (or instantly if reduced motion).
  useEffect(() => {
    if (!balance) return;
    if (reduce) { setBarFilled(true); return; }
    const t = setTimeout(() => setBarFilled(true), 350);
    return () => clearTimeout(t);
  }, [balance, reduce]);

  function dismiss() {
    setVisible(false);
    // Scroll to the content generator so the next action is obvious.
    requestAnimationFrame(() => {
      document.getElementById(contentGeneratorId)?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="refill-celebration"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.25 } }}
          className="absolute inset-0 z-50 flex min-h-full items-center justify-center bg-bg/85 backdrop-blur-sm px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label="Creative Energy refilled"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-lg rounded-3xl border border-green-500/30 bg-card/95 px-8 py-10 text-center shadow-glow overflow-hidden"
          >
            {/* Sparkle burst */}
            {!reduce && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {SPARKLES.map((s, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-xl select-none"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0.4, 1.1, 0.6] }}
                    transition={{ duration: 1.1, delay: 0.3 + s.d, ease: "easeOut" }}
                  >
                    ✦
                  </motion.span>
                ))}
              </div>
            )}

            {/* Celebrating Nix */}
            <div className="relative mb-4 flex justify-center">
              <motion.div
                animate={reduce ? {} : { y: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/nix/celebrating-nix.png"
                  alt="Nix celebrating your refilled Creative Energy"
                  width={180}
                  height={180}
                  className="drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                  priority
                />
              </motion.div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-2">
              ⚡ You&apos;re brimming with Creative Energy!
            </h2>

            {capacityLine && (
              <p className="text-sm font-semibold text-green-300 mb-6">{capacityLine}</p>
            )}

            {/* Energy bar filling up */}
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Creative Energy</span>
              {balance && allowance > 0 && (
                <span className="tabular-nums font-semibold text-white">
                  {total.toLocaleString()}
                  <span className="text-faint font-normal"> / {allowance.toLocaleString()}</span>
                </span>
              )}
            </div>
            <div className="mb-8 h-3 w-full rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: `${reduce ? newPct : prevPct}%` }}
                animate={{ width: `${barFilled ? newPct : prevPct}%` }}
                transition={reduce ? { duration: 0 } : { duration: 1.1, ease: "easeOut", delay: 0.05 }}
              />
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="btn-primary w-full py-3 text-base"
            >
              ✦ Let&apos;s build →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
