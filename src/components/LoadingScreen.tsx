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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-goblin-purple/30 blur-xl" />
        <span className="animate-float text-6xl">🪄</span>
      </div>
      <p className="text-lg font-semibold text-white">{MESSAGES[index]}</p>
      <p className="text-sm text-zinc-400">This usually takes about a minute or two.</p>
    </div>
  );
}
