// The Vault (Creator Studio Phase B, Sept 2026).
// One flat list of everything a user has made: brand kits + Studio creations.
// Pure data shaping, no React, safe on the server. The dashboard page builds
// these once and hands plain objects to the client components.

import type { BrandGenerationRow } from "@/types";
import type { StudioJobRow } from "@/lib/studio/jobs";
import { IMAGE_TYPE_SIZES, type ImageType } from "@/lib/energy-config";

export interface VaultBrandItem {
  kind: "brand";
  id: string;
  createdAt: string;
  name: string;
  tagline: string | null;
  idea: string;
  industry: string | null;
  traits: string[];
  colors: { hex: string; name: string }[];
  favorite: boolean;
  archived: boolean;
  ownName: boolean;
  /** The brand's official logo from the Studio, when one is set. */
  logoUrl: string | null;
}

export interface VaultArtItem {
  kind: "art";
  id: string;
  createdAt: string;
  url: string | null;
  imageType: string | null;
  typeLabel: string;
  brandId: string | null;
  brandName: string | null;
  favorite: boolean;
  width: number;
  height: number;
  isThumbnail: boolean;
  jobType: string;
}

export type VaultItem = VaultBrandItem | VaultArtItem;

export const ART_TYPE_LABELS: Record<string, string> = {
  logo_concept:      "Logo",
  mascot:            "Mascot",
  social_graphic:    "Social graphic",
  product_art:       "Product art",
  youtube_thumbnail: "YouTube thumbnail",
  short_cover:       "Short-form cover",
};

const THUMBNAIL_TYPES = new Set(["youtube_thumbnail", "short_cover"]);

function artSize(imageType: string | null): { width: number; height: number } {
  const pinned = imageType ? IMAGE_TYPE_SIZES[imageType as ImageType] : undefined;
  if (!pinned) return { width: 1024, height: 1024 };
  // Thumbnails are rendered at the exact platform size by the overlay step.
  if (imageType === "youtube_thumbnail") return { width: 1280, height: 720 };
  if (imageType === "short_cover") return { width: 1080, height: 1920 };
  return { width: pinned.width, height: pinned.height };
}

export function brandToVaultItem(
  row: BrandGenerationRow,
  logoUrl: string | null = null
): VaultBrandItem {
  const input = row.input_data;
  const output = row.output_data;
  const traits = (input?.brandTraits?.length ? input.brandTraits : input?.vibe ? [input.vibe] : [])
    .slice(0, 2)
    .map(String);
  return {
    kind: "brand",
    id: row.id,
    createdAt: row.created_at,
    name: output?.recommendedName || "Untitled brand",
    tagline: output?.taglines?.[0] ?? null,
    idea: input?.businessIdea ?? "",
    industry: input?.industry ?? null,
    traits,
    colors: (output?.colorPalette ?? []).slice(0, 5).map((c) => ({ hex: c.hex, name: c.name })),
    favorite: !!row.favorite,
    archived: !!row.archived,
    ownName: input?.nameMode === "existing",
    logoUrl,
  };
}

export function jobToVaultItem(
  job: StudioJobRow,
  brandName: string | null
): VaultArtItem {
  const { width, height } = artSize(job.image_type);
  return {
    kind: "art",
    id: job.id,
    createdAt: job.created_at,
    url: job.output_url,
    imageType: job.image_type,
    typeLabel: ART_TYPE_LABELS[job.image_type ?? ""] ?? "Creation",
    brandId: job.brand_id,
    brandName,
    favorite: !!job.favorite,
    width,
    height,
    isThumbnail: THUMBNAIL_TYPES.has(job.image_type ?? ""),
    jobType: job.job_type,
  };
}

/**
 * Build the Vault: every brand (archived included, the gallery filters them)
 * plus every visible Studio creation, newest first. The hero is the newest
 * item that is not archived and actually has something to show.
 */
export function buildVault(
  rows: BrandGenerationRow[],
  jobs: StudioJobRow[],
  /** brand id → signed URL of its official logo (from listOfficialLogos). */
  officialLogos: Map<string, string> = new Map()
): { items: VaultItem[]; hero: VaultItem | null } {
  const nameById = new Map<string, string>();
  for (const r of rows) nameById.set(r.id, r.output_data?.recommendedName || "Untitled brand");

  const logoByBrand = new Map(officialLogos);
  for (const j of jobs) {
    if (j.official_logo && j.brand_id && j.output_url && !logoByBrand.has(j.brand_id)) {
      logoByBrand.set(j.brand_id, j.output_url);
    }
  }

  const items: VaultItem[] = [
    ...rows.map((r) => brandToVaultItem(r, logoByBrand.get(r.id) ?? null)),
    ...jobs.filter((j) => !!j.output_url).map((j) => jobToVaultItem(j, j.brand_id ? nameById.get(j.brand_id) ?? null : null)),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { items, hero: pickHero(items) };
}

/** The newest item that is not archived and actually has something to show. */
export function pickHero(items: VaultItem[]): VaultItem | null {
  return items.find((i) => (i.kind === "brand" ? !i.archived : !!i.url)) ?? null;
}

/** "Today", "Yesterday", "3 days ago"... Call after mount only (uses Date.now). */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
