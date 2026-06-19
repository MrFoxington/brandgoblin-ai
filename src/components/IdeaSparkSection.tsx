"use client";

import { motion, useReducedMotion } from "framer-motion";

const IDEAS = [
  "a meditation app for gamers",
  "hot sauce for people who cry at movies",
  "a finance newsletter for 20-somethings",
  "a coffee brand for night owls",
  "a skincare line that feels like Sunday",
  "a podcast for recovering perfectionists",
  "a travel brand for introverts",
  "a cereal company for adults",
  "a gym for people who hate gyms",
  "a bakery that only bakes at midnight",
  "a plant shop for serial plant killers",
  "an app that texts you like a hype man",
  "a wine brand for people who drink alone on purpose",
  "a dog food brand with a villain arc",
  "a streetwear brand for librarians",
  "a co-working space for extroverted introverts",
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
        <span className="badge-green mb-6">✦ Not sure what to build?</span>
        <h2 className="section-heading mb-4">
          Nix has <span className="gradient-text">ideas.</span>
        </h2>
        <p className="section-sub mb-10 max-w-xl mx-auto">
          Click any idea below — Nix will conjure a brand for it instantly.
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
