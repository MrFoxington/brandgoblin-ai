"use client";

/**
 * <ScoreBar> — animated score bar
 * Reduced-motion: shows final state instantly, no animation.
 * Tap to see justification.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScoreBarProps {
  label: string;
  score: number;      // 0–100
  color: string;
  why?: string;       // one-line justification from the model
  index?: number;
  delay?: number;
}

export default function ScoreBar({ label, score, color, why, index = 0, delay }: ScoreBarProps) {
  const shouldReduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const resolvedDelay = delay ?? (shouldReduce ? 0 : 0.25 + index * 0.07);

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => why && setOpen((o) => !o)}
        className={`w-full text-left ${why ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-white flex items-center gap-1.5">
            {label}
            {why && <span className="text-[10px] text-faint">{open ? "▲" : "▼"}</span>}
          </span>
          <motion.span
            className="text-xs font-bold tabular-nums"
            style={{ color }}
            initial={shouldReduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: resolvedDelay + 0.4 }}
          >
            {score}
          </motion.span>
        </div>

        <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
          {shouldReduce ? (
            <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
          ) : (
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: resolvedDelay, duration: 0.85, ease: "easeOut" }}
              style={{ backgroundColor: color }}
            />
          )}
        </div>
      </button>

      {open && why && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-faint leading-relaxed pl-1"
        >
          {why}
        </motion.p>
      )}
    </div>
  );
}
