"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import type { BrandInput, BrandVibe } from "@/types";

const VIBES: BrandVibe[] = [
  "fun",
  "premium",
  "luxury",
  "cute",
  "rebellious",
  "futuristic",
  "trustworthy",
  "minimalist",
  "bold",
  "playful",
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong while summoning your brand.");
      }

      router.push(`/brand/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <LoadingScreen />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <span className="text-4xl">🧪</span>
            <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              Summon your brand
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              The more specific you are, the better the magic.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="goblin-card space-y-5 p-6 sm:p-8">
            <div>
              <label className="goblin-label" htmlFor="businessIdea">
                Business idea *
              </label>
              <textarea
                id="businessIdea"
                required
                rows={3}
                value={form.businessIdea}
                onChange={(e) => update("businessIdea", e.target.value)}
                className="goblin-input"
                placeholder="e.g. A subscription box that ships rare houseplants with care guides"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="goblin-label" htmlFor="industry">
                  Industry / category *
                </label>
                <input
                  id="industry"
                  required
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className="goblin-input"
                  placeholder="e.g. e-commerce, plants"
                />
              </div>
              <div>
                <label className="goblin-label" htmlFor="targetAudience">
                  Target audience *
                </label>
                <input
                  id="targetAudience"
                  required
                  value={form.targetAudience}
                  onChange={(e) => update("targetAudience", e.target.value)}
                  className="goblin-input"
                  placeholder="e.g. plant-loving millennials"
                />
              </div>
            </div>

            <div>
              <label className="goblin-label">Brand vibe *</label>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((vibe) => (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => update("vibe", vibe)}
                    className={
                      "rounded-full border px-3 py-1.5 text-sm capitalize transition " +
                      (form.vibe === vibe
                        ? "border-goblin-purple bg-goblin-purple/20 text-white"
                        : "border-goblin-border text-zinc-400 hover:border-goblin-purple/50")
                    }
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="goblin-label" htmlFor="keywords">
                  Optional keywords
                </label>
                <input
                  id="keywords"
                  value={form.keywords}
                  onChange={(e) => update("keywords", e.target.value)}
                  className="goblin-input"
                  placeholder="e.g. moss, jungle, cozy"
                />
              </div>
              <div>
                <label className="goblin-label" htmlFor="avoid">
                  Things to avoid
                </label>
                <input
                  id="avoid"
                  value={form.avoid}
                  onChange={(e) => update("avoid", e.target.value)}
                  className="goblin-input"
                  placeholder="e.g. childish names, the color pink"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            ) : null}

            <button type="submit" className="goblin-btn-primary w-full">
              Summon my brand kit ✨
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
