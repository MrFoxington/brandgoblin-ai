"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NixPose from "./primitives/NixPose";

export default function PaymentRecoveryBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_url: window.location.href }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex items-start gap-4"
        >
          <div className="shrink-0 w-12 h-12">
            <NixPose pose="waving" animated={false} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-300 text-sm leading-snug">
              Nix noticed your card needs a quick update — let&apos;s keep your momentum going.
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Your brands and progress are safe. Just need a working payment method.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePortal}
              disabled={loading}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors disabled:opacity-60"
            >
              {loading ? "Opening…" : "Update card →"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
