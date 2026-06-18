"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NICHES = [
  "skincare brand",
  "fitness app",
  "coffee shop",
  "fashion label",
  "podcast brand",
  "SaaS startup",
  "food truck",
  "creative studio",
];

const TRUST = [
  { label: "brands generated", value: "2,400+" },
  { label: "avg rating", value: "4.9★" },
  { label: "time to brand kit", value: "~2 min" },
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
];

const INITIALS = ["M", "C", "P", "J", "A"];

export default function HeroTypewriter() {
  const [nicheIndex, setNicheIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = NICHES[nicheIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (charIndex < current.length) {
        timeout = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 60);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2200);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 35);
      } else {
        setDeleting(false);
        setNicheIndex((i) => (i + 1) % NICHES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, nicheIndex]);

  return (
    <div className="flex-1 text-center lg:text-left">
      {/* Badge */}
      <div className="mb-6 flex justify-center lg:justify-start">
        <span className="badge-purple">
          <span>✦</span> AI-Powered Brand Creation Engine
        </span>
      </div>

      {/* Headline with typewriter */}
      <h1 className="section-heading mb-6 text-5xl sm:text-6xl lg:text-7xl leading-tight">
        Launch your<br />
        <span
          className="gradient-text inline-block min-h-[1.2em]"
          style={{ minWidth: "2ch" }}
        >
          {displayed}
          <span className="animate-pulse text-primary">|</span>
        </span>
        <br />
        in 2 minutes.
      </h1>

      {/* Nix quip */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2">
        <span className="text-base">🧌</span>
        <p className="text-sm font-medium text-secondary">
          Hi! I&rsquo;m Nix — your AI brand strategist, copywriter, and creative director.
        </p>
      </div>

      {/* Subheadline */}
      <p className="section-sub mb-10 text-lg max-w-xl mx-auto lg:mx-0">
        Stop spending weeks on Fiverr and hours wrestling with ChatGPT.
        One prompt → 12 launch-ready brand deliverables, in under 2 minutes.
      </p>

      {/* CTAs */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start mb-8">
        <Link href="/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
          ✦ Generate Your First Brand Free →
        </Link>
        <Link href="/pricing" className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
          See Pricing →
        </Link>
      </div>

      {/* Trust bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
        {/* Avatar stack */}
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {AVATAR_GRADIENTS.map((g, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-full bg-gradient-to-br ${g} border-2 border-bg flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {INITIALS[i]}
              </div>
            ))}
          </div>
          <span className="ml-3 text-sm text-muted">2,400+ founders</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400 text-sm">{"★★★★★"}</div>
          <span className="ml-1 text-sm text-muted">4.9/5 avg rating</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-white/10" />

        <div className="text-sm text-muted">
          <span className="text-secondary font-semibold">No card required</span> · Free forever
        </div>
      </div>
    </div>
  );
}
