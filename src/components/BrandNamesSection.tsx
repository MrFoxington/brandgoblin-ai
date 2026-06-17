"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import type { FavoriteName, AlternativeName, BrandNameOption, BrandInput } from "@/types";

type Props = {
  favoriteName?: FavoriteName;
  alternativeNames?: AlternativeName[];
  // Legacy fallback
  brandNames?: BrandNameOption[];
  topThreeReasoning?: string;
  recommendedName?: string;
  // For conjure more
  brandInput?: BrandInput;
};

export default function BrandNamesSection({
  favoriteName,
  alternativeNames,
  brandNames,
  topThreeReasoning,
  recommendedName,
  brandInput,
}: Props) {
  const [conjuring, setConjuring] = useState(false);
  const [conjureError, setConjureError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState(favoriteName);
  const [currentAlts, setCurrentAlts] = useState(alternativeNames ?? []);
  const [allSeenNames, setAllSeenNames] = useState<string[]>([
    ...(favoriteName ? [favoriteName.name] : []),
    ...(alternativeNames?.map((a) => a.name) ?? []),
    ...(brandNames?.map((b) => b.name) ?? []),
  ]);

  async function conjureMoreNames() {
    if (!brandInput) return;
    setConjuring(true);
    setConjureError(null);
    try {
      const res = await fetch("/api/generate/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: brandInput, excludeNames: allSeenNames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to conjure names.");
      setCurrentFavorite(data.favoriteName);
      setCurrentAlts(data.alternativeNames ?? []);
      setAllSeenNames((prev) => [
        ...prev,
        data.favoriteName.name,
        ...(data.alternativeNames?.map((a: AlternativeName) => a.name) ?? []),
      ]);
    } catch (err) {
      setConjureError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConjuring(false);
      setShowModal(false);
    }
  }

  // New format
  if (currentFavorite) {
    return (
      <div className="space-y-4">
        {/* Goblin's Favorite Pick */}
        <div
          className="rounded-2xl border-2 border-yellow-400/40 p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(124,58,237,0.08) 100%)",
            boxShadow: "0 0 40px rgba(234,179,8,0.08)",
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #eab308 0%, transparent 70%)" }} />

          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400 uppercase tracking-widest">
              🏆 Goblin&apos;s Favorite Pick
            </span>
            <CopyButton text={currentFavorite.name} label="" />
          </div>

          <p className="font-display text-4xl font-black text-white mb-2">{currentFavorite.name}</p>

          <p className="text-secondary font-medium italic mb-5">"{currentFavorite.tagline}"</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.3)] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-light mb-2">
                Why the Goblin picked it
              </p>
              <p className="text-sm text-muted leading-relaxed">{currentFavorite.whyPicked}</p>
            </div>
            <div className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.3)] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">
                Best for
              </p>
              <p className="text-sm text-muted leading-relaxed">{currentFavorite.bestFor}</p>
            </div>
          </div>
        </div>

        {/* Alternative Names */}
        {currentAlts.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-faint mb-3 px-1">
              Alternative Names
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentAlts.map((alt, i) => (
                <div
                  key={alt.name + i}
                  className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-bold text-white text-lg">{alt.name}</p>
                    <CopyButton text={alt.name} label="" className="shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-secondary italic">"{alt.tagline}"</p>
                  <p className="text-xs text-muted leading-relaxed">{alt.whyItWorks}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conjure More Names */}
        {conjureError && (
          <p className="text-sm text-red-400 text-center">{conjureError}</p>
        )}

        <button
          onClick={() => setShowModal(true)}
          disabled={conjuring}
          className="btn-secondary w-full py-3 text-sm font-semibold disabled:opacity-50"
        >
          {conjuring ? "Conjuring names…" : "✨ Conjure More Names"}
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-card w-full max-w-sm rounded-2xl border border-primary/20 p-8 text-center shadow-2xl">
              <span className="text-4xl block mb-4">🧌</span>
              <h3 className="font-display text-xl font-extrabold text-white mb-2">
                What would you like?
              </h3>
              <p className="text-sm text-muted mb-6">
                The Goblin can conjure fresh name ideas, or rebuild the whole brand from scratch.
              </p>
              <div className="space-y-3">
                <button
                  onClick={conjureMoreNames}
                  disabled={conjuring}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {conjuring ? "Conjuring…" : "✨ More Names Only"}
                </button>
                <a href="/generate" className="btn-secondary w-full py-3 block text-center">
                  🔄 Regenerate Full Brand
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-muted hover:text-white transition-colors w-full py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Legacy fallback for older saved brands
  return (
    <div className="space-y-3">
      {recommendedName && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-light mb-1">Recommended Name</p>
          <p className="font-display text-3xl font-black gradient-text">{recommendedName}</p>
          {topThreeReasoning && <p className="mt-2 text-sm text-muted leading-relaxed">{topThreeReasoning}</p>}
        </div>
      )}
      <ul className="space-y-2">
        {brandNames?.map((n, i) => (
          <li
            key={n.name + i}
            className="flex items-start justify-between gap-3 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] px-3 py-2.5"
          >
            <div>
              <p className="font-display font-semibold text-white">{n.name}</p>
              {n.reasoning && <p className="mt-0.5 text-xs text-muted leading-relaxed">{n.reasoning}</p>}
            </div>
            <CopyButton text={n.name} label="" className="shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
