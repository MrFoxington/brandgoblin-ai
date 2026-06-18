"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const MESSAGES = [
  { text: "🧙 Nix is working his magic…" },
  { text: "✨ Crafting your brand story…" },
  { text: "🎨 Designing your identity…" },
  { text: "💬 Writing your taglines…" },
  { text: "📣 Conjuring your launch message…" },
  { text: "🚀 Preparing your launch kit…" },
  { text: "🎯 Sharpening your brand voice…" },
  { text: "🌟 Polishing every last detail…" },
];

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center px-4">
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
            animation: "pulse-glow 2.2s ease-in-out infinite",
          }}
        />
        <Image
          src="/nix/thinking-nix.png"
          alt="Nix is thinking"
          width={180}
          height={180}
          className="relative drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]"
          priority
        />
      </div>

      <div className="space-y-2">
        <p className="font-display text-2xl font-bold text-white">{MESSAGES[index].text}</p>
        <p className="text-sm text-muted">
          Nix is conjuring your complete brand kit. This takes about a minute.
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
