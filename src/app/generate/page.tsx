"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import type { BrandInput, BrandVibe } from "@/types";

const VIBES: BrandVibe[] = [
  "fun", "premium", "luxury", "cute", "rebellious",
  "futuristic", "trustworthy", "minimalist", "bold", "playful",
];

export default function GeneratePage() {
  const router = useRouter();

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
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

        // Accumulate chunks — SSE lines can span multiple read() calls
        buffer += decoder.decode(value, { stream: true });

        // Process only complete lines (split on \n, keep remainder in buffer)
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // last element may be incomplete

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          let payload: { status: string; error?: string; id?: string };
          try {
            payload = JSON.parse(raw);
          } catch {
            continue; // incomplete data fragment, will be in buffer
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
              What idea would you like to<br className="hidden sm:block" /> bring to life?
            </h1>
            <p className="mt-3 text-muted max-w-md mx-auto">
              The more you share, the more magical your brand will be.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card space-y-6 p-8">
            <div>
              <label className="label" htmlFor="businessIdea">
                Your idea <span className="text-red-400">*</span>
              </label>
              <textarea
                id="businessIdea"
                required
                rows={3}
                value={form.businessIdea}
                onChange={(e) => update("businessIdea", e.target.value)}
                className="input"
                placeholder="e.g. I want to start a dog treat company for health-conscious pet owners"
              />
              <p className="mt-2 text-xs text-faint">
                Try: "A coffee brand for gamers." · "A candle company inspired by national parks." · "A productivity app for students."
              </p>
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
              ✦ Create My Brand →
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
