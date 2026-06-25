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

  async function handleConjure(e: React.FormEvent) {
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
        <span className="badge-purple">✦ Create your brand free — no credit card</span>
      </div>

      {/* Headline */}
      <h1 className="section-heading mb-4 text-5xl sm:text-6xl lg:text-7xl leading-tight">
        Watch your idea<br />
        <span className="gradient-text">become a brand.</span>
      </h1>

      {/* Typewriter subline */}
      <p className="mb-8 text-lg text-muted max-w-xl mx-auto lg:mx-0 min-h-[1.75rem]">
        Try it →{" "}
        <span className="text-secondary font-medium">
          {displayed}
          {!shouldReduce && <span className="animate-pulse text-primary">|</span>}
        </span>
      </p>

      {/* Interactive input */}
      <form onSubmit={handleConjure} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0">
          <input
            ref={inputRef}
            type="text"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Type any idea… a cereal company for adults"
            className="input flex-1 text-sm"
            maxLength={200}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="btn-primary px-6 py-3 text-sm font-bold shrink-0 disabled:opacity-60"
          >
            {loading ? "Conjuring…" : "✦ Conjure it →"}
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
            className="mb-6 flex items-center gap-2 text-sm text-muted max-w-xl mx-auto lg:mx-0"
          >
            <span className="inline-block animate-spin">🧌</span>
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
            className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-6 py-5 text-left max-w-xl mx-auto lg:mx-0"
          >
            <p className="text-xs text-muted mb-2 uppercase tracking-widest">Nix conjured →</p>
            <p className="font-display text-2xl font-black text-white mb-1">{result.name}</p>
            <p className="text-secondary font-medium text-sm mb-4">"{result.tagline}"</p>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-muted mb-3">
                That's 1 of 12. The full kit has names, colors, voice, story, launch plan — and it's yours, free.
              </p>
              <Link
                href="/signup"
                className="btn-primary text-sm px-6 py-2.5 inline-flex"
              >
                ✦ Get the full kit — free →
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
            className="mb-6 text-sm text-amber-400 max-w-xl mx-auto lg:mx-0"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Primary CTA (shown when no result yet) */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start mb-8">
          <Link href="/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
            ✦ Start Creating — Free →
          </Link>
          <Link href="/pricing" className="btn-secondary w-full sm:w-auto px-6 py-4 text-base">
            See what's included
          </Link>
        </div>
      )}

      {/* Honest trust signals */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-faint">
        <span>✓ No card required</span>
        <span>✓ Built by brand strategists</span>
        <span>✓ Powered by Claude AI</span>
        <span>✓ Cancel anytime</span>
      </div>
    </div>
  );
}
