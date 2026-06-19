"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { useXP } from "@/components/XPSystem";
import { useToast } from "@/components/NixToast";
import type { BrandInput, BrandTrait, NameMode } from "@/types";

const TRAITS: { key: BrandTrait; emoji: string }[] = [
  { key: "playful",       emoji: "🎮" },
  { key: "funny",         emoji: "😄" },
  { key: "friendly",      emoji: "🤝" },
  { key: "bold",          emoji: "⚡" },
  { key: "luxury",        emoji: "💎" },
  { key: "professional",  emoji: "👔" },
  { key: "inspirational", emoji: "✨" },
  { key: "minimalist",    emoji: "◻️" },
  { key: "modern",        emoji: "🔷" },
  { key: "creative",      emoji: "🎨" },
  { key: "adventurous",   emoji: "🏔️" },
  { key: "elegant",       emoji: "🌸" },
  { key: "innovative",    emoji: "🚀" },
  { key: "trustworthy",   emoji: "🛡️" },
  { key: "energetic",     emoji: "🔥" },
  { key: "sophisticated", emoji: "🎯" },
  { key: "premium",       emoji: "⭐" },
  { key: "rebellious",    emoji: "💀" },
  { key: "authentic",     emoji: "💚" },
  { key: "approachable",  emoji: "😊" },
];

const MAX_TRAITS = 3;

// Map a trait to the closest legacy BrandVibe for backwards compat
function traitToVibe(trait: BrandTrait): BrandInput["vibe"] {
  const map: Partial<Record<BrandTrait, BrandInput["vibe"]>> = {
    playful: "playful", funny: "fun", bold: "bold", luxury: "luxury",
    rebellious: "rebellious", trustworthy: "trustworthy", minimalist: "minimalist",
    premium: "premium",
  };
  return map[trait] ?? "premium";
}

