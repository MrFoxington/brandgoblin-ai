"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const STATUS_LINES = [
  "Let me cook that up for you…",
  "Stirring in your color palette…",
  "Ooh, this is smelling good…",
  "Adding a pinch of magic…",
  "Almost there…",
];

interface Props {
  count: number;
}

export default function NixCooking({ count }: Props) {
  const reduce = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 2500);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 flex flex-col items-center gap-4 text-center">
      <motion.div
        animate={reduce ? {} : { y: [0, -8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
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

      {/* Shimmer progress bar */}
      <div className="w-full max-w-xs h-1.5 rounded-full bg-white/8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
