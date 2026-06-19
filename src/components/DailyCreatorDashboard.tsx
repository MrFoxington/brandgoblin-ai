"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { XPBar } from "./XPSystem";

const QUICK_ACTIONS = [
  { icon: "📸", label: "Instagram Posts",  type: "instagram_post",  energy: 10 },
  { icon: "📝", label: "Blog Article",      type: "blog_post",       energy: 100 },
  { icon: "📧", label: "Email Newsletter",  type: "email_campaign",  energy: 30 },
  { icon: "🎥", label: "Video Ideas",       type: "campaign_ideas",  energy: 60 },
  { icon: "💰", label: "Promotions",        type: "promotion",       energy: 30 },
  { icon: "# ", label: "Hashtags",          type: "hashtag_set",     energy: 5  },
  { icon: "💡", label: "Product Ideas",     type: "product_description", energy: 30 },
  { icon: "📣", label: "Ad Copy",           type: "ad_copy",         energy: 30 },
];

const NIX_GREETINGS = [
  "Let's build something today.",
  "Ready to make some magic?",
  "Your brand is waiting for content.",
  "I've been warming up the cauldron.",
  "What are we creating today?",
  "Time to give your brand a voice.",
];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(email: string) {
  const local = email.split("@")[0];
  const name = local.replace(/[^a-zA-Z]/g, "").slice(0, 12);
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Creator";
}

export default function DailyCreatorDashboard({
  email,
  plan,
  brandCount,
}: {
  email: string;
  plan: string;
  brandCount: number;
}) {
  const [greeting] = useState(getTimeOfDay());
  const [nixSays] = useState(NIX_GREETINGS[Math.floor(Math.random() * NIX_GREETINGS.length)]);
  const firstName = getFirstName(email);
  const isPro = plan === "pro" || plan === "agency";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-8">

      {/* ── Greeting ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-5"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0"
          >
            <Image
              src="/nix/happy-waving-nix.png"
              alt="Nix waving"
              width={90}
              height={90}
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]"
            />
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold tracking-widest uppercase text-primary-light mb-1"
            >
              ✦ Brand Vault
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl sm:text-4xl font-black text-white"
            >
              {greeting}, {firstName} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted mt-1 flex items-center gap-2"
            >
              <span className="text-primary-light">🧌</span>
              Nix says: &ldquo;{nixSays}&rdquo;
            </motion.p>
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

      {/* ── XP Bar ── */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <XPBar />
        </motion.div>
      )}

      {/* ── Today's Quick Actions (Creator Pro) ── */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-white">Today&apos;s Quick Creates</h2>
            <Link href="/dashboard/creator-pro" className="text-xs text-primary-light hover:underline">
              Open Studio →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.05 }}
              >
                <Link
                  href={`/dashboard/creator-pro?contentType=${action.type}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 text-center hover:border-primary/40 hover:bg-primary/8 transition-all duration-200 hover:scale-105"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {action.icon}
                  </span>
                  <span className="text-xs font-semibold text-white leading-snug">{action.label}</span>
                  <span className="text-[10px] text-faint">⚡ {action.energy}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Brands Created", value: brandCount, emoji: "🧌" },
          { label: "Plan", value: isPro ? "Creator Pro" : "Free", emoji: "✨" },
          { label: "Status", value: "Active", emoji: "🟢" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-center">
            <p className="text-xl mb-1">{stat.emoji}</p>
            <p className="font-display font-black text-white text-lg">{stat.value}</p>
            <p className="text-xs text-faint mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Upgrade banner for free users ── */}
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

      {/* ── Creator Pro banner for pro users ── */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8 px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Image src="/nix/conjuring-nix.png" alt="Nix" width={56} height={56} />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="badge-purple text-xs">✨ Creator Pro</span>
              </div>
              <p className="font-display font-bold text-white text-sm">Your AI Marketing Department is ready</p>
              <p className="text-xs text-muted mt-0.5">Social posts · Blog content · Email campaigns · Ad copy</p>
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
