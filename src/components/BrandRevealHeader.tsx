"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function BrandRevealHeader({ brandName }: { brandName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative text-center py-10 overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Celebrating Nix */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 inline-block mb-4"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/nix/celebrating-nix.png"
            alt="Nix celebrating"
            width={120}
            height={120}
            className="drop-shadow-[0_0_30px_rgba(124,58,237,0.7)]"
          />
        </motion.div>
      </motion.div>

      {/* Floating stars */}
      {["✦", "⭐", "✨", "💫", "✦", "⭐"].map((star, i) => (
        <motion.span
          key={i}
          className="absolute text-primary-light pointer-events-none select-none"
          style={{
            left: `${10 + i * 16}%`,
            top: `${20 + (i % 2) * 40}%`,
            fontSize: `${12 + (i % 3) * 6}px`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [-10, -40] }}
          transition={{ delay: 0.5 + i * 0.15, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {star}
        </motion.span>
      ))}

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 space-y-2"
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary-light">
          ✦ Welcome to your new brand ✦
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-black text-white">
          {brandName}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted"
        >
          Nix built this just for you. Every piece. Every word. Every detail.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
