"use client";

import { motion, useReducedMotion } from "framer-motion";

const IDEAS = [
  "a calm, science-backed skincare brand",
  "a finance newsletter for 20-somethings",
  "a specialty coffee roaster",
  "a productivity app for ADHD founders",
  "a sustainable activewear label",
  "a coworking space for freelancers",
  "hot sauce for people who cry at movies",
  "a pet brand with main character energy",
];

export default function IdeaSparkSection() {
  const shouldReduce = useReducedMotion();

  function injectIdea(idea: string) {
    window.dispatchEvent(new CustomEvent("nix-idea", { detail: idea }));
    // Smooth scroll to hero input
    const hero = document.getElementById("hero-input");
    if (hero) hero.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <span className="badge-green mb-6">Not sure what to build?</span>
        <h2 className="section-heading mb-4">
          Nix has <span className="gradient-text">ideas.</span>
        </h2>
        <p className="section-sub mb-10 max-w-xl mx-auto">
          Click any idea below — Nix will build a brand for it instantly.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {IDEAS.map((idea, i) => (
            <motion.button
              key={idea}
              onClick={() => injectIdea(idea)}
              initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              whileHover={shouldReduce ? {} : { scale: 1.05 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              className="rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-sm text-white/80 hover:border-primary/60 hover:bg-primary/20 hover:text-white transition-colors cursor-pointer"
            >
              {idea}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
