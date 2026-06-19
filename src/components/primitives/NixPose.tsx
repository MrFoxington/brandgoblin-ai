"use client";

/**
 * <NixPose> — animated Nix PNG wrapper
 * Handles float, glow, entrance animation.
 * Never generates new art — existing PNGs only.
 */

import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

export type Pose = "thinking" | "working" | "conjuring" | "celebrating" | "sleeping" | "waving";

const POSE_SRCS: Record<Pose, string> = {
  thinking:   "/nix/thinking-nix.png",
  working:    "/nix/working-nix.png",
  conjuring:  "/nix/conjuring-nix.png",
  celebrating:"/nix/celebrating-nix.png",
  sleeping:   "/nix/sleeping-nix.png",
  waving:     "/nix/happy-waving-nix.png",
};

const POSE_ALTS: Record<Pose, string> = {
  thinking:   "Nix thinking",
  working:    "Nix working",
  conjuring:  "Nix conjuring magic",
  celebrating:"Nix celebrating",
  sleeping:   "Nix sleeping",
  waving:     "Nix waving",
};

interface NixPoseProps {
  pose: Pose;
  size?: number;
  float?: boolean;
  glow?: boolean;
  glowColor?: string;
  /** If true wraps in AnimatePresence for cross-fade between poses */
  animated?: boolean;
  priority?: boolean;
  className?: string;
}

export default function NixPose({
  pose,
  size = 160,
  float = true,
  glow = true,
  glowColor = "rgba(124,58,237,0.55)",
  animated = true,
  priority = false,
  className = "",
}: NixPoseProps) {
  const shouldReduce = useReducedMotion();

  const img = (
    <Image
      src={POSE_SRCS[pose]}
      alt={POSE_ALTS[pose]}
      width={size}
      height={size}
      priority={priority}
      className={`relative ${glow ? `drop-shadow-[0_0_24px_${glowColor}]` : ""} ${className}`}
    />
  );

  if (shouldReduce || !animated) return img;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pose}
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: -16 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative inline-block"
      >
        {/* Glow ring */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
          />
        )}
        {/* Float */}
        {float ? (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {img}
          </motion.div>
        ) : img}
      </motion.div>
    </AnimatePresence>
  );
}
