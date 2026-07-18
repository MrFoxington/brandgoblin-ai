"use client";

/**
 * StudioHero — the Studio's arrival moment (July 18 2026), matching the Labs
 * pattern: badge front and center, glowing and gently floating, welcome copy
 * beneath. Badge is the CLEAN emblem (no baked-in text — Fox's call: type on
 * the ribbon fought the art; the hero heading carries the name instead).
 */

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function StudioHero() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col items-center gap-5 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-primary/10 via-transparent to-amber-400/10 p-6 sm:p-8 text-center"
    >
      <motion.div
        animate={reduce ? {} : { y: [0, -9, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* creative-energy glow behind the badge */}
        <div aria-hidden className="absolute inset-0 scale-110 rounded-full bg-primary/25 blur-3xl motion-safe:animate-pulse" />
        <div aria-hidden className="absolute inset-8 rounded-full bg-amber-400/20 blur-2xl" />
        <Image
          src="/badges/goblin-studio-badge.png"
          alt="Goblin Studio — bring your brand to life"
          width={256}
          height={256}
          className="relative h-auto w-48 sm:w-64 drop-shadow-[0_0_32px_rgba(139,92,246,0.5)]"
          priority
        />
      </motion.div>
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white mb-1.5">
          Welcome to the Studio
        </h1>
        <p className="text-sm text-muted max-w-lg mx-auto">
          Bring your brand to life — ⚡ Creative Energy powers every creation:
          logos, social graphics &amp; product art.
        </p>
      </div>
    </motion.div>
  );
}
