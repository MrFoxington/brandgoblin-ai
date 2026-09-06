"use client";

import { useEffect, useRef, useState } from "react";

const DIY = [
  "47 ChatGPT prompts just to get started",
  "6+ hours of back-and-forth edits",
  "Brand voice that sounds different every day",
  "Color palette chosen by vibes and hope",
  "$500 to $5,000 to a branding agency",
  "Copywriter, designer, strategist, all separate",
  "Launch delayed by weeks of 'almost there'",
  "Deliverables that don't feel connected",
];

const NIX = [
  "One prompt. That's it.",
  "Complete brand kit in under 2 minutes",
  "Consistent voice across every deliverable",
  "5-color palette with hex codes and usage rules",
  "$0 to start. Free forever tier.",
  "Names, copy, strategy, visuals, all from Nix",
  "Ready to post, launch, and sell today",
  "12 deliverables that all speak the same language",
];

export default function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-28 sm:py-40 bg-paper-2 border-y border-line">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="eyebrow mb-6">The real difference</span>
          <h2 className="section-heading mb-5 text-4xl sm:text-5xl">
            Stop doing it the <span className="accent">hard way</span>
          </h2>
          <p className="section-sub max-w-2xl mx-auto">
            Every founder thinks they can just &ldquo;prompt their way&rdquo; to a brand.
            Here&rsquo;s what that actually looks like, next to what Nix delivers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* DIY Column */}
          <div
            className={`rounded-2xl border border-line-2 bg-white p-8 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint font-bold">The DIY way</p>
              <p className="text-sm text-ink-muted">ChatGPT + Canva + Fiverr + vibes</p>
            </div>
            <ul className="space-y-3">
              {DIY.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${i * 60 + 100}ms` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-3 text-xs text-ink-faint font-bold">✕</span>
                  <span className="text-sm text-ink-muted leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-paper-2 border border-line p-4">
              <p className="text-sm font-bold text-ink">Average time: 6 to 40 hours</p>
              <p className="text-xs text-ink-muted mt-1">If you even finish. Most founders give up or ship something they hate.</p>
            </div>
          </div>

          {/* Nix Column */}
          <div
            className={`rounded-2xl border border-goblin/50 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(46,125,91,0.35)] ring-1 ring-goblin/20 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-goblin font-bold">The Nix way</p>
              <p className="text-sm text-ink-muted">One prompt. A brand that holds together.</p>
            </div>
            <ul className="space-y-3">
              {NIX.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                  style={{ transitionDelay: `${i * 60 + 150}ms` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-goblin-light text-xs text-goblin-dark font-bold">✓</span>
                  <span className="text-sm text-ink leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-goblin-tint border border-goblin/25 p-4">
              <p className="text-sm font-bold text-goblin-dark">Average time: 1 min 47 sec</p>
              <p className="text-xs text-ink-muted mt-1">12 deliverables. Launch-ready. No designer, no copywriter, no agency retainer.</p>
            </div>
          </div>
        </div>

        {/* Bottom punch */}
        <div className="mt-12 text-center">
          <p className="text-lg text-ink-muted max-w-xl mx-auto">
            <span className="text-ink font-semibold">The difference isn&rsquo;t skill. It&rsquo;s tools.</span>{" "}
            A chatbot answers one question at a time. Nix builds all twelve deliverables together, so your name, colors, voice, and copy actually match.
          </p>
        </div>
      </div>
    </section>
  );
}
