"use client";

/**
 * LoadingScreen — the LIVE REVEAL FEED.
 * While the brand kit generates, real sections stream in from /api/generate
 * and pop into the feed one at a time (name first, ~15s in). Mobile-first:
 * single column, compact teaser cards, sticky Nix status header, sticky
 * "see full kit" CTA when done.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NixPose from "./primitives/NixPose";
import type { Pose } from "./primitives/NixPose";
import Sparkles from "./primitives/Sparkles";
import { useSoundFx } from "./primitives/SoundFx";
import { normalizeBrandDna } from "@/lib/brand-dna";
import Link from "next/link";
import type {
  FavoriteName,
  AlternativeName,
  NameStrengthCheck,
  BrandStory,
  BrandVoice,
  MascotConcept,
  ColorSwatch,
  WebsiteCopy,
  SocialKit,
  MarketingIdeas,
  BrandDNAScore,
} from "@/types";

export interface GenerationProgress {
  section: string;
  label: string;
  pose: Pose;
  progress: number; // 0–1
}

export interface RevealedSection {
  section: string;
  content: unknown;
}

const IDLE_LINES = [
  "Hmm… this idea has potential.",
  "Thinking like your future customers…",
  "Let me dig into this niche…",
  "Building something memorable…",
  "I can already see the logo…",
];

const ERROR_LINES = [
  "The goblin dropped the scroll.",
  "Nix tripped on a magic bean.",
  "The enchantment fizzled out.",
  "The spell backfired — just a little.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](\s|$)/);
  return m ? m[0].trim() : text;
}

function ProgressBar({ value }: { value: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
      {shouldReduce ? (
        <div className="h-full rounded-full bg-primary" style={{ width: `${value * 100}%` }} />
      ) : (
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

// ── Section cards ───────────────────────────────────────────────────────────

// Sparkle burst that fires once when a card lands — the mini celebration
const BURST_PARTICLES = [
  { x: -48, y: -36, char: "✨", delay: 0    },
  { x:  44, y: -42, char: "✦",  delay: 0.05 },
  { x: -26, y: -54, char: "⭐", delay: 0.1  },
  { x:  62, y: -20, char: "✨", delay: 0.15 },
  { x: -62, y: -14, char: "✦",  delay: 0.2  },
  { x:  26, y: -58, char: "✨", delay: 0.25 },
];

function RevealBurst() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" aria-hidden>
      {BURST_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-2 text-sm"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: [0.3, 1.15, 0.7] }}
          transition={{ duration: 0.9, delay: 0.1 + p.delay, ease: "easeOut" }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
}

function Card({
  emoji,
  title,
  children,
  highlight = false,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 34, scale: 0.94 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        // One-shot glow flash on landing; highlighted cards keep a soft glow
        boxShadow: shouldReduce
          ? undefined
          : highlight
          ? ["0 0 0px rgba(124,58,237,0)", "0 0 48px rgba(124,58,237,0.55)", "0 0 30px rgba(124,58,237,0.3)"]
          : ["0 0 0px rgba(124,58,237,0)", "0 0 32px rgba(124,58,237,0.4)", "0 0 0px rgba(124,58,237,0)"],
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 22,
        boxShadow: { duration: 1.5, times: [0, 0.35, 1], ease: "easeOut" },
      }}
      className={`relative rounded-2xl border p-5 text-left ${
        highlight
          ? "border-primary/50 bg-primary/10"
          : "border-[rgba(45,45,78,0.8)] bg-[rgba(20,20,40,0.6)]"
      }`}
    >
      {!shouldReduce && <RevealBurst />}
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-faint">
        {emoji} {title}
      </p>
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function SectionCard({ section, content, studioHref }: RevealedSection & { studioHref?: string }) {
  const shouldReduce = useReducedMotion();
  switch (section) {
    case "name": {
      // Generated mode: FavoriteName object. Existing mode: plain string.
      const fav = typeof content === "string" ? null : (content as FavoriteName);
      const name = typeof content === "string" ? content : fav?.name ?? "";
      return (
        <Card emoji="✦" title="Your brand name" highlight>
          <motion.p
            className="font-display text-5xl font-extrabold leading-tight bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #a78bfa, #ffffff, #34d399, #a78bfa)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
            }}
            animate={shouldReduce ? undefined : { backgroundPosition: ["0% center", "-200% center"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            {name}
          </motion.p>
          {fav?.tagline && <p className="mt-2 text-base italic text-muted">“{fav.tagline}”</p>}
          {fav?.whyPicked && (
            <p className="mt-3 text-sm leading-relaxed text-muted">{firstSentence(fav.whyPicked)}</p>
          )}
        </Card>
      );
    }
    case "altNames": {
      const alts = content as AlternativeName[];
      if (!Array.isArray(alts) || alts.length === 0) return null;
      return (
        <Card emoji="🎲" title="Backup names">
          <div className="flex flex-wrap gap-2">
            {alts.map((a) => (
              <span
                key={a.name}
                className="rounded-full border border-[rgba(45,45,78,0.9)] bg-white/5 px-3 py-1 text-sm font-semibold text-white"
              >
                {a.name}
              </span>
            ))}
          </div>
        </Card>
      );
    }
    case "nameCheck": {
      const check = content as NameStrengthCheck;
      if (!check?.whatWorks) return null;
      return (
        <Card emoji="💪" title="Name strength check">
          <p className="text-sm leading-relaxed text-muted">{check.whatWorks}</p>
        </Card>
      );
    }
    case "taglines": {
      const lines = content as string[];
      if (!Array.isArray(lines) || lines.length === 0) return null;
      return (
        <Card emoji="💬" title="Taglines">
          <div className="space-y-1.5">
            {lines.slice(0, 3).map((t) => (
              <p key={t} className="text-sm font-medium text-white">“{t}”</p>
            ))}
            {lines.length > 3 && (
              <p className="text-xs text-faint">+{lines.length - 3} more in your kit</p>
            )}
          </div>
        </Card>
      );
    }
    case "story": {
      const story = content as BrandStory;
      if (!story?.mission) return null;
      return (
        <Card emoji="📖" title="Brand story">
          <p className="text-sm leading-relaxed text-muted">{story.mission}</p>
        </Card>
      );
    }
    case "voice": {
      const voice = content as BrandVoice;
      if (!Array.isArray(voice?.personalityTraits)) return null;
      return (
        <Card emoji="🗣️" title="Brand voice">
          <div className="flex flex-wrap gap-2">
            {voice.personalityTraits.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary/15 border border-secondary/30 px-3 py-1 text-xs font-semibold text-secondary capitalize"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      );
    }
    case "mascot": {
      const mascot = content as MascotConcept;
      if (!mascot?.name) return null;
      return (
        <Card emoji="🧌" title="Meet your mascot">
          <p className="font-display text-lg font-bold text-white">{mascot.name}</p>
          {mascot.appearance && (
            <p className="mt-1 text-sm leading-relaxed text-muted">{firstSentence(mascot.appearance)}</p>
          )}
        </Card>
      );
    }
    case "logo": {
      const prompt = content as string;
      if (typeof prompt !== "string") return null;
      return (
        <Card emoji="🎨" title="Logo direction">
          <p className="text-sm leading-relaxed text-muted">
            {prompt.length > 120 ? prompt.slice(0, 120).trimEnd() + "…" : prompt}
          </p>
          {studioHref ? (
            <Link
              href={studioHref}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary hover:bg-secondary/20 transition-colors"
            >
              ⚡ Create it now →
            </Link>
          ) : (
            <p className="mt-2 text-xs font-semibold text-secondary">
              ⚡ Generate this logo in Goblin Studio the moment your kit opens
            </p>
          )}
        </Card>
      );
    }
    case "colors": {
      const palette = content as ColorSwatch[];
      if (!Array.isArray(palette) || palette.length === 0) return null;
      return (
        <Card emoji="🌈" title="Color palette">
          <div className="flex flex-wrap gap-3">
            {palette.map((c) => (
              <div key={c.hex + c.name} className="flex flex-col items-center gap-1">
                <span
                  className="h-10 w-10 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-mono text-faint uppercase">{c.hex}</span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    case "website": {
      const copy = content as WebsiteCopy;
      if (!copy?.heroHeadline) return null;
      return (
        <Card emoji="🌐" title="Website copy">
          <p className="font-display text-lg font-bold text-white">{copy.heroHeadline}</p>
          {copy.subheadline && <p className="mt-1 text-sm text-muted">{copy.subheadline}</p>}
        </Card>
      );
    }
    case "social": {
      const kit = content as SocialKit;
      if (!kit?.tiktokBio) return null;
      return (
        <Card emoji="📱" title="Social kit">
          <p className="text-sm text-white">{kit.tiktokBio}</p>
          <p className="mt-1.5 text-xs text-faint">
            Bios for TikTok, Instagram &amp; X + {kit.launchPosts?.length ?? 5} launch posts ready
          </p>
        </Card>
      );
    }
    case "marketing": {
      const ideas = content as MarketingIdeas;
      const first = ideas?.viralContentIdeas?.[0];
      if (!first) return null;
      const total =
        (ideas.viralContentIdeas?.length ?? 0) +
        (ideas.memeIdeas?.length ?? 0) +
        (ideas.adAngles?.length ?? 0);
      return (
        <Card emoji="🚀" title="Marketing ideas">
          <p className="text-sm leading-relaxed text-white">{first}</p>
          {total > 1 && <p className="mt-1.5 text-xs text-faint">+{total - 1} more ideas in your kit</p>}
        </Card>
      );
    }
    case "launch": {
      const plan = content as string[];
      if (!Array.isArray(plan) || plan.length === 0) return null;
      return (
        <Card emoji="🗓️" title="7-day launch plan">
          <p className="text-sm font-medium text-white">{plan[0]}</p>
          <p className="mt-1.5 text-xs text-faint">…all the way through Day {plan.length}</p>
        </Card>
      );
    }
    case "dna": {
      const dna = normalizeBrandDna(content as BrandDNAScore[]);
      if (dna.length === 0) return null;
      const top = [...dna].sort((a, b) => b.score - a.score).slice(0, 3);
      return (
        <Card emoji="🧬" title="Brand DNA">
          <div className="flex flex-wrap gap-2">
            {top.map((d) => (
              <span
                key={d.label}
                className="rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-light"
              >
                {d.label} {d.score}
              </span>
            ))}
          </div>
        </Card>
      );
    }
    default:
      return null;
  }
}

// ── Main component ──────────────────────────────────────────────────────────

interface LoadingScreenProps {
  progress?: GenerationProgress | null;
  error?: string | null;
  onRetry?: () => void;
  revealed?: RevealedSection[];
  done?: boolean;
  onContinue?: () => void;
  /** When the kit is saved, the logo card gains a direct "Create it now" Studio link */
  studioBrandId?: string | null;
}

