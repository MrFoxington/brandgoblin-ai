"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useSoundFx } from "@/components/primitives/SoundFx";

const STATUS_LINES = [
  "Let me cook that up for you…",
  "Stirring in your color palette…",
  "Ooh, this is smelling good…",
  "Adding a pinch of magic…",
  "Almost there…",
];

// Particle sparks that float up around Nix during the anticipation swell
const PARTICLES = [
  { x: -34, y: -22, d: 0    },
  { x:  30, y: -18, d: 0.35 },
  { x: -20, y:  20, d: 0.18 },
  { x:  38, y:  14, d: 0.5  },
  { x:   4, y: -38, d: 0.22 },
];

const SWELL_DURATION_MS = 18_000; // 18s swell — honest time-based, not fake urgency

interface Props {
  count: number;
}

export default function NixCooking({ count }: Props) {
  const reduce = useReducedMotion();
  const { startAnticipation, stopAnticipation } = useSoundFx();

  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress]   = useState(0);
  const startTimeRef = useRef(Date.now());
  const rafRef       = useRef(0);

  // ── Sound lifecycle: start loop on mount, stop (fade) on unmount ──────────
  useEffect(() => {
    startAnticipation();
    return () => stopAnticipation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Status line rotation ──────────────────────────────────────────────────
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 2500);
    return () => clearInterval(t);
  }, [reduce]);

  // ── Anticipation progress (0 → 1 over SWELL_DURATION_MS) ─────────────────
  // Honest: purely time-based, no fake urgency mechanics
  useEffect(() => {
    if (reduce) return;
    startTimeRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / SWELL_DURATION_MS, 1));
      if (elapsed < SWELL_DURATION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduce]);

  // 3 visual stages — only change at thresholds so framer-motion re-animates minimally
  const stage = progress < 0.4 ? 0 : progress < 0.7 ? 1 : 2;

  const floatY   = stage === 0 ? [0, -8, 0] : stage === 1 ? [0, -12, 0] : [0, -16, 0];
  const floatDur = stage === 2 ? 1.6 : 2.4;

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 flex flex-col items-center gap-4 text-center">

      {/* Nix — float amplitude escalates with stage */}
      <div className="relative">
        <motion.div
          animate={reduce ? {} : { y: floatY }}
          transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/nix/conjuring-nix.png"
            alt="Nix conjuring your image"
            width={96}
            height={96}
            className="object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            priority
          />
        </motion.div>

        {/* Particle sparks — appear at stage 2 */}
        {stage === 2 && !reduce && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {PARTICLES.map((pt, i) => (
              <motion.span
                key={i}
                className="absolute text-[9px] text-primary/60 select-none"
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.75, 0],
                  x: pt.x,
                  y: pt.y - 10,
                  scale: [0.5, 1.1, 0.5],
                }}
                transition={{
                  duration: 1.8,
                  delay: pt.d,
                  repeat: Infinity,
                  repeatDelay: 0.7,
                  ease: "easeOut",
                }}
              >
                ✦
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">
          {count > 1 ? `${count} generations in progress` : "Nix is on it…"}
        </p>
        {reduce ? (
          <p className="text-xs text-muted">Generating your image…</p>
        ) : (
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-xs text-muted"
          >
            {STATUS_LINES[lineIndex]}
          </motion.p>
        )}
      </div>

      {/* Shimmer bar — brightens and fills as stage escalates */}
      <div
        className={`w-full max-w-xs h-1.5 rounded-full overflow-hidden relative transition-colors duration-700 ${
          stage === 2 ? "bg-primary/25" : stage === 1 ? "bg-white/12" : "bg-white/8"
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent ${
            stage === 2 ? "via-primary" : "via-primary/70"
          } to-transparent animate-shimmer`}
        />
      </div>
    </div>
  );
}
