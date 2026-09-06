"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const SUBLINES = [
  "a coffee brand for night owls",
  "a skincare line that feels like Sunday",
  "a podcast for recovering perfectionists",
  "a meditation app for gamers",
  "a hot sauce for people who cry at movies",
  "a finance newsletter for 20-somethings",
  "a cereal company for adults",
  "a travel brand for introverts",
];

interface TeaserResult { name: string; tagline: string }

export default function HeroInteractive() {
  const shouldReduce = useReducedMotion();

  // Typewriter subline
  const [subIdx, setSubIdx]       = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting]   = useState(false);
  const [charIdx, setCharIdx]     = useState(0);

  useEffect(() => {
    if (shouldReduce) { setDisplayed(SUBLINES[0]); return; }
    const current = SUBLINES[subIdx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (charIdx < current.length) {
        t = setTimeout(() => { setDisplayed(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 55);
      } else {
        t = setTimeout(() => setDeleting(true), 2400);
      }
    } else {
      if (charIdx > 0) {
        t = setTimeout(() => { setDisplayed(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 30);
      } else {
        setDeleting(false);
        setSubIdx(i => (i + 1) % SUBLINES.length);
      }
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, subIdx, shouldReduce]);

  // Teaser state
  const [idea, setIdea]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TeaserResult | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for idea injected from IdeaSparkSection
  useEffect(() => {
    function onNixIdea(e: Event) {
      const idea = (e as CustomEvent<string>).detail;
      setIdea(idea);
      setResult(null);
      setError(null);
      inputRef.current?.focus();
    }
    window.addEventListener("nix-idea", onNixIdea);
    return () => window.removeEventListener("nix-idea", onNixIdea);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = idea.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nix dropped the scroll. Try again.");
      } else {
        setResult(data as TeaserResult);
      }
    } catch {
      setError("Couldn't reach Nix right now. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 text-center lg:text-left">
      {/* Badge */}
      <div className="mb-6 flex justify-center lg:justify-start">
        <span className="badge-goblin">Create your brand free. No card needed.</span>
      </div>

      {/* Headline — the demonstration hero sits directly above the live demo */}
      <h1 className="section-heading mb-5 text-5xl sm:text-6xl lg:text-[4.75rem]">
        This brand didn&rsquo;t exist<br />
        <span className="accent">two minutes ago.</span>
      </h1>

      {/* Subhead */}
      <p className="mb-4 text-lg text-ink-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
        One sentence in, twelve deliverables out. Type your idea and watch Nix work.
      </p>

      {/* Typewriter example hint */}
      <p className="mb-8 text-base text-ink-faint max-w-xl mx-auto lg:mx-0 min-h-[1.75rem]">
        Try{" "}
        <span className="text-goblin font-medium">
          {displayed}
          {!shouldReduce && <span className="animate-pulse text-goblin">|</span>}
        </span>
      </p>

      {/* Interactive input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0">
          <input
            ref={inputRef}
            type="text"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Type any idea… a cereal company for adults"
            className="input flex-1 text-base"
            maxLength={200}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="btn-primary px-6 py-3 text-sm font-bold shrink-0"
          >
            {loading ? "Nix is working…" : "See it →"}
          </button>
        </div>
      </form>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-2 text-sm text-ink-muted max-w-xl mx-auto lg:mx-0"
          >
            <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-goblin/30 border-t-goblin animate-spin" />
            <span>Nix is obsessing over every detail…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6 rounded-2xl border border-goblin/40 bg-white px-6 py-5 text-left max-w-xl mx-auto lg:mx-0 shadow-[0_12px_32px_-20px_rgba(46,125,91,0.35)]"
          >
            <p className="text-xs text-goblin mb-2 uppercase tracking-widest font-bold">Nix made</p>
            <p className="font-display text-3xl font-semibold text-ink mb-1">{result.name}</p>
            <p className="text-ink-muted italic text-sm mb-4">&ldquo;{result.tagline}&rdquo;</p>
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted mb-3">
                That&rsquo;s 1 of 12. The full kit has names, colors, voice, story, launch plan. And it&rsquo;s yours, free.
              </p>
              <Link
                href="/signup"
                className="btn-primary text-sm px-6 py-2.5 inline-flex"
              >
                Start free. No card needed.
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && !loading && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6 text-sm text-red-700 max-w-xl mx-auto lg:mx-0"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Primary CTA (shown when no result yet) */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start mb-8">
          <Link href="/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
            Start free. No card needed.
          </Link>
          <Link href="/pricing" className="btn-secondary w-full sm:w-auto px-6 py-4 text-base">
            See what's included
          </Link>
        </div>
      )}

      {/* Honest trust signals */}
      {/* Honest trust signals. "Built by brand strategists" was cut (unverifiable,
          same honesty rule as the Aug 12 ComparisonSection fix). */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-ink-faint">
        <span>✓ No card required</span>
        <span>✓ Yours to keep, forever</span>
        <span>✓ Powered by Claude</span>
        <span>✓ Cancel anytime</span>
      </div>
    </div>
  );
}
