"use client";

/**
 * <Sparkles> — perf-aware ambient particle effect
 * Pauses when off-screen via IntersectionObserver.
 * Respects prefers-reduced-motion (renders nothing).
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const GLYPHS = ["✦", "✨", "⭐", "💫", "⚡", "◆"];

interface Particle {
  id: number;
  x: number;
  y: number;
  glyph: string;
  size: number;
  delay: number;
  duration: number;
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    size: 10 + Math.random() * 10,
    delay: Math.random() * 4,
    duration: 2.5 + Math.random() * 2,
  }));
}

interface SparklesProps {
  count?: number;
  className?: string;
  /** Color of particles. Defaults to text-primary-light. */
  color?: string;
}

export default function Sparkles({ count = 10, className = "", color = "rgba(167,139,250,0.8)" }: SparklesProps) {
  const shouldReduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [particles] = useState(() => makeParticles(count));

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (shouldReduce) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {visible && particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, color }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0], y: -40 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 1,
            ease: "easeOut",
          }}
        >
          {p.glyph}
        </motion.span>
      ))}
    </div>
  );
}
