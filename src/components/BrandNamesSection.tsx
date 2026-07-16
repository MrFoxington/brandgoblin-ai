"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import type { FavoriteName, AlternativeName, BrandNameOption, BrandInput } from "@/types";

export type NamesPatch = {
  favoriteName?: FavoriteName;
  alternativeNames?: AlternativeName[];
  recommendedName?: string;
};

type Props = {
  favoriteName?: FavoriteName;
  alternativeNames?: AlternativeName[];
  // Legacy fallback
  brandNames?: BrandNameOption[];
  topThreeReasoning?: string;
  recommendedName?: string;
  // For conjure more
  brandInput?: BrandInput;
  // Persistence (July 16 2026 fix — conjured names used to vanish on refresh)
  brandId?: string;
  onNamesUpdate?: (patch: NamesPatch) => void;
};

export default function BrandNamesSection({
  favoriteName,
  alternativeNames,
  brandNames,
  topThreeReasoning,
  recommendedName,
  brandInput,
  brandId,
  onNamesUpdate,
}: Props) {
  const [conjuring, setConjuring] = useState(false);
  const [conjureError, setConjureError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState(favoriteName);
  const [currentAlts, setCurrentAlts] = useState(alternativeNames ?? []);
  const [currentRecommended, setCurrentRecommended] = useState(recommendedName);
  const [savingName, setSavingName] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [allSeenNames, setAllSeenNames] = useState<string[]>([
    ...(favoriteName ? [favoriteName.name] : []),
    ...(alternativeNames?.map((a) => a.name) ?? []),
    ...(brandNames?.map((b) => b.name) ?? []),
  ]);

  // Writes name changes to the database so a refresh can never lose them
  async function persist(patch: NamesPatch): Promise<boolean> {
    if (!brandId) return true; // preview contexts with no saved brand — state only
    try {
      const res = await fetch("/api/brands/update-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandGenerationId: brandId, ...patch }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function conjureMoreNames() {
    if (!brandInput) return;
    setConjuring(true);
    setConjureError(null);
    setSaveError(null);
    try {
      const res = await fetch("/api/generate/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: brandInput, excludeNames: allSeenNames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to conjure names.");
      const newAlts: AlternativeName[] = data.alternativeNames ?? [];
      setCurrentFavorite(data.favoriteName);
      setCurrentAlts(newAlts);
      setAllSeenNames((prev) => [
        ...prev,
        data.favoriteName.name,
        ...newAlts.map((a) => a.name),
      ]);
      // SAVE the fresh names — refresh must never eat them again
      const patch: NamesPatch = { favoriteName: data.favoriteName, alternativeNames: newAlts };
      onNamesUpdate?.(patch);
      const ok = await persist(patch);
      if (!ok) setSaveError("Names conjured but not saved — check your connection and conjure again.");
    } catch (err) {
      setConjureError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConjuring(false);
      setShowModal(false);
    }
  }

  // Make a name THE brand name (favorite card or a promoted alternative).
  // Old favorite is demoted into the alternatives — nothing is ever lost.
  async function useThisName(altIndex: number | null) {
    if (!currentFavorite || savingName) return;
    const prev = {
      fav: currentFavorite,
      alts: currentAlts,
      rec: currentRecommended,
    };

    let newFav = currentFavorite;
    let newAlts = [...currentAlts];
    if (altIndex !== null) {
      const alt = newAlts[altIndex];
      if (!alt) return;
      newFav = { name: alt.name, tagline: alt.tagline, whyPicked: alt.whyItWorks, bestFor: "" };
      newAlts.splice(altIndex, 1);
      newAlts = [
        { name: currentFavorite.name, tagline: currentFavorite.tagline, whyItWorks: currentFavorite.whyPicked },
        ...newAlts,
      ];
    }

    const patch: NamesPatch = {
      favoriteName: newFav,
      alternativeNames: newAlts,
      recommendedName: newFav.name,
    };

    // Optimistic update, revert on failure
    setSavingName(newFav.name);
    setSaveError(null);
    setCurrentFavorite(newFav);
    setCurrentAlts(newAlts);
    setCurrentRecommended(newFav.name);
    onNamesUpdate?.(patch);

    const ok = await persist(patch);
    if (!ok) {
      setCurrentFavorite(prev.fav);
      setCurrentAlts(prev.alts);
      setCurrentRecommended(prev.rec);
      onNamesUpdate?.({
        favoriteName: prev.fav,
        alternativeNames: prev.alts,
        ...(prev.rec ? { recommendedName: prev.rec } : {}),
      });
      setSaveError("Couldn't save the name — try again.");
    }
    setSavingName(null);
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
            {currentFavorite.bestFor && (
              <div className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.3)] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">
                  Best for
                </p>
                <p className="text-sm text-muted leading-relaxed">{currentFavorite.bestFor}</p>
              </div>
            )}
          </div>

          {/* Make it official — or show it already is */}
          <div className="mt-5">
            {currentRecommended === currentFavorite.name ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">
                ✓ Your brand name
              </span>
            ) : (
              <button
                onClick={() => useThisName(null)}
                disabled={!!savingName}
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-5 py-2.5 text-sm font-bold text-yellow-300 hover:bg-yellow-400/20 transition-colors disabled:opacity-50"
              >
                {savingName === currentFavorite.name ? "Saving…" : "★ Make this my brand name"}
              </button>
            )}
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
                  <button
                    onClick={() => useThisName(i)}
                    disabled={!!savingName}
                    className="mt-1 self-start rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary-light hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {savingName === alt.name ? "Saving…" : "Use this name →"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conjure More Names */}
        {conjureError && (
          <p className="text-sm text-red-400 text-center">{conjureError}</p>
        )}
        {saveError && (
          <p className="text-sm text-red-400 text-center">{saveError}</p>
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
