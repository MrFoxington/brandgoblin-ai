"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  {
    pose: "/nix/thinking-nix.png",
    alt: "Nix thinking",
    messages: [
      "Hmm… this idea has potential.",
      "Thinking like your future customers…",
      "Let me dig into this niche…",
    ],
  },
  {
    pose: "/nix/working-nix.png",
    alt: "Nix working",
    messages: [
      "Conjuring brand magic…",
      "Building your identity from scratch…",
      "Crafting something memorable…",
    ],
  },
  {
    pose: "/nix/conjuring-nix.png",
    alt: "Nix conjuring",
    messages: [
      "Ooooh, I found one I really like.",
      "This one might be special.",
      "I can already see the logo…",
    ],
  },
  {
    pose: "/nix/celebrating-nix.png",
    alt: "Nix celebrating",
    messages: [
      "Almost ready — this is a good one.",
      "I'd personally launch with this.",
      "Your brand kit is almost complete!",
    ],
  },
];

// Floating sparkle particle
function Sparkle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: [-20, -60],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 1,
        ease: "easeOut",
      }}
    >
      {["✦", "⭐", "✨", "💫", "⚡"][Math.floor(Math.random() * 5)]}
    </motion.div>
  );
}

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  delay: i * 0.4,
  size: Math.random() * 10 + 12,
}));

export default function LoadingScreen() {
  const [stageIndex, setStageIndex] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => {
        const nextMsg = i + 1;
        if (nextMsg >= STAGES[stageIndex].messages.length) {
          setStageIndex((s) => Math.min(s + 1, STAGES.length - 1));
          return 0;
        }
        return nextMsg;
      });
      setTick((t) => t + 1);
    }, 2800);
    return () => clearInterval(msgTimer);
  }, [stageIndex]);

  const stage = STAGES[stageIndex];
  const message = stage.messages[msgIndex];
  const totalSteps = STAGES.length;

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-10 text-center px-4 overflow-hidden">

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {SPARKLES.map((s) => (
          <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} size={s.size} />
        ))}
      </div>

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(124,58,237,0.2) 0%, transparent 65%)",
        }}
      />

      {/* Nix pose */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.pose}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
              }}
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={stage.pose}
                alt={stage.alt}
                width={200}
                height={200}
                className="relative drop-shadow-[0_0_30px_rgba(124,58,237,0.6)]"
                priority
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Message */}
      <div className="relative z-10 space-y-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${stageIndex}-${msgIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="font-display text-2xl font-bold text-white"
          >
            {message}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-muted">
          Nix is building your complete brand kit — about 60 seconds.
        </p>
      </div>

      {/* Stage progress dots */}
      <div className="relative z-10 flex items-center gap-3">
        {STAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === stageIndex ? 28 : 8,
              backgroundColor: i <= stageIndex
                ? "rgba(167,139,250,1)"
                : "rgba(167,139,250,0.2)",
            }}
            transition={{ duration: 0.4 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-xs text-faint tracking-widest uppercase"
        >
          {["Reading your vision", "Building your brand", "Finding the magic", "Almost ready"][stageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
