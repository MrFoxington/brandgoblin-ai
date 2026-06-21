"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { XPBar } from "./XPSystem";
import NixPose from "./primitives/NixPose";
import type { BrandKit, BrandGenerationRow } from "@/types";
import { trackEvent } from "@/lib/analytics";

// ── Streak ────────────────────────────────────────────────────────────────────
const STREAK_KEY = "brandgoblin_streak_v1";

interface StreakData { lastDate: string; count: number }

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadAndUpdateStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const today = todayStr();
    const yesterday = yesterdayStr();
    let data: StreakData = raw ? JSON.parse(raw) : { lastDate: "", count: 0 };

    if (data.lastDate === today) {
      return data.count; // already visited today
    } else if (data.lastDate === yesterday) {
      data = { lastDate: today, count: data.count + 1 };
    } else {
      data = { lastDate: today, count: 1 }; // broken streak or first visit
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data.count;
  } catch {
    return 1;
  }
}

// ── Daily Nix idea ─────────────────────────────────────────────────────────────
// Fallback ideas used when there are no saved brands yet
const FALLBACK_IDEAS = [
  "Write a 3-sentence brand story for your next business idea.",
  "List 5 competitors and note what your brand does differently.",
  "Draft your brand's first Instagram caption.",
  "Write down 3 words you never want people to associate with your brand.",
  "Pick a brand color and explain why it fits your personality.",
  "Write a tweet that introduces your brand in under 280 characters.",
  "Brainstorm 5 potential brand names for a future product.",
];

function getDailyIdea(kit?: BrandKit): { idea: string; brandName?: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  if (kit?.marketingIdeas?.viralContentIdeas?.length) {
    const ideas = kit.marketingIdeas.viralContentIdeas;
    return { idea: ideas[dayOfYear % ideas.length], brandName: kit.recommendedName };
  }

  return { idea: FALLBACK_IDEAS[dayOfYear % FALLBACK_IDEAS.length] };
}

// ── Energy reset countdown ────────────────────────────────────────────────────
function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  if (ms < 0) return 0;
  return Math.ceil(ms / 86400000);
}

interface EnergyData {
  totalRemaining: number;
  monthlyAllowance: number;
  percentRemaining: number;
  periodEnd?: string;
  warningLevel?: "ok" | "low" | "critical";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: "📸", label: "Instagram Posts",  type: "instagram_post",   energy: 10 },
  { icon: "📝", label: "Blog Article",     type: "blog_post",        energy: 100 },
  { icon: "📧", label: "Email Newsletter", type: "email_campaign",   energy: 30 },
  { icon: "🎥", label: "Video Ideas",      type: "campaign_ideas",   energy: 60 },
  { icon: "💰", label: "Promotions",       type: "promotion",        energy: 30 },
  { icon: "#️⃣",  label: "Hashtags",        type: "hashtag_set",      energy: 5  },
  { icon: "💡", label: "Product Ideas",    type: "product_description", energy: 30 },
  { icon: "📣", label: "Ad Copy",          type: "ad_copy",          energy: 30 },
];

