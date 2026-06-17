"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import type { BrandInput, BrandVibe, NameMode } from "@/types";

const VIBES: BrandVibe[] = [
  "fun", "premium", "luxury", "cute", "rebellious",
  "futuristic", "trustworthy", "minimalist", "bold", "playful",
];

export default function GeneratePage() {
  const router = useRouter();

  const [nameMode, setNameMode] = useState<NameMode | null>(null);
  const [form, setForm] = useState<BrandInput>({
    businessIdea: "",
    industry: "",
    targetAudience: "",
    vibe: "premium",
    keywords: "",
    avoid: "",
  });
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

    setLoading(true);
    setError(null);

    const payload: BrandInput = { ...form, nameMode };

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

              <div>
                <label className="label">Brand personality <span className="text-red-400">*</span></label>
                <p className="mb-3 text-xs text-faint">How should your brand feel?</p>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map((vibe) => (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => update("vibe", vibe)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
                        form.vibe === vibe
                          ? "border-primary/60 bg-primary/20 text-primary-light"
                          : "border-[rgba(45,45,78,0.8)] text-muted hover:border-primary/40 hover:text-white"
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
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