export default function LoadingScreen({
  progress,
  error,
  onRetry,
  revealed = [],
  done = false,
  onContinue,
  studioBrandId = null,
}: LoadingScreenProps) {
  const [idleLabel, setIdleLabel] = useState(IDLE_LINES[0]);
  const [errorLine] = useState(() => randomFrom(ERROR_LINES));
  const shouldReduce = useReducedMotion();
  const feedEndRef = useRef<HTMLDivElement>(null);
  const { playReveal, playStreak, playLevelUp, startAnticipation, stopAnticipation } = useSoundFx();
  const prevCountRef = useRef(0);

  // Cycle idle messages while waiting for the first real progress event
  useEffect(() => {
    if (progress || error) return;
    let i = 1;
    const t = setInterval(() => {
      setIdleLabel(IDLE_LINES[i % IDLE_LINES.length]);
      i++;
    }, 2600);
    return () => clearInterval(t);
  }, [progress, error]);

  // Ambient anticipation bed while generating; stops on done / error / unmount
  useEffect(() => {
    if (error || done) return;
    startAnticipation();
    return () => stopAnticipation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, done]);

  // Celebration cues: big reveal sound for the name, rising chime per section
  useEffect(() => {
    const count = revealed.length;
    const prev = prevCountRef.current;
    prevCountRef.current = count;
    if (count === 0 || count <= prev) return;
    const newest = revealed[count - 1];
    if (newest.section === "name") playReveal();
    else playStreak(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // Fanfare when the whole kit lands
  useEffect(() => {
    if (!done) return;
    stopAnticipation();
    playLevelUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Auto-scroll to the newest card
  useEffect(() => {
    if (revealed.length === 0) return;
    feedEndRef.current?.scrollIntoView({
      behavior: shouldReduce ? "auto" : "smooth",
      block: "end",
    });
  }, [revealed.length, done, shouldReduce]);

  const pose: Pose = error ? "sleeping" : done ? "celebrating" : (progress?.pose ?? "thinking");
  const label = error
    ? errorLine
    : done
    ? "Your brand is ALIVE! 🎉"
    : (progress?.label ?? idleLabel);
  const progressValue = done ? 1 : progress?.progress ?? 0;
  const hasFeed = revealed.length > 0;

  // ── Phase 1: nothing revealed yet — big centered Nix (or error) ──────────
  if (!hasFeed || error) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center px-4 overflow-hidden">
        {!error && <Sparkles count={10} />}

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: error ? 0.1 : [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: error ? 0 : Infinity, ease: "easeInOut" }}
          style={{
            background: error
              ? "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.15) 0%, transparent 65%)"
              : "radial-gradient(circle at 50% 40%, rgba(124,58,237,0.2) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10">
          <NixPose pose={pose} size={200} glow priority />
        </div>

        <div className="relative z-10 space-y-3 max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            <motion.p
              key={label}
              initial={shouldReduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduce ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className={`font-display text-2xl font-bold ${error ? "text-red-400" : "text-white"}`}
            >
              {label}
            </motion.p>
          </AnimatePresence>

          {error ? (
            <div className="space-y-3">
              <p className="text-sm text-muted leading-relaxed">{error}</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="btn-primary !py-2 !px-5 text-sm">
                  🔮 Try Again
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Your brand reveals itself piece by piece — the name lands first.
            </p>
          )}
        </div>

        {!error && (
          <div className="relative z-10 flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Phase 2: live reveal feed ─────────────────────────────────────────────
  return (
    <div className="relative mx-auto w-full max-w-md px-4 pb-32">
      <Sparkles count={6} />

      {/* Sticky Nix status header */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-3 pb-3 backdrop-blur-md bg-[rgba(10,10,26,0.75)]">
        <div className="flex items-center gap-3">
          <NixPose pose={pose} size={52} float={false} priority />
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={label}
                initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduce ? {} : { opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="truncate font-display text-sm font-bold text-white"
              >
                {label}
              </motion.p>
            </AnimatePresence>
            <div className="mt-1.5">
              <ProgressBar value={progressValue} />
            </div>
          </div>
        </div>
      </div>

      {/* The feed */}
      <div className="mt-4 space-y-3">
        {revealed.map((r) => (
          <SectionCard
            key={r.section}
            section={r.section}
            content={r.content}
            studioHref={
              done && studioBrandId ? `/dashboard/studio?brand=${studioBrandId}` : undefined
            }
          />
        ))}
        <div ref={feedEndRef} className="h-1" />
      </div>

      {/* Sticky CTA once done */}
      <AnimatePresence>
        {done && onContinue && (
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-10 bg-gradient-to-t from-[rgba(10,10,26,0.95)] via-[rgba(10,10,26,0.8)] to-transparent"
          >
            <div className="mx-auto max-w-md">
              <button
                type="button"
                onClick={onContinue}
                className="btn-primary w-full py-4 text-base shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              >
                ✨ See your full brand kit →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
