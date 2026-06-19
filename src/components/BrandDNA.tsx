"use client";

import { motion } from "framer-motion";
import type { BrandKit, BrandInput } from "@/types";

interface DNAScore {
  label: string;
  score: number;
  description: string;
  color: string;
}

function computeScores(kit: BrandKit, input: BrandInput): DNAScore[] {
  const traits = input.brandTraits ?? [];
  const vibe = input.vibe ?? "";

  const has = (...t: string[]) => t.some((x) => traits.includes(x as never) || vibe.includes(x));

  return [
    {
      label: "Creativity",
      score: has("creative", "playful", "funny", "adventurous") ? 90 : has("bold", "innovative") ? 80 : 70,
      description: "How original and unexpected the brand feels.",
      color: "#a78bfa",
    },
    {
      label: "Memorability",
      score: kit.favoriteName ? 88 : kit.recommendedName?.length < 8 ? 85 : 75,
      description: "Will customers remember the name tomorrow?",
      color: "#f59e0b",
    },
    {
      label: "Professionalism",
      score: has("professional", "trustworthy", "sophisticated", "premium") ? 92 : has("minimalist", "elegant") ? 85 : 72,
      description: "How polished and credible the brand appears.",
      color: "#34d399",
    },
    {
      label: "Luxury Feel",
      score: has("luxury", "premium", "sophisticated", "elegant") ? 94 : has("minimalist") ? 78 : 60,
      description: "Does it feel high-end and aspirational?",
      color: "#f472b6",
    },
    {
      label: "Playfulness",
      score: has("playful", "funny", "friendly", "approachable") ? 91 : has("energetic", "bold") ? 75 : 58,
      description: "How fun and inviting the brand personality feels.",
      color: "#fb923c",
    },
    {
      label: "Virality",
      score: has("funny", "bold", "rebellious", "energetic") ? 87 : has("creative", "innovative") ? 78 : 65,
      description: "Potential to spread organically on social media.",
      color: "#38bdf8",
    },
    {
      label: "Audience Match",
      score: input.targetAudience ? 85 : 72,
      description: "How well the brand resonates with your target market.",
      color: "#4ade80",
    },
    {
      label: "Visual Strength",
      score: kit.colorPalette?.length >= 4 ? 88 : kit.colorPalette?.length >= 3 ? 80 : 74,
      description: "How strong and cohesive the visual identity is.",
      color: "#e879f9",
    },
  ];
}

function ScoreBar({ score, color, index }: { score: number; color: string; index: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ delay: 0.3 + index * 0.08, duration: 0.9, ease: "easeOut" }}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export default function BrandDNA({ kit, input }: { kit: BrandKit; input: BrandInput }) {
  const scores = computeScores(kit, input);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary/20 bg-white/2 p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧬</span>
        <div>
          <h2 className="font-display text-lg font-black text-white">Brand DNA</h2>
          <p className="text-xs text-muted">How your brand scores across key dimensions</p>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-4">
        {scores.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{s.label}</span>
              <motion.span
                className="text-xs font-bold tabular-nums"
                style={{ color: s.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                {s.score}
              </motion.span>
            </div>
            <ScoreBar score={s.score} color={s.color} index={i} />
            <p className="text-xs text-faint">{s.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="pt-3 border-t border-white/8 flex items-center justify-between"
      >
        <span className="text-sm font-bold text-white">Overall Brand Strength</span>
        <span className="font-display text-2xl font-black text-primary-light">
          {Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)}
          <span className="text-sm font-normal text-muted">/100</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
