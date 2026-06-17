"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  { icon: "🧌", text: "Summoning your brand…" },
  { icon: "✨", text: "Crafting your story…" },
  { icon: "🎨", text: "Designing your identity…" },
  { icon: "💬", text: "Writing your taglines…" },
  { icon: "📣", text: "Writing your launch message…" },
  { icon: "🚀", text: "Preparing your launch kit…" },
  { icon: "🎯", text: "Sharpening your brand voice…" },
  { icon: "🌟", text: "Polishing every last detail…" },
];

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const current = MESSAGES[index];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center px-4">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
            animation: "pulse-glow 2.2s ease-in-out infinite",
          }}
        />
        <span className="animate-float text-7xl logo-glow" key={index} style={{ animation: "crystal-float 3.2s ease-in-out infinite" }}>
          {current.icon}
        </span>
      </div>

      <div className="space-y-2">
        <p className="font-display text-2xl font-bold text-white">{current.text}</p>
        <p className="text-sm text-muted">
          Your idea is becoming a brand. This takes about a minute.
        </p>
      </div>

      <div className="flex gap-1.5">
        {MESSAGES.map((_, i) => (
          <span
            key={i}
            className="block h-1 rounded-full transition-all duration-500"
            style={{
              width: i === index ? "24px" : "6px",
              background: i === index ? "var(--color-primary-light, #a78bfa)" : "rgba(167,139,250,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