const NIX_GREETINGS = [
  "Let's build something today.",
  "Ready to make some magic?",
  "Your brand is waiting for content.",
  "I've been warming up the cauldron.",
  "Time to give your brand a voice.",
];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(email: string) {
  const local = email.split("@")[0].replace(/[^a-zA-Z]/g, "").slice(0, 12);
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "Creator";
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DailyCreatorDashboard({
  email,
  plan,
  brandCount,
  latestBrand,
  signupDate,
}: {
  email: string;
  plan: string;
  brandCount: number;
  latestBrand?: BrandGenerationRow;
  signupDate?: string;
}) {
  const isPro = plan === "pro" || plan === "agency";
  const firstName = getFirstName(email);
  const [greeting] = useState(getTimeOfDay());
  const [nixSays] = useState(NIX_GREETINGS[Math.floor(Math.random() * NIX_GREETINGS.length)]);
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(1);
  const [energy, setEnergy] = useState<EnergyData | null>(null);
  const [ideaDismissed, setIdeaDismissed] = useState(false);

  const dailyIdea = getDailyIdea(latestBrand?.output_data);

  useEffect(() => {
    setMounted(true);
    setStreak(loadAndUpdateStreak());

    // D1/D7 return tracking — fires once per session on dashboard load
    const daysSinceSignup = signupDate
      ? Math.floor((Date.now() - new Date(signupDate).getTime()) / 86400000)
      : undefined;
    trackEvent("session_start", { daysSinceSignup, plan });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch energy for pro users
  useEffect(() => {
    if (!isPro) return;
    fetch("/api/energy/balance")
      .then((r) => r.json())
      .then((d: EnergyData) => setEnergy(d))
      .catch(() => null);
  }, [isPro]);

  const resetDays = daysUntil(energy?.periodEnd);

  return (
    <div className="space-y-8">

      {/* ── Greeting row ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-5"
        >
          <div className="shrink-0">
            <NixPose pose="waving" size={90} glow priority />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-primary-light mb-1">✦ Brand Vault</p>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-muted mt-1 flex items-center gap-2">
              <span className="text-primary-light">🧌</span>
              Nix says: &ldquo;{nixSays}&rdquo;
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 shrink-0"
        >
          <Link href="/generate" className="btn-primary !py-2.5 !px-5 text-sm">
            ✦ Create a Brand
          </Link>
        </motion.div>
      </div>

      {/* ── Stats row: streak + brand count + plan ── */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-4"
        >
          {/* Streak */}
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-center">
            <motion.p
              className="text-3xl mb-1"
              animate={{ scale: streak > 1 ? [1, 1.2, 1] : 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              🔥
            </motion.p>
            <p className="font-display font-black text-white text-xl tabular-nums">{streak}</p>
            <p className="text-xs text-faint mt-0.5">day streak</p>
          </div>
          {/* Brands */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-center">
            <p className="text-3xl mb-1">🧌</p>
            <p className="font-display font-black text-white text-xl tabular-nums">{brandCount}</p>
            <p className="text-xs text-faint mt-0.5">brand{brandCount !== 1 ? "s" : ""} created</p>
          </div>
          {/* Plan */}
          <div className={`rounded-2xl border p-4 text-center ${isPro ? "border-primary/20 bg-primary/5" : "border-white/8 bg-white/3"}`}>
            <p className="text-3xl mb-1">{isPro ? "✨" : "⚡"}</p>
            <p className="font-display font-black text-white text-xl">{isPro ? "Pro" : "Free"}</p>
            <p className="text-xs text-faint mt-0.5">{isPro ? "Creator Pro" : "upgrade available"}</p>
          </div>
        </motion.div>
      )}

      {/* ── XP Bar ── */}
      {mounted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <XPBar />
        </motion.div>
      )}

      {/* ── Energy meter (Creator Pro only) ── */}
      {isPro && energy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`rounded-2xl border p-5 space-y-3 ${
            energy.warningLevel === "critical"
              ? "border-red-500/30 bg-red-500/5"
              : energy.warningLevel === "low"
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-primary/20 bg-primary/5"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <p className="font-display font-bold text-white text-sm">Creative Energy</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="tabular-nums font-semibold text-white">
                {(energy.totalRemaining ?? 0).toLocaleString()}
                <span className="text-faint font-normal"> / {(energy.monthlyAllowance ?? 0).toLocaleString()}</span>
              </span>
              {resetDays !== null && (
                <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
                  resetDays <= 3
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-white/10 bg-white/5 text-faint"
                }`}>
                  Resets in {resetDays}d
                </span>
              )}
            </div>
          </div>

          {/* Bar */}
          <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                energy.warningLevel === "critical" ? "bg-red-500" :
                energy.warningLevel === "low" ? "bg-yellow-400" :
                "bg-gradient-to-r from-primary to-secondary"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, energy.percentRemaining)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
            />
          </div>

          {energy.warningLevel && energy.warningLevel !== "ok" && (
            <p className={`text-xs ${energy.warningLevel === "critical" ? "text-red-400" : "text-yellow-400"}`}>
              {energy.warningLevel === "critical"
                ? "Running low — top up to keep creating."
                : "Less than 25% remaining this month."}
            </p>
          )}
        </motion.div>
      )}

      {/* ── Daily Nix idea ── */}
      <AnimatePresence>
        {!ideaDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.6 }}
            className="relative rounded-2xl border border-secondary/25 bg-secondary/5 px-5 py-5"
          >
            <button
              type="button"
              onClick={() => setIdeaDismissed(true)}
              className="absolute top-3 right-4 text-faint hover:text-white text-xs transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <NixPose pose="conjuring" size={52} glow={false} float={false} animated={false} />
              </div>
              <div className="space-y-1.5 pr-4">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                  ✦ Today&apos;s Idea
                  {dailyIdea.brandName && (
                    <span className="text-faint normal-case tracking-normal font-normal ml-2">
                      for {dailyIdea.brandName}
                    </span>
                  )}
                </p>
                <p className="text-sm text-white leading-relaxed font-medium">{dailyIdea.idea}</p>
                {isPro && latestBrand && (
                  <Link
                    href={`/dashboard/creator-pro?brandId=${latestBrand.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary-light hover:underline mt-1"
                  >
                    Create this now →
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick creates (pro) ── */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-white">Today&apos;s Quick Creates</h2>
            <Link href="/dashboard/creator-pro" className="text-xs text-primary-light hover:underline">Open Studio →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              >
                <Link
                  href={`/dashboard/creator-pro?contentType=${action.type}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 text-center hover:border-primary/40 hover:bg-primary/8 transition-all duration-200 hover:scale-105"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="text-xs font-semibold text-white leading-snug">{action.label}</span>
                  <span className="text-[10px] text-faint">⚡ {action.energy}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Goblin Studio card — visible to all logged-in users ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.72 }}
      >
        <Link
          href="/dashboard/studio"
          className="group relative flex items-center gap-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/8 via-transparent to-yellow-400/5 px-6 py-5 hover:border-amber-400/50 hover:from-amber-400/12 shadow-studio-glow motion-safe:animate-studio-glow transition-all duration-200"
        >
          <div className="shrink-0">
            <NixPose pose="conjuring" size={56} glow={false} float={false} animated={false} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400">🎨 Goblin Studio</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/20">NEW</span>
            </div>
            <p className="font-display font-bold text-white text-sm">Turn your brand into real images</p>
            <p className="text-xs text-muted mt-0.5">Generate logos, social graphics &amp; product art with AI</p>
          </div>
          <span className="text-muted group-hover:text-amber-300 transition-colors shrink-0 text-lg">→</span>
        </Link>
      </motion.div>

      {/* ── Upgrade banner (free) ── */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display font-bold text-white">Unlock your AI Marketing Department</p>
            <p className="text-xs text-muted mt-0.5">Monthly Creative Energy · Social posts · Blogs · Emails · Ads · $19/month</p>
          </div>
          <Link href="/pricing" className="btn-primary !py-2.5 !px-6 text-sm shrink-0">
            ✦ Upgrade to Creator Pro
          </Link>
        </motion.div>
      )}

      {/* ── Pro studio banner ── */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8 px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <NixPose pose="conjuring" size={56} glow={false} float={false} animated={false} />
            <div>
              <span className="badge-purple text-xs">✨ Creator Pro</span>
              <p className="font-display font-bold text-white text-sm mt-0.5">Your AI Marketing Department is ready</p>
              <p className="text-xs text-muted">Social posts · Blog content · Email campaigns · Ad copy</p>
            </div>
          </div>
          <Link href="/dashboard/creator-pro" className="btn-primary !py-2.5 !px-6 text-sm shrink-0">
            Open Studio →
          </Link>
        </motion.div>
      )}
    </div>
  );
}
