"use client";

import { motion, useReducedMotion } from "framer-motion";

const TRUST_SIGNALS = [
  { icon: "🧠", label: "Built by brand strategists" },
  { icon: "⚡", label: "Powered by Claude AI" },
  { icon: "🔒", label: "No card required" },
  { icon: "🧌", label: "Your brands, saved forever" },
];

export default function TestimonialsSection() {
  const shouldReduce = useReducedMotion();

  return (
    <section className="py-24 bg-section-alt">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <span className="badge-purple mb-6">✦ Why We Built This</span>

        {/* Founder note */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-10 mb-12 text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Fox</p>
              <p className="text-xs text-muted">Founder, BrandGoblin AI</p>
            </div>
          </div>
          <blockquote className="text-white/80 leading-relaxed text-base mb-4">
            "I watched too many brilliant people give up on their ideas not because the idea was bad —
            but because turning an idea into a brand felt impossibly expensive, time-consuming, or
            overwhelming. I built Nix because I wanted a world where anyone with a half-formed idea at
            11pm could wake up with a real brand by morning. No agency budget required. No design degree
            needed. Just you, your idea, and a goblin who genuinely cares about making it great."
          </blockquote>
          <p className="text-xs text-faint">BrandGoblin AI is in early access. You're one of the first.</p>
        </motion.div>

        {/* Early adopter framing */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12"
        >
          <h3 className="font-display text-xl font-bold text-white mb-3">
            Be one of the first.
          </h3>
          <p className="text-muted max-w-lg mx-auto text-sm leading-relaxed">
            BrandGoblin is in early access. The people here now are the founding creators —
            the ones who'll look back and say "I was using this before everyone else."
            Real quotes from real creators coming soon. Yours could be next.
          </p>
        </motion.div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-4">
          {TRUST_SIGNALS.map((t, i) => (
            <motion.div
              key={t.label}
              initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-muted"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
