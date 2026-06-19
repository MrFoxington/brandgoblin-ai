"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NixPose from "./primitives/NixPose";
import type { BrandInput } from "@/types";

const CARDS = [
  { id: "social",   icon: "🚀", label: "Social Media",        desc: "Posts, captions & hashtags",    color: "hover:border-purple-500/40 hover:bg-purple-500/8",  glowColor: "rgba(139,92,246,0.3)" },
  { id: "website",  icon: "🌐", label: "Website Copy",         desc: "Headlines, about & CTAs",        color: "hover:border-blue-500/40 hover:bg-blue-500/8",     glowColor: "rgba(59,130,246,0.3)" },
  { id: "email",    icon: "📧", label: "Email Campaigns",      desc: "Welcome, nurture & promos",      color: "hover:border-green-500/40 hover:bg-green-500/8",   glowColor: "rgba(34,197,94,0.3)"  },
  { id: "blog",     icon: "📰", label: "Blog Posts",           desc: "SEO-ready long-form content",    color: "hover:border-yellow-500/40 hover:bg-yellow-500/8", glowColor: "rgba(234,179,8,0.3)"  },
  { id: "ads",      icon: "📈", label: "Ad Copy",              desc: "Facebook, Instagram & Google",   color: "hover:border-orange-500/40 hover:bg-orange-500/8", glowColor: "rgba(249,115,22,0.3)" },
  { id: "products", icon: "📦", label: "Product Descriptions", desc: "Convert browsers to buyers",     color: "hover:border-pink-500/40 hover:bg-pink-500/8",     glowColor: "rgba(236,72,153,0.3)" },
  { id: "podcast",  icon: "🎙", label: "Podcast",              desc: "Show names, intros & episodes",  color: "hover:border-red-500/40 hover:bg-red-500/8",       glowColor: "rgba(239,68,68,0.3)"  },
  { id: "merch",    icon: "🎁", label: "Merchandise",          desc: "Product ideas & descriptions",   color: "hover:border-teal-500/40 hover:bg-teal-500/8",     glowColor: "rgba(20,184,166,0.3)" },
];

// Pick the best starting card for this brand based on traits/vibe
function pickRecommended(brandInput?: BrandInput): string {
  if (!brandInput) return "social";
  const traits = (brandInput.brandTraits ?? []).join(" ").toLowerCase();
  const vibe = (brandInput.vibe ?? "").toLowerCase();
  const idea = (brandInput.businessIdea ?? "").toLowerCase();
  const combined = `${traits} ${vibe} ${idea}`;

  if (/email|newsletter|loyal|nurture|retention/.test(combined)) return "email";
  if (/luxury|premium|professional|elegant|sophisticated/.test(combined)) return "website";
  if (/ad|paid|market|growth|scale|facebook|instagram|google/.test(combined)) return "ads";
  if (/content|blog|seo|article|write|thought/.test(combined)) return "blog";
  if (/product|shop|ecommerce|sell|store/.test(combined)) return "products";
  return "social"; // best default — fastest win for any new brand
}

// The Nix recommendation line for each card id
const NIX_RECS: Record<string, string> = {
  social:   "Social is your fastest path to first customers. Start here.",
  website:  "Your audience will Google you. Let's make sure they're impressed.",
  email:    "Email converts better than social. Build your list from day one.",
  blog:     "A strong blog builds trust and drives search traffic over time.",
  ads:      "You've got the brand. Now let's write ads that actually convert.",
  products: "Great product copy is the difference between browsing and buying.",
  podcast:  "A podcast turns your brand voice into a relationship with your audience.",
  merch:    "Brand merch makes fans into walking billboards. Let's design it.",
};

interface Props {
  brandId?: string;
  userPlan?: "free" | "pro" | "agency";
  brandInput?: BrandInput;
}

