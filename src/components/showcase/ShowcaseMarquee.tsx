"use client";

import { useEffect, useState } from "react";
import type { ShowcaseItem } from "@/lib/studio/showcase";
import ShowcaseCard from "./ShowcaseCard";

interface Props {
  // Optional server-fetched initial data; falls back to client fetch.
  initialItems?: ShowcaseItem[];
}

export default function ShowcaseMarquee({ initialItems }: Props) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialItems ?? []);
  // Consider "loaded" immediately if we have SSR data (instant paint); otherwise wait.
  const [loaded, setLoaded] = useState<boolean>(!!initialItems?.length);

  // Always refresh on mount (never short-circuit on initialItems) — initialItems are
  // for instant first paint only; this guarantees a stale/empty SSR render never sticks
  // and signed URLs stay live even if the embed sits idle in an iframe.
  useEffect(() => {
    let active = true;
    fetch("/api/showcase", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (active && Array.isArray(d.items)) setItems(d.items); })
      .catch(() => { /* keep prior items — never blank the wall on error */ })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  // ── Empty / loading states — never a broken or blank wall ──────────────────
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted">
        Loading creations…
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-2 text-center px-6">
        <p className="text-base font-bold text-white">Fresh creations coming soon ✨</p>
        <p className="text-sm text-muted">Real brands made with Goblin Studio will appear here.</p>
      </div>
    );
  }

  // Duplicate the list so the -50% marquee translate loops seamlessly.
  const doubled = [...items, ...items];

  return (
    <div className="group relative w-full overflow-hidden">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-bg to-transparent" />

      {/*
        Motion-OK: seamless marquee, pause on hover.
        Reduced-motion: animation disabled (motion-reduce:animate-none) + the track
        becomes a normal swipeable row via the overflow-x-auto wrapper below.
      */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 w-max px-4 py-2 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {doubled.map((item, i) => (
            <ShowcaseCard key={`${item.id}-${i}`} item={item} priority={i < 4} />
          ))}
        </div>
      </div>
    </div>
  );
}
