"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TrialCountdownBanner({
  daysLeft,
  trialEndsAt,
}: {
  daysLeft: number;
  trialEndsAt: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  const endsDate = new Date(trialEndsAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const urgency = daysLeft <= 2;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={`relative rounded-2xl border px-5 py-4 flex items-center gap-4 ${
            urgency
              ? "border-amber-500/40 bg-amber-500/10"
              : "border-primary/30 bg-primary/10"
          }`}
        >
          <span className="text-2xl shrink-0">{urgency ? "⏳" : "✨"}</span>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm leading-snug ${urgency ? "text-amber-300" : "text-primary-light"}`}>
              {daysLeft <= 0
                ? "Your trial ends today — keep building with Nix."
                : daysLeft === 1
                ? "1 day left with Nix — you've been creating something real."
                : `${daysLeft} days building with Nix. Trial ends ${endsDate}.`}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Upgrade to Creator Pro to keep everything going for $19/mo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/pricing"
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                urgency
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-primary text-white hover:bg-primary/80"
              }`}
            >
              Keep building →
            </Link>
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