export default function ContinueBuilding({ brandId, userPlan = "free", brandInput }: Props) {
  const isPro = userPlan === "pro" || userPlan === "agency";
  const base = brandId ? `/dashboard/creator-pro?brandId=${brandId}` : "/dashboard/creator-pro";
  const recommended = pickRecommended(brandInput);
  const [lockedTap, setLockedTap] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    setCheckoutError(null);
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
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.");
      setCheckoutLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary-light">
          ✦ Keep the magic going ✦
        </p>
        <h2 className="font-display text-2xl font-black text-white">Continue Building</h2>
        <p className="text-sm text-muted">Your brand is alive — now let&apos;s give it a voice.</p>
      </div>

      {/* Nix recommendation callout — always shown */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-4 rounded-2xl border border-secondary/25 bg-secondary/5 px-5 py-4"
      >
        <NixPose pose="thinking" size={48} float={false} glow={false} animated={false} />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest">Nix recommends starting with</p>
          <p className="font-display font-black text-white text-lg">
            {CARDS.find((c) => c.id === recommended)?.icon}{" "}
            {CARDS.find((c) => c.id === recommended)?.label}
          </p>
          <p className="text-xs text-muted leading-relaxed">{NIX_RECS[recommended]}</p>
        </div>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CARDS.map((card, i) => {
          const isRecommended = card.id === recommended;
          const isLocked = !isPro;
          const isLockTapped = lockedTap === card.id;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
              className="relative"
            >
              {isPro ? (
                // ── Pro: fully clickable ──
                <Link
                  href={base}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 group
                    ${isRecommended
                      ? "border-secondary/50 bg-secondary/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                      : `border-white/10 bg-white/3 ${card.color}`
                    } hover:scale-105`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{card.icon}</span>
                  <span className="text-sm font-bold text-white">{card.label}</span>
                  <span className="text-xs text-faint leading-snug">{card.desc}</span>
                  {isRecommended && (
                    <span className="text-[10px] font-bold text-secondary tracking-widest uppercase mt-0.5">Nix Pick ✦</span>
                  )}
                </Link>
              ) : (
                // ── Free: locked with tap-to-reveal ──
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLockedTap(isLockTapped ? null : card.id)}
                    className={`w-full flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200
                      ${isRecommended
                        ? "border-secondary/40 bg-secondary/8 shadow-[0_0_18px_rgba(52,211,153,0.12)]"
                        : "border-white/8 bg-white/2 opacity-70"
                      }`}
                  >
                    <span className="text-2xl relative">
                      {card.icon}
                      {/* Lock badge */}
                      <span className="absolute -top-1 -right-2 text-[10px]">🔒</span>
                    </span>
                    <span className={`text-sm font-bold ${isRecommended ? "text-white" : "text-white/60"}`}>{card.label}</span>
                    <span className="text-xs text-faint leading-snug">{card.desc}</span>
                    {isRecommended && (
                      <span className="text-[10px] font-bold text-secondary tracking-widest uppercase mt-0.5">Start here ✦</span>
                    )}
                  </button>

                  {/* Tap-to-reveal upgrade mini-prompt */}
                  <AnimatePresence>
                    {isLockTapped && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 6 }}
                        className="absolute inset-x-0 top-full mt-2 z-20 rounded-xl border border-primary/30 bg-[#0f0f1a] p-3 shadow-2xl text-center space-y-2"
                      >
                        <p className="text-xs font-bold text-white">Unlock {card.label}</p>
                        <p className="text-[11px] text-muted">Creator Pro · Unlimited content</p>
                        <button
                          type="button"
                          onClick={handleUpgrade}
                          disabled={checkoutLoading}
                          className="w-full btn-primary !py-1.5 !text-xs disabled:opacity-60"
                        >
                          {checkoutLoading ? "Redirecting…" : "Upgrade →"}
                        </button>
                        {checkoutError && <p className="text-[10px] text-red-400">{checkoutError}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-2"
      >
        {isPro ? (
          <Link href={base} className="btn-primary px-8 py-3 inline-block">
            ✨ Open Creator Pro Studio
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="btn-primary px-8 py-3 disabled:opacity-60"
          >
            {checkoutLoading ? "Redirecting…" : "🚀 Unlock All Builders →"}
          </button>
        )}
        <p className="text-xs text-faint">
          {isPro ? "Never run out of content ideas again." : "Cancel anytime · No contracts"}
        </p>
      </motion.div>
    </motion.div>
  );
}
