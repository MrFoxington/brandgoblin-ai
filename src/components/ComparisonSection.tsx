"use client";

import { useEffect, useRef, useState } from "react";

const DIY = [
  "47 ChatGPT prompts just to get started",
  "6+ hours of back-and-forth edits",
  "Brand voice that sounds different every day",
  "Color palette chosen by vibes and hope",
  "$500–$5,000 to a branding agency",
  "Copywriter, designer, strategist — all separate",
  "Launch delayed by weeks of 'almost there'",
  "Deliverables that don't feel connected",
];

const NIX = [
  "One prompt. That's it.",
  "Complete brand kit in under 2 minutes",
  "Consistent voice across every deliverable",
  "5-color palette with hex codes and usage rules",
  "$0 to start — free forever tier",
  "Names, copy, strategy, visuals — all from Nix",
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
    <section ref={ref} className="py-28 bg-section-alt">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="badge-purple mb-6">✦ The Real Difference</span>
          <h2 className="section-heading mb-4">
            Stop doing it the <span className="text-red-400">hard way</span>
          </h2>
          <p className="section-sub max-w-2xl mx-auto">
            Every founder thinks they can just "prompt their way" to a brand.
            Here&rsquo;s what that actually looks like — vs. what Nix delivers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* DIY Column */}
          <div
            className={`rounded-2xl border border-red-500/20 bg-red-500/5 p-8 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-xl">😤</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-red-400 font-bold">The DIY Way</p>
                <p className="text-sm text-muted">ChatGPT + Canva + Fiverr + vibes</p>
              </div>
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
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400 font-bold">✕</span>
                  <span className="text-sm text-muted leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm font-bold text-red-400">⏱ Average time: 6–40 hours</p>
              <p className="text-xs text-muted mt-1">If you even finish. Most founders give up or ship something they hate.</p>
            </div>
          </div>

          {/* Nix Column */}
          <div
            className={`rounded-2xl border border-primary/30 bg-primary/5 p-8 shadow-glow transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-xl">🧌</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-bold">The Nix Way</p>
                <p className="text-sm text-muted">One prompt. World-class brand.</p>
              </div>
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
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs text-secondary font-bold">✓</span>
                  <span className="text-sm text-white leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-secondary/10 border border-secondary/20 p-4">
              <p className="text-sm font-bold text-secondary">⚡ Average time: 1 min 47 sec</p>
              <p className="text-xs text-muted mt-1">12 deliverables. Launch-ready. No designer, no copywriter, no agency retainer.</p>
            </div>
          </div>
        </div>

        {/* Bottom punch */}
        <div className="mt-12 text-center">
          <p className="text-lg text-muted max-w-xl mx-auto">
            <span className="text-white font-semibold">The difference isn&rsquo;t skill — it&rsquo;s tools.</span>{" "}
            Nix was built by brand strategists, trained on thousands of successful launches. It knows things ChatGPT doesn&rsquo;t.
          </p>
        </div>
      </div>
    </section>
  );
}
