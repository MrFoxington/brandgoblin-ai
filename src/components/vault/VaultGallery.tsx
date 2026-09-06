"use client";

/**
 * VaultGallery (Creator Studio Phase B, Sept 2026).
 * Everything the user has made in one masonry: brand kits and Studio art
 * side by side, filter chips by type and by brand. Archive/restore for
 * brands reuses the existing /api/brands/archive route (never deletes).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { VaultItem, VaultArtItem, VaultBrandItem } from "@/lib/vault";

type TypeFilter = "all" | "brands" | "art" | "thumbnails" | "favorites" | "archived";

interface Props {
  items: VaultItem[];
  /** Active (non-archived) brands, for the brand chips. */
  brands: { id: string; name: string }[];
  onToggleArchive: (id: string, archived: boolean) => void;
}

export default function VaultGallery({ items, brands, onToggleArchive }: Props) {
  const reduce = useReducedMotion();
  const [type, setType] = useState<TypeFilter>("all");
  const [brandId, setBrandId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const active = items.filter((i) => i.kind !== "brand" || !i.archived);
    return {
      all: active.length,
      brands: active.filter((i) => i.kind === "brand").length,
      art: active.filter((i) => i.kind === "art" && !i.isThumbnail).length,
      thumbnails: active.filter((i) => i.kind === "art" && i.isThumbnail).length,
      favorites: active.filter((i) => i.favorite).length,
      archived: items.filter((i) => i.kind === "brand" && i.archived).length,
    };
  }, [items]);

  const visible = items.filter((i) => {
    if (type === "archived") return i.kind === "brand" && i.archived;
    if (i.kind === "brand" && i.archived) return false;
    if (brandId) {
      const matches = i.kind === "brand" ? i.id === brandId : i.brandId === brandId;
      if (!matches) return false;
    }
    switch (type) {
      case "brands":     return i.kind === "brand";
      case "art":        return i.kind === "art" && !i.isThumbnail;
      case "thumbnails": return i.kind === "art" && i.isThumbnail;
      case "favorites":  return i.favorite;
      default:           return true;
    }
  });

  const chips: { key: TypeFilter; label: string; show: boolean }[] = [
    { key: "all",        label: `All ${counts.all}`,               show: true },
    { key: "brands",     label: `Brands ${counts.brands}`,         show: counts.brands > 0 && counts.all > counts.brands },
    { key: "art",        label: `Art ${counts.art}`,               show: counts.art > 0 },
    { key: "thumbnails", label: `Thumbnails ${counts.thumbnails}`, show: counts.thumbnails > 0 },
    { key: "favorites",  label: `★ Favorites ${counts.favorites}`, show: counts.favorites > 0 },
    { key: "archived",   label: `Archived ${counts.archived}`,     show: counts.archived > 0 },
  ];
  const showChips = chips.filter((c) => c.show).length > 1;
  const showBrandChips = brands.length > 1 && type !== "archived";

  // If the last archived brand gets restored while on that tab, snap back;
  // if archived kits are ALL there is, open on that tab so they stay reachable.
  if (type === "archived" && counts.archived === 0) setType("all");
  if (type === "all" && counts.all === 0 && counts.archived > 0) setType("archived");

  if (items.length === 0) return null;

  return (
    <section aria-label="Everything you have made">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-white">Everything you&apos;ve made</h2>
        {showChips && (
          <div className="flex flex-wrap gap-1.5">
            {chips.filter((c) => c.show).map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setType(c.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  type === c.key
                    ? "border-primary/60 bg-primary/20 text-primary-light"
                    : "border-[rgba(250,247,242,0.12)] text-muted hover:border-primary/40 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showBrandChips && brands.length > 6 && (
        <div className="mb-5 flex items-center gap-2 md:hidden">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">Brand</span>
          <select
            value={brandId ?? ""}
            onChange={(e) => setBrandId(e.target.value || null)}
            className="min-w-0 flex-1 rounded-xl border border-[rgba(250,247,242,0.12)] bg-[rgba(20,21,24,0.6)] px-3 py-2 text-sm text-white focus:border-gold/60 focus:outline-none"
            aria-label="Filter by brand"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {showBrandChips && (
        <div className={`mb-5 flex-wrap items-center gap-1.5 ${brands.length > 6 ? "hidden md:flex" : "flex"}`}>
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-widest text-faint">Brand</span>
          <button
            type="button"
            onClick={() => setBrandId(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              brandId === null
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-[rgba(250,247,242,0.12)] text-muted hover:border-gold/40 hover:text-white"
            }`}
          >
            All brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrandId(brandId === b.id ? null : b.id)}
              className={`max-w-[160px] truncate rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                brandId === b.id
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-[rgba(250,247,242,0.12)] text-muted hover:border-gold/40 hover:text-white"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {type === "archived" && (
        <p className="mb-4 text-xs text-faint">
          Archived brands are never deleted. Restore one anytime and it goes right back into your vault.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[rgba(250,247,242,0.12)] py-14 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      ) : (
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3">
          {visible.map((item, i) => (
            <motion.div
              key={`${item.kind}-${item.id}`}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: Math.min(i * 0.03, 0.36) }}
              className="mb-3 break-inside-avoid sm:mb-4"
            >
              {item.kind === "art" ? (
                <ArtCard item={item} />
              ) : (
                <BrandCard item={item} onToggleArchive={onToggleArchive} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function ArtCard({ item }: { item: VaultArtItem }) {
  const href = item.brandId ? `/dashboard/studio?brand=${item.brandId}` : "/dashboard/studio";
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-[rgba(250,247,242,0.08)] bg-black/30 transition-colors hover:border-[rgba(250,247,242,0.22)]"
      aria-label={`${item.typeLabel}${item.brandName ? ` for ${item.brandName}` : ""}`}
    >
      <div className="relative w-full" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
        {item.url && (
          <Image
            src={item.url}
            alt={`${item.typeLabel}${item.brandName ? ` for ${item.brandName}` : ""}`}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 28vw"
            className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        )}
      </div>
      {item.favorite && (
        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-1.5 py-0.5 text-[11px] text-gold" aria-hidden>★</span>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="text-xs font-semibold text-white">{item.typeLabel}</p>
        {item.brandName && <p className="truncate text-[11px] text-white/70">{item.brandName}</p>}
      </div>
    </Link>
  );
}

function BrandCard({
  item,
  onToggleArchive,
}: {
  item: VaultBrandItem;
  onToggleArchive: (id: string, archived: boolean) => void;
}) {
  const colors = item.colors.length ? item.colors : [{ hex: "#2E7D5B", name: "Goblin green" }];
  return (
    <Link
      href={`/brand/${item.id}`}
      className={`group relative block overflow-hidden rounded-2xl border border-[rgba(250,247,242,0.08)] bg-surface transition-colors hover:border-primary/40 ${item.archived ? "opacity-60" : ""}`}
    >
      {/* Poster strip: the palette, with the official logo on top when set */}
      <div className="relative flex h-20 sm:h-24">
        {colors.map((c, i) => (
          <span key={c.hex + i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
        ))}
        {item.logoUrl && (
          <span className="absolute left-3 top-3 h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-paper shadow-md sm:h-14 sm:w-14">
            <Image src={item.logoUrl} alt="" fill unoptimized sizes="56px" className="object-contain p-1" />
          </span>
        )}
        <button
          type="button"
          title={item.archived ? "Restore brand" : "Archive brand"}
          aria-label={item.archived ? "Restore brand" : "Archive brand"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleArchive(item.id, !item.archived);
          }}
          className="absolute right-2 top-2 rounded-md bg-black/45 px-1.5 py-0.5 text-xs leading-none text-white/80 opacity-0 transition-opacity hover:bg-black/70 hover:text-white focus:opacity-100 group-hover:opacity-100"
        >
          {item.archived ? "↩" : "✕"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight text-white transition-colors group-hover:text-primary-light sm:text-lg">
            {item.name}
          </h3>
          {item.favorite && <span className="shrink-0 text-xs text-gold" aria-label="Favorite">★</span>}
        </div>
        {item.tagline && <p className="line-clamp-1 text-xs italic text-primary-light">&ldquo;{item.tagline}&rdquo;</p>}
        {item.idea && <p className="line-clamp-2 text-xs leading-relaxed text-muted">{item.idea}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[rgba(250,247,242,0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
            Brand kit
          </span>
          {item.industry && <span className="badge-green !px-2 !py-0.5 text-[10px] capitalize">{item.industry}</span>}
          {item.ownName && <span className="badge-purple !px-2 !py-0.5 text-[10px]">Own name</span>}
        </div>
      </div>
    </Link>
  );
}
