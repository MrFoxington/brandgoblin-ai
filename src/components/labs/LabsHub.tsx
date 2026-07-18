"use client";

/**
 * 🧪 LabsHub — the Goblin Labs landing surface (Phase 0c shell, July 17 2026).
 * Nix's laboratory: experiments ship here first, rough edges are part of the
 * charm, and winners graduate to Studio. Experiment 001 (Brand Videos) goes
 * interactive in Phase 1 — this shell sets the stage.
 *
 * Nix pose: conjuring-nix.png (✅ live asset). Swap to scientist-nix.png when
 * Fox drops it (ASSET_MAP wants it — NEVER generate Nix, rule #1).
 */

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

interface Experiment {
  code: string;
  icon: string;
  title: string;
  desc: string;
  status: "brewing" | "pipeline";
  statusLabel: string;
}

const EXPERIMENTS: Experiment[] = [
  {
    code: "EXPERIMENT 001",
    icon: "🎬",
    title: "Brand Videos",
    desc: "Animate your creations. Your product breathes, your mascot waves, your logo comes alive — short, punchy vertical clips born TikTok-ready.",
    status: "brewing",
    statusLabel: "⚗️ Brewing — engines wired, coming online",
  },
  {
    code: "EXPERIMENT 002",
    icon: "⚡",
    title: "Bring Your Mascot to Life",
    desc: "Strap your mascot to the table and pull the lever — it blinks, it waves, it walks. IT'S ALIVE. Unmistakably yours, now in motion.",
    status: "pipeline",
    statusLabel: "🔮 In the pipeline",
  },
  {
    code: "EXPERIMENT 003",
    icon: "🌀",
    title: "Viral Effects",
    desc: "One-tap video magic on any creation — the weird, wonderful stuff feeds are made of.",
    status: "pipeline",
    statusLabel: "🔮 In the pipeline",
  },
];

export default function LabsHub() {
  const reduce = useReducedMotion();

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
      >
        ← Back to Brand Vault
      </Link>

      {/* ── Lab header — the BADGE is the arrival moment (Fox, July 18 2026:
          "as soon as people click Labs they see this — I'm in the lab now").
          Big, centered, glowing, gently floating. ── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-8 text-center"
      >
        <motion.div
          animate={reduce ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* soft creative-energy glow behind the badge */}
          <div aria-hidden className="absolute inset-0 scale-110 rounded-full bg-primary/25 blur-3xl motion-safe:animate-pulse" />
          <div aria-hidden className="absolute inset-8 rounded-full bg-secondary/20 blur-2xl" />
          <Image
            src="/badges/goblin-labs-badge.png"
            alt="Goblin Labs — where future magic is forged"
            width={288}
            height={288}
            className="relative h-auto w-56 sm:w-72 drop-shadow-[0_0_35px_rgba(139,92,246,0.55)]"
            priority
          />
        </motion.div>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
            Founder Preview
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mb-2">
            Welcome to the Lab
          </h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Nix&apos;s laboratory — where the magic is brewed.
          </p>
        </div>
      </motion.div>

      {/* ── Experiment cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERIMENTS.map((exp, i) => (
          <motion.div
            key={exp.code}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.1 + i * 0.08 }}
            className={`relative rounded-2xl border p-6 ${
              exp.status === "brewing"
                ? "border-secondary/40 bg-secondary/5"
                : "border-white/8 bg-white/3"
            }`}
          >
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-faint">
              {exp.code}
            </p>
            <p className="text-3xl mb-3">{exp.icon}</p>
            <h2 className="font-display text-lg font-black text-white mb-2">{exp.title}</h2>
            <p className="text-xs text-muted mb-4 leading-relaxed">{exp.desc}</p>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                exp.status === "brewing"
                  ? "bg-secondary/15 text-secondary motion-safe:animate-pulse"
                  : "bg-white/5 text-faint"
              }`}
            >
              {exp.statusLabel}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Lab rules (trust, manifesto-flavored) ── */}
      <p className="mt-8 text-center text-xs text-faint">
        Lab rules: experiments use the same Creative Energy as everything else · transparent
        pricing before every conjure · your creations are always yours.
      </p>
    </div>
  );
}
