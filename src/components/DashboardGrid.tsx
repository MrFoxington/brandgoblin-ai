"use client";

import { useState } from "react";
import Link from "next/link";
import type { BrandGenerationRow } from "@/types";

type Filter = "all" | "favorites" | "generated" | "existing";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function DashboardGrid({ rows }: { rows: BrandGenerationRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const hasExisting = rows.some((r) => (r.input_data as { nameMode?: string }).nameMode === "existing");
  const hasFavorites = rows.some((r) => r.favorite);

  const filtered = rows.filter((r) => {
    if (filter === "favorites") return r.favorite;
    if (filter === "generated") return (r.input_data as { nameMode?: string }).nameMode !== "existing";
    if (filter === "existing") return (r.input_data as { nameMode?: string }).nameMode === "existing";
    return true;
  });

  const filters: { key: Filter; label: string; show: boolean }[] = [
    { key: "all", label: `All (${rows.length})`, show: true },
    { key: "favorites", label: `★ Favorites`, show: hasFavorites },
    { key: "generated", label: `🧌 Named by Goblin`, show: hasExisting },
    { key: "existing", label: `✨ My Own Name`, show: hasExisting },
  ];

  return (
    <div>
      {/* Filter bar — only show if there's something to filter */}
      {(hasFavorites || hasExisting) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.filter((f) => f.show).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                filter === f.key
                  ? "border-primary/60 bg-primary/20 text-primary-light"
                  : "border-[rgba(45,45,78,0.8)] text-muted hover:border-primary/40 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted py-16">No brands match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <BrandCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandCard({ row }: { row: BrandGenerationRow }) {
  const input = row.input_data as { nameMode?: string; businessIdea?: string; vibe?: string; industry?: string };
  const output = row.output_data;
  const isExisting = input.nameMode === "existing";
  const tagline = output?.taglines?.[0];
  const colors = output?.colorPalette?.slice(0, 4) ?? [];

  return (
    <Link
      href={`/brand/${row.id}`}
      className="bg-card bg-card-hover group flex flex-col gap-3 p-6"
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isExisting ? (
            <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
              ✨ Own Name
            </span>
          ) : (
            <span className="text-xl logo-glow">🧌</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {row.favorite && (
            <span className="badge-green text-xs">★ Favorite</span>
          )}
          <span className="text-xs text-faint">{timeAgo(row.created_at)}</span>
        </div>
      </div>

      {/* Brand name */}
      <h3 className="font-display text-xl font-black text-white group-hover:text-primary-light transition-colors leading-tight">
        {output?.recommendedName ?? "Untitled Brand"}
      </h3>

      {/* Tagline */}
      {tagline && (
        <p className="text-xs text-secondary italic line-clamp-1">"{tagline}"</p>
      )}

      {/* Business idea */}
      <p className="line-clamp-2 text-sm text-muted leading-relaxed flex-1">
        {input?.businessIdea}
      </p>

      {/* Color palette dots */}
      {colors.length > 0 && (
        <div className="flex items-center gap-1.5">
          {colors.map((c) => (
            <span
              key={c.hex}
              title={c.name}
              className="h-4 w-4 rounded-full border border-white/10 shrink-0"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      )}

      {/* Bottom badges */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[rgba(45,45,78,0.4)] mt-auto">
        {input?.vibe && (
          <span className="badge-purple text-xs capitalize">{input.vibe}</span>
        )}
        {input?.industry && (
          <span className="badge-green text-xs capitalize truncate max-w-[120px]">{input.industry}</span>
        )}
      </div>
    </Link>
  );
}
