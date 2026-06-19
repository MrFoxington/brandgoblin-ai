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

// ── Context ──────────────────────────────────────────────────────────────────

interface RevealContextValue {
  revealed: boolean;
  revealAll: () => void;
  isFirstRun: boolean;
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
}: {
  children: ReactNode;
  flagKey?: string;
}) {
  const key = flagKey ? `brandgoblin_seen_${flagKey}` : SEEN_KEY;
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const shouldReduce = useReducedMotion();

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

  // Mark seen after provider mounts (first-run gets the cinematic, then we remember)
  useEffect(() => {
    if (isFirstRun) {
      const t = setTimeout(() => {
        try { localStorage.setItem(key, "1"); } catch { /* noop */ }
      }, 5000); // mark seen 5s in — they've experienced it
      return () => clearTimeout(t);
    }
  }, [isFirstRun, key]);

  return (
    <RevealContext.Provider value={{ revealed, revealAll, isFirstRun }}>
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

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={revealed ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── Convenience: markRevealSeen ───────────────────────────────────────────────
export { markSeen as markRevealSeen, getSeen as hasSeenReveal };
