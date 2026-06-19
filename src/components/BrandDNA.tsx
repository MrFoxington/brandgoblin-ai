"use client";

import { motion } from "framer-motion";
import type { BrandKit } from "@/types";
import ScoreBar from "./primitives/ScoreBar";

const LABEL_COLORS: Record<string, string> = {
  "Creativity":          "#a78bfa",
  "Memorability":        "#f59e0b",
  "Market Clarity":      "#34d399",
  "Emotional Resonance": "#f472b6",
  "Virality Potential":  "#38bdf8",
  "Professionalism":     "#4ade80",
  "Playfulness":         "#fb923c",
  "Audience Match":      "#e879f9",
};

export default function BrandDNA({ kit }: { kit: BrandKit }) {
  const scores = kit.brandDna;
  if (!scores || scores.length === 0) return null;

  const overall = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary/20 bg-white/2 p-6 space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧬</span>
          <div>
            <h2 className="font-display text-lg font-black text-white">Brand DNA</h2>
            <p className="text-xs text-muted">Tap any bar to see why it scored that way</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black text-primary-light tabular-nums">
            {overall}<span className="text-sm font-normal text-muted">/100</span>
          </p>
          <p className="text-xs text-faint">Overall strength</p>
        </div>
      </div>

      <div className="space-y-4">
        {scores.map((s, i) => (
          <ScoreBar
            key={s.label}
            label={s.label}
            score={s.score}
            color={LABEL_COLORS[s.label] ?? "#a78bfa"}
            why={s.why}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
