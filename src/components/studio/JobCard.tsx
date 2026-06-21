"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES } from "@/lib/energy-config";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";
import { useSoundFx } from "@/components/primitives/SoundFx";
import { shareImage } from "@/lib/studio/share";

interface Props {
  job: StudioJobRow;
  onMoreLikeThis?: (job: StudioJobRow) => Promise<void>;
  onProcess?: (job: StudioJobRow, operation: "bg_removal" | "clarity_upscaler") => Promise<void>;
  onShareSuccess?: (job: StudioJobRow) => void;
  onToggleFavorite?: (job: StudioJobRow, next: boolean) => Promise<boolean>;
}

const IMAGE_TYPE_LABELS: Record<string, string> = {
  logo_concept:   "Logo Concept",
  social_graphic: "Social Graphic",
  product_art:    "Product Art",
};

const MODEL_LABELS: Record<string, string> = {
  flux_schnell:    "Standard",
  flux_pro_v1:     "Premium",
  seedream_v45:    "Artistic",
  bg_removal:      "BG Removed",
  clarity_upscaler: "Upscaled",
};

// Tags for derived (post-processed) jobs
const DERIVED_TAGS: Record<string, string> = {
  bg_removal:      "Background removed",
  clarity_upscaler: "✨ Upscaled",
};

export default function JobCard({ job, onMoreLikeThis, onProcess, onShareSuccess, onToggleFavorite }: Props) {
  const { playShare, playButtonPress } = useSoundFx();
  const reduce = useReducedMotion();
  const [downloading, setDownloading]   = useState(false);
  const [sharing, setSharing]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [processing, setProcessing]     = useState<"bg_removal" | "clarity_upscaler" | null>(null);
  const [moreLikeThis, setMoreLikeThis] = useState(false);
  const [fav, setFav]                   = useState<boolean>(job.favorite);
  const [favBusy, setFavBusy]           = useState(false);

  const pinnedSize = job.image_type
    ? IMAGE_TYPE_SIZES[job.image_type as ImageType] ?? IMAGE_TYPE_SIZES.logo_concept
    : IMAGE_TYPE_SIZES.logo_concept;

  const bgRemovalCost = computeStudioEnergyCost("bg_removal", {
    width: pinnedSize.width,
    height: pinnedSize.height,
  });
  const upscaleCost = computeStudioEnergyCost("clarity_upscaler", {
    width: pinnedSize.width,
    height: pinnedSize.height,
  });

  const isOriginalImage = job.job_type === "image";
  const derivedTag = DERIVED_TAGS[job.job_type] ?? null;

  async function handleDownload() {
    if (!job.output_url || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(job.output_url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `goblin-studio-${job.image_type ?? "image"}-${job.id.slice(0, 8)}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* non-fatal */ } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    if (!job.output_url || sharing) return;
    setSharing(true);
    // Single real-share-only flow shared with the reveal celebration.
    const result = await shareImage(job.output_url);
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setSharing(false);
    // Celebrate ONLY a genuine success (shared or copied) — never on cancel.
    if (result === "shared" || result === "copied") {
      playShare();
      onShareSuccess?.(job);
    }
  }

  async function handleProcess(operation: "bg_removal" | "clarity_upscaler") {
    if (!onProcess || processing) return;
    setProcessing(operation);
    try {
      await onProcess(job, operation);
    } finally {
      setProcessing(null);
    }
  }

  async function handleMoreLikeThis() {
    if (!onMoreLikeThis || moreLikeThis) return;
    setMoreLikeThis(true);
    try {
      await onMoreLikeThis(job);
    } finally {
      setMoreLikeThis(false);
    }
  }

  async function handleToggleFavorite() {
    if (!onToggleFavorite || favBusy) return;
    const next = !fav;
    setFav(next);          // optimistic
    setFavBusy(true);
    playButtonPress();
    try {
      const ok = await onToggleFavorite(job, next);
      if (!ok) setFav(!next); // revert on API failure
    } catch {
      setFav(!next);          // revert on network failure
    } finally {
      setFavBusy(false);
    }
  }

  if (!job.output_url) return null;

  const typeLabel  = IMAGE_TYPE_LABELS[job.image_type ?? ""] ?? job.image_type ?? "Image";
  const modelLabel = MODEL_LABELS[job.model_key] ?? job.model_key;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-primary/20 bg-card overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-black/30">
        <Image
          src={job.output_url}
          alt={`${typeLabel} by Goblin Studio`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 50vw"
          unoptimized
        />
        {/* Derived variant tag */}
        {derivedTag && (
          <span className="absolute top-2 left-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {derivedTag}
          </span>
        )}
        {/* Favorite star — gold pop when set */}
        {onToggleFavorite && (
          <button
            onClick={handleToggleFavorite}
            disabled={favBusy}
            aria-pressed={fav}
            title={fav ? "Remove from Favorites" : "Add to Favorites"}
            className="absolute top-2 right-2 rounded-full bg-black/55 backdrop-blur-sm p-1.5 leading-none hover:bg-black/70 transition-colors disabled:opacity-70"
          >
            <motion.span
              key={fav ? "on" : "off"}
              initial={reduce ? false : { scale: 0.5 }}
              animate={reduce ? {} : { scale: fav ? [1.4, 1] : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 16 }}
              className={`block text-base ${fav ? "drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" : ""}`}
            >
              {fav ? "⭐" : "☆"}
            </motion.span>
          </button>
        )}
      </div>

      {/* Meta + actions */}
      <div className="p-4 space-y-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{typeLabel}</p>
          <p className="text-xs text-faint">{modelLabel} · ⚡ {job.energy_reserved} used</p>
        </div>

        {/* Primary loop actions — only Share (orange) + More like this (green) get bold color */}
        <div className="flex items-center gap-2">
          {/* Share — ORANGE, most prominent (the growth action) */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-white text-center bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_12px_rgba(255,107,53,0.4)] motion-safe:animate-conjure-pulse hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {copied ? "✓ Copied" : sharing ? "…" : "Share it ✨"}
          </button>

          {/* More like this — GREEN, solid (the create-again action) */}
          {isOriginalImage && onMoreLikeThis && (
            <button
              onClick={handleMoreLikeThis}
              disabled={moreLikeThis}
              className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-white text-center bg-secondary hover:bg-secondary/85 shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              {moreLikeThis ? "Creating…" : "✨ More like this"}
            </button>
          )}

          {/* Download — neutral/subtle (ends the loop; don't glamorize) */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download"
            className="shrink-0 rounded-xl px-2.5 py-2 text-xs border border-white/10 text-faint hover:text-muted hover:border-white/20 disabled:opacity-60 transition-colors"
          >
            {downloading ? "…" : "↓"}
          </button>
        </div>

        {/* Quiet utility chips — paid upsells, must NOT compete with the loop actions */}
        {isOriginalImage && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleProcess("bg_removal")}
              disabled={!!processing}
              className="text-[11px] px-2.5 py-1 rounded-md border border-white/8 text-faint/80 hover:text-faint hover:border-white/15 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {processing === "bg_removal" ? "Removing BG…" : `✂ Remove BG · ⚡${bgRemovalCost}`}
            </button>
            <button
              onClick={() => handleProcess("clarity_upscaler")}
              disabled={!!processing}
              className="text-[11px] px-2.5 py-1 rounded-md border border-white/8 text-faint/80 hover:text-faint hover:border-white/15 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {processing === "clarity_upscaler" ? "Upscaling…" : `↑ Upscale · ⚡${upscaleCost}`}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
