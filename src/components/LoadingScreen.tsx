"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NixPose from "./primitives/NixPose";
import type { Pose } from "./primitives/NixPose";
import Sparkles from "./primitives/Sparkles";

export interface GenerationProgress {
  section: string;
  label: string;
  pose: Pose;
  progress: number; // 0–1
}

const IDLE_LINES = [
  "Hmm… this idea has potential.",
  "Thinking like your future customers…",
  "Let me dig into this niche…",
  "Building something memorable…",
  "I can already see the logo…",
];

const ERROR_LINES = [
  "The goblin dropped the scroll.",
  "Nix tripped on a magic bean.",
  "The enchantment fizzled out.",
  "The spell backfired — just a little.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ProgressBar({ value }: { value: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
      {shouldReduce ? (
        <div className="h-full rounded-full bg-primary" style={{ width: `${value * 100}%` }} />
      ) : (
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

interface LoadingScreenProps {
  progress?: GenerationProgress | null;
  error?: string | null;
  onRetry?: () => void;
}

export default function LoadingScreen({ progress, error, onRetry }: LoadingScreenProps) {
  const [idleLabel, setIdleLabel] = useState(IDLE_LINES[0]);
  const [errorLine] = useState(() => randomFrom(ERROR_LINES));
  const shouldReduce = useReducedMotion();

  // Cycle idle messages while waiting for the first real progress event
  useEffect(() => {
    if (progress || error) return;
    let i = 1;
    const t = setInterval(() => {
      setIdleLabel(IDLE_LINES[i % IDLE_LINES.length]);
      i++;
    }, 2600);
    return () => clearInterval(t);
  }, [progress, error]);

  const pose: Pose = error ? "sleeping" : (progress?.pose ?? "thinking");
  const label = error ? errorLine : (progress?.label ?? idleLabel);
  const progressValue = progress?.progress ?? 0;

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center px-4 overflow-hidden">

      {!error && <Sparkles count={10} />}

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: error ? 0.1 : [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: error ? 0 : Infinity, ease: "easeInOut" }}
        style={{
          background: error
            ? "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.15) 0%, transparent 65%)"
            : "radial-gradient(circle at 50% 40%, rgba(124,58,237,0.2) 0%, transparent 65%)",
        }}
      />

      {/* Nix */}
      <div className="relative z-10">
        <NixPose pose={pose} size={200} glow priority />
      </div>

      {/* Message */}
      <div className="relative z-10 space-y-3 max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          <motion.p
            key={label}
            initial={shouldReduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduce ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className={`font-display text-2xl font-bold ${error ? "text-red-400" : "text-white"}`}
          >
            {label}
          </motion.p>
        </AnimatePresence>

        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-muted leading-relaxed">{error}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn-primary !py-2 !px-5 text-sm">
                🔮 Try Again
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {progressValue > 0
              ? `Building section ${Math.round(progressValue * 10)} of 10…`
              : "Nix is building your complete brand kit — about 60 seconds."}
          </p>
        )}
      </div>

      {/* Real progress bar — appears once model starts producing */}
      {!error && progressValue > 0 && (
        <motion.div
          className="relative z-10 w-full max-w-xs space-y-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressBar value={progressValue} />
          <p className="text-xs text-faint tracking-widest uppercase">{progress?.section}</p>
        </motion.div>
      )}

      {/* Pulsing dots while waiting for first model output */}
      {!error && progressValue === 0 && (
        <div className="relative z-10 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary/50"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
