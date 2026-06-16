"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Summoning the goblin council...",
  "Brewing brand names in the cauldron...",
  "Sketching your mascot's mischievous grin...",
  "Mixing the perfect color potion...",
  "Whispering taglines to the void...",
  "Polishing your launch plan...",
  "Sprinkling viral marketing dust...",
];

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
            animation: "pulse-glow 2.2s ease-in-out infinite",
          }}
        />
        <span className="animate-float text-7xl logo-glow">🪄</span>
      </div>
      <p className="font-display text-xl font-bold text-white">{MESSAGES[index]}</p>
      <p className="text-sm text-muted">This usually takes about a minute or two.</p>
    </div>
  );
}
