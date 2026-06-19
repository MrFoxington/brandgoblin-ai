"use client";

/**
 * <Reveal> — staggered entrance wrapper
 * Respects prefers-reduced-motion.
 * Supports first-run (cinematic) vs returning (fast) pacing.
 * Always renders a skip/reveal-all button when in stagger mode.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { globalSoundFx } from "./SoundFx";
import { trackEvent, msOnPage } from "@/lib/analytics";

// ── Context ──────────────────────────────────────────────────────────────────

interface RevealContextValue {
  revealed: boolean;
  revealAll: () => void;
  isFirstRun: boolean;
  brandId?: string;
}

const RevealContext = createContext<RevealContextValue>({
  revealed: false,
  revealAll: () => {},
  isFirstRun: false,
});

export function useReveal() {
  return useContext(RevealContext);
}

// ── Seen-flag helpers ─────────────────────────────────────────────────────────

const SEEN_KEY = "brandgoblin_seen_reveal_v1";

function getSeen(): boolean {
  if (typeof window === "undefined") return false;
  try { return !!localStorage.getItem(SEEN_KEY); } catch { return false; }
}

function markSeen() {
  try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* noop */ }
}

// ── RevealProvider ────────────────────────────────────────────────────────────

export function RevealProvider({
  children,
  flagKey,
  brandId,
}: {
  children: ReactNode;
  flagKey?: string;
  brandId?: string;
}) {
  const key = flagKey ? `brandgoblin_seen_${flagKey}` : SEEN_KEY;
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const shouldReduce = useReducedMotion();
  const revealCompleteFired = useRef(false);

  useEffect(() => {
    const seen = (() => {
      try { return !!localStorage.getItem(key); } catch { return false; }
    })();
    setIsFirstRun(!seen);
    if (seen || shouldReduce) setRevealed(true);
  }, [key, shouldReduce]);

  const revealAll = useCallback(() => {
    setRevealed(true);
    try { localStorage.setItem(key, "1"); } catch { /* noop */ }
  }, [key]);

  // Skip button handler — fires reveal_skipped event
  const revealAllWithTracking = useCallback(() => {
    revealAll();
    trackEvent("reveal_skipped", { brandId, timeOnPageMs: msOnPage() });
  }, [revealAll, brandId]);

  // Mark seen after 5s into first-run cinematic; fire reveal_completed
  useEffect(() => {
    if (!isFirstRun) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(key, "1"); } catch { /* noop */ }
    }, 5000);
    return () => clearTimeout(t);
  }, [isFirstRun, key]);

  // Fire reveal_completed when the reveal settles naturally (revealed flips true without skip)
  useEffect(() => {
    if (revealed && isFirstRun && !revealCompleteFired.current) {
      revealCompleteFired.current = true;
      trackEvent("reveal_completed", { brandId, timeOnPageMs: msOnPage() });
    }
  }, [revealed, isFirstRun, brandId]);

  return (
    <RevealContext.Provider value={{ revealed, revealAll: revealAllWithTracking, isFirstRun, brandId }}>
      {children}
    </RevealContext.Provider>
  );
}

// ── SkipRevealButton ──────────────────────────────────────────────────────────

export function SkipRevealButton() {
  const { revealed, revealAll } = useReveal();
  if (revealed) return null;
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      onClick={revealAll}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/20 bg-[rgba(12,10,24,0.9)] backdrop-blur-md px-5 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/40 transition-colors shadow-lg"
    >
      Skip ✨ Reveal all
    </motion.button>
  );
}

// ── RevealCard ────────────────────────────────────────────────────────────────

interface RevealCardProps {
  children: ReactNode;
  index?: number;
  /** First-run stagger delay per card in ms. Default 60. */
  staggerMs?: number;
  /** Returning-user stagger delay. Default 25. */
  fastStaggerMs?: number;
  className?: string;
}

export function RevealCard({
  children,
  index = 0,
  staggerMs = 60,
  fastStaggerMs = 25,
  className,
}: RevealCardProps) {
  const { revealed, isFirstRun } = useReveal();
  const shouldReduce = useReducedMotion();
  const delay = revealed ? 0 : (isFirstRun ? staggerMs : fastStaggerMs) * index / 1000;
  const didPlay = useRef(false);

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  function handleAnimationComplete() {
    // Play a soft chime on first-run card entrances (index > 0 = skip header card)
    // Only once per card mount so re-renders don't re-fire
    if (isFirstRun && index > 0 && !revealed && !didPlay.current) {
      didPlay.current = true;
      globalSoundFx.playReveal();
    }
  }

  return (
    <motion.div
      className={className}
      initial={revealed ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      onAnimationComplete={handleAnimationComplete}
    >
      {children}
    </motion.div>
  );
}

// ── Convenience: markRevealSeen ───────────────────────────────────────────────
export { markSeen as markRevealSeen, getSeen as hasSeenReveal };
