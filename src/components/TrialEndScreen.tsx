"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import NixPose from "./primitives/NixPose";

export default function TrialEndScreen({ brandCount }: { brandCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 px-8 py-10 text-center"
    >
      <div className="w-24 h-24 mx-auto mb-4">
        <NixPose pose="waving" animated={false} />
      </div>

      <h2 className="font-display text-2xl font-black text-white mb-2">
        Your 7 days with Nix are up.
      </h2>

      <p className="text-white/60 max-w-md mx-auto leading-relaxed mb-2">
        {brandCount > 0
          ? `You built ${brandCount} brand${brandCount === 1 ? "" : "s"} together. Your library is safe — every brand, every word, saved forever.`
          : "Your brand library is safe — everything you built is saved forever."}
      </p>
      <p className="text-white/50 text-sm mb-8">
        Ready to keep building? Your creative partner is one click away.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <Link href="/pricing" className="btn-primary px-8 py-3 text-base">
          ✨ Keep building with Nix — $19/mo
        </Link>
        <Link href="/dashboard/generate" className="btn-secondary px-6 py-3">
          Try free generation
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40">
        <span>✓ Unlimited generations</span>
        <span>✓ 20 content types</span>
        <span>✓ 7 voice modes</span>
        <span>✓ Cancel anytime</span>
      </div>
    </motion.div>
  );
}
