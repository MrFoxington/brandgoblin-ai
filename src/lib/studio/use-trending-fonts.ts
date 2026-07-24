"use client";

// Client hook for the 🔥 Hot Right Now font shelf. Fetches once per page load
// (module-level promise cache) and degrades to null silently — pickers render
// their static groups either way.

import { useEffect, useState } from "react";

export interface TrendingFontClient {
  family: string;
  category: "display" | "serif" | "sans";
  reason: string;
}

export interface TrendingFontsClientPayload {
  monthKey: string;
  label: string;
  fonts: TrendingFontClient[];
}

let inflight: Promise<TrendingFontsClientPayload | null> | null = null;

function fetchTrending(): Promise<TrendingFontsClientPayload | null> {
  inflight ??= fetch("/api/studio/trending-fonts")
    .then((r) => (r.ok ? (r.json() as Promise<TrendingFontsClientPayload>) : null))
    .then((d) => (d && Array.isArray(d.fonts) && d.fonts.length > 0 ? d : null))
    .catch(() => null);
  return inflight;
}

export function useTrendingFonts(): TrendingFontsClientPayload | null {
  const [data, setData] = useState<TrendingFontsClientPayload | null>(null);
  useEffect(() => {
    let alive = true;
    fetchTrending().then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, []);
  return data;
}
