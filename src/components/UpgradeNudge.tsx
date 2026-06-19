"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NixPose from "./primitives/NixPose";
import Sparkles from "./primitives/Sparkles";

const PERKS = [
  "♾️ Unlimited brand kits",
  "🔄 Re-conjure any section",
  "📝 Unlimited content generation",
  "⚡ Creator Pro dashboard",
  "🎯 Priority brand generation",
];

export default function UpgradeNudge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout isn't set up yet.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 p-8"
    >
      <Sparkles count={6} />

      <div className="relative z-10 flex flex-col items-center text-center gap-5 sm:flex-row sm:text-left sm:items-start sm:gap-8">
        {/* Nix */}
        <div className="shrink-0">
          <NixPose pose="waving" size={90} glow float={false} />
        </div>

        {/* Copy */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary-light mb-1">
              ✦ You&apos;re on the free plan
            </p>
            <h3 className="font-display text-2xl font-black text-white leading-tight">
              Your brand is ready.<br />
              <span className="text-primary-light">Keep building with Creator Pro.</span>
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Nix can write unlimited content for this brand — posts, emails, ads, product descriptions, and more. One subscription, all the magic.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 text-sm text-muted">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="text-secondary shrink-0">✓</span> {p}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="btn-primary !py-3 !px-6 text-sm font-bold disabled:opacity-60"
            >
              {loading ? "Redirecting to checkout…" : "🚀 Upgrade to Creator Pro →"}
            </button>
            <p className="text-xs text-faint">Cancel anytime · No contracts</p>
          </div>

          {error && (
            <p className="text-xs text-red-400 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
