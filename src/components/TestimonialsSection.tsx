"use client";

import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    initials: "MT",
    name: "Maya T.",
    role: "Skincare Founder",
    gradient: "from-violet-500 to-purple-700",
    quote: "I spent 3 weeks trying to nail my brand with ChatGPT. Prompting, tweaking, starting over. With BrandGoblin I had a complete launch kit in 47 minutes. I genuinely cried. Actual tears.",
    stat: "⏱ Full brand kit in 47 min",
    stars: 5,
  },
  {
    initials: "CR",
    name: "Carlos R.",
    role: "Fitness App Developer",
    gradient: "from-blue-500 to-indigo-600",
    quote: "As a dev I could build the app, but branding? Zero clue. Nix gave me a name, voice guide, color palette, and launch strategy that looked like it cost $10K. My investors thought I hired an agency.",
    stat: "💰 Saved ~$8,000 in agency fees",
    stars: 5,
  },
  {
    initials: "PS",
    name: "Priya S.",
    role: "Brand Agency Owner",
    gradient: "from-emerald-500 to-teal-600",
    quote: "I use BrandGoblin for every new client brief. What used to take a week of discovery calls and strategy docs now takes one afternoon. My clients think I'm a genius. I'm not going to argue.",
    stat: "⚡ 5× faster client onboarding",
    stars: 5,
  },
  {
    initials: "JK",
    name: "Jordan K.",
    role: "E-commerce Founder",
    gradient: "from-amber-500 to-orange-600",
    quote: "The brand voice guide alone was worth every penny. My Instagram engagement jumped 40% because I finally sound like a real brand with a point of view — not someone winging it with random posts.",
    stat: "📈 +40% Instagram engagement",
    stars: 5,
  },
  {
    initials: "AM",
    name: "Aisha M.",
    role: "Fashion Label Founder",
    gradient: "from-pink-500 to-rose-600",
    quote: "Name, colors, brand story, launch posts — all in 90 seconds. I showed my co-founder and she literally didn't believe it was AI. We launched two weeks later with zero branding budget.",
    stat: "🚀 Full brand kit in 90 seconds",
    stars: 5,
  },
  {
    initials: "DW",
    name: "Devon W.",
    role: "Content Creator",
    gradient: "from-cyan-500 to-blue-600",
    quote: "I've tried every AI tool — Jasper, Copy.ai, you name it. BrandGoblin is the only one that understood I'm building an identity, not just generating content. That difference is everything.",
    stat: "🎯 First brand, launched in 3 days",
    stars: 5,
  },
];

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-28 bg-section-alt">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="badge-purple mb-6">⭐ Real Founders. Real Results.</span>
          <h2 className="section-heading mb-4">
            They stopped guessing and <span className="gradient-text">launched</span>
          </h2>
          <p className="section-sub max-w-2xl mx-auto">
            From one-person startups to agencies managing dozens of brands. Here&rsquo;s what they built with Nix.
          </p>
        </div>

        {/* Aggregate social proof */}
        <div className="mb-12 flex flex-wrap justify-center gap-8 text-center">
          {[
            { val: "2,400+", label: "brands generated" },
            { val: "4.9/5", label: "average rating" },
            { val: "< 2 min", label: "average generation time" },
            { val: "$0", label: "to get started" },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="font-display text-3xl font-black text-white">{val}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-600 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5 text-yellow-400 text-sm">
                {"★".repeat(t.stars)}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm text-muted leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Stat pill */}
              <div className="mb-5 inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary-light">
                {t.stat}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
                <div className="ml-auto text-lg">🧌</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-xs text-faint">
          ✦ These are representative testimonials. Real customer names and photos will be added at launch.
        </p>
      </div>
    </section>
  );
}