export default function GeneratePage() {
  const router = useRouter();
  const { trackGeneration } = useXP();
  const { showToast } = useToast();

  const [nameMode, setNameMode] = useState<NameMode | null>(null);
  const [form, setForm] = useState<BrandInput>({
    businessIdea: "",
    industry: "",
    targetAudience: "",
    vibe: "premium",
    keywords: "",
    avoid: "",
  });
  const [brandTraits, setBrandTraits] = useState<BrandTrait[]>([]);
  const [vibeDescription, setVibeDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof BrandInput>(key: K, value: BrandInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameMode) return;

    if (nameMode === "existing" && !form.providedBrandName?.trim()) {
      setError("Please enter your brand name.");
      return;
    }

    // Require at least one trait or a vibe description
    if (brandTraits.length === 0 && !vibeDescription.trim()) {
      setError("Choose at least one brand trait or describe your vibe.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: BrandInput = {
      ...form,
      nameMode,
      brandTraits: brandTraits.length > 0 ? brandTraits : undefined,
      vibeDescription: vibeDescription.trim() || undefined,
      // derive legacy vibe from first selected trait for backwards compat
      vibe: brandTraits.length > 0 ? traitToVibe(brandTraits[0]) : form.vibe,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          let payload: { status: string; error?: string; id?: string };
          try {
            payload = JSON.parse(raw);
          } catch {
            continue;
          }
          if (payload.status === "error") throw new Error(payload.error ?? "Generation failed.");
          if (payload.status === "done" && payload.id) {
            trackGeneration();
            showToast("Brand conjured! Welcome to your new brand ✨", "success", "🎉");
            router.push(`/brand/${payload.id}`);
            return;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1"><LoadingScreen /></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <span className="badge-purple mb-4 inline-block">✦ Brand Creator</span>
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              What would you like BrandGoblin to do?
            </h1>
            <p className="mt-3 text-muted max-w-md mx-auto">
              The more you share, the more magical your brand will be.
            </p>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
            <button
              type="button"
              onClick={() => setNameMode("generated")}
              className={`rounded-2xl border-2 p-6 text-left transition-all ${
                nameMode === "generated"
                  ? "border-primary/60 bg-primary/10"
                  : "border-[rgba(45,45,78,0.8)] hover:border-primary/40 hover:bg-[rgba(45,45,78,0.2)]"
              }`}
            >
              <span className="text-3xl block mb-3">🧌</span>
              <p className="font-display font-bold text-white text-lg mb-1">Name My Brand For Me</p>
              <p className="text-sm text-muted">I have an idea, but I need the perfect name.</p>
            </button>

            <button
              type="button"
              onClick={() => setNameMode("existing")}
              className={`rounded-2xl border-2 p-6 text-left transition-all ${
                nameMode === "existing"
                  ? "border-secondary/60 bg-secondary/10"
                  : "border-[rgba(45,45,78,0.8)] hover:border-secondary/40 hover:bg-[rgba(45,45,78,0.2)]"
              }`}
            >
              <span className="text-3xl block mb-3">✨</span>
              <p className="font-display font-bold text-white text-lg mb-1">Build Around My Name</p>
              <p className="text-sm text-muted">I already have a name. Create the story, visuals, and launch kit around it.</p>
            </button>
          </div>

          {/* Form — only shown after mode is selected */}
          {nameMode && (
            <form onSubmit={handleSubmit} className="bg-card space-y-6 p-8">

              {/* Existing name input */}
              {nameMode === "existing" && (
                <div>
                  <label className="label" htmlFor="providedBrandName">
                    Brand Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="providedBrandName"
                    required
                    value={form.providedBrandName ?? ""}
                    onChange={(e) => update("providedBrandName", e.target.value)}
                    className="input"
                    placeholder="e.g. Bark Barrel"
                  />
                </div>
              )}

              <div>
                <label className="label" htmlFor="businessIdea">
                  {nameMode === "existing" ? "What are you creating?" : "Your idea"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="businessIdea"
                  required
                  rows={3}
                  value={form.businessIdea}
                  onChange={(e) => update("businessIdea", e.target.value)}
                  className="input"
                  placeholder={
                    nameMode === "existing"
                      ? "e.g. A premium dog treat company made with natural ingredients."
                      : "e.g. I want to start a dog treat company for health-conscious pet owners"
                  }
                />
                {nameMode === "generated" && (
                  <p className="mt-2 text-xs text-faint">
                    Try: "A coffee brand for gamers." · "A candle company inspired by national parks." · "A productivity app for students."
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="industry">
                    Industry / category <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="industry"
                    required
                    value={form.industry}
                    onChange={(e) => update("industry", e.target.value)}
                    className="input"
                    placeholder="e.g. food & beverage, tech, fashion"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="targetAudience">
                    Who is this for? <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="targetAudience"
                    required
                    value={form.targetAudience}
                    onChange={(e) => update("targetAudience", e.target.value)}
                    className="input"
                    placeholder="e.g. busy moms, Gen Z gamers, small business owners"
                  />
                </div>
              </div>

              {/* ── Brand Personality ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label !mb-0">
                    Choose up to 3 Brand Traits <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-xs font-semibold tabular-nums transition ${
                    brandTraits.length === MAX_TRAITS ? "text-primary-light" : "text-faint"
                  }`}>
                    {brandTraits.length}/{MAX_TRAITS} selected
                  </span>
                </div>
                <p className="mb-4 text-xs text-faint">
                  Most great brands are a blend of personalities. Pick 1–3 that fit yours.
                </p>

                {/* Trait chips */}
                <div className="flex flex-wrap gap-2">
                  {TRAITS.map(({ key, emoji }) => {
                    const selected = brandTraits.includes(key);
                    const disabled = !selected && brandTraits.length >= MAX_TRAITS;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (selected) {
                            setBrandTraits((t) => t.filter((x) => x !== key));
                          } else if (brandTraits.length < MAX_TRAITS) {
                            setBrandTraits((t) => [...t, key]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                          selected
                            ? "border-primary/60 bg-primary/20 text-primary-light shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                            : disabled
                            ? "border-[rgba(45,45,78,0.4)] text-[rgba(255,255,255,0.2)] cursor-not-allowed"
                            : "border-[rgba(45,45,78,0.8)] text-muted hover:border-primary/40 hover:text-white"
                        }`}
                      >
                        <span>{emoji}</span>
                        {key}
                        {selected && <span className="text-xs ml-0.5">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Selected preview */}
                {brandTraits.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-faint">Your blend:</span>
                    {brandTraits.map((t) => (
                      <span key={t} className="rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary-light capitalize">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="flex-1 border-t border-[rgba(45,45,78,0.6)]" />
                  <span className="text-xs text-faint font-medium">OR</span>
                  <div className="flex-1 border-t border-[rgba(45,45,78,0.6)]" />
                </div>

                {/* Vibe description */}
                <div>
                  <label className="label !mb-1.5">
                    ✨ Describe Your Vibe
                    <span className="ml-2 text-xs text-faint font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={250}
                    value={vibeDescription}
                    onChange={(e) => setVibeDescription(e.target.value)}
                    className="input resize-none"
                    placeholder={`"Luxury but approachable" · "Like Apple meets Disney" · "Fun and playful with a professional edge"`}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-faint">You can use both — we'll blend them into one personality.</p>
                    <span className="text-xs text-faint tabular-nums">{vibeDescription.length}/250</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="keywords">Keywords (optional)</label>
                  <input
                    id="keywords"
                    value={form.keywords}
                    onChange={(e) => update("keywords", e.target.value)}
                    className="input"
                    placeholder="e.g. cozy, natural, bold"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="avoid">Things to avoid (optional)</label>
                  <input
                    id="avoid"
                    value={form.avoid}
                    onChange={(e) => update("avoid", e.target.value)}
                    className="input"
                    placeholder="e.g. corporate names, dark colors"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full py-4 text-base">
                ✦ Bring My Brand To Life →
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
