"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES } from "@/lib/energy-config";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";
import { useSoundFx } from "@/components/primitives/SoundFx";
import { shareImageFile, canShareFiles, isTouchDevice } from "@/lib/studio/share";
import StudioLightbox from "./StudioLightbox";

interface Props {
  job: StudioJobRow;
  onMoreLikeThis?: (job: StudioJobRow) => Promise<void>;
  onProcess?: (job: StudioJobRow, operation: "bg_removal" | "clarity_upscaler") => Promise<void>;
  onShareSuccess?: (job: StudioJobRow) => void;
  onToggleFavorite?: (job: StudioJobRow, next: boolean) => Promise<boolean>;
  onSetOfficialLogo?: (job: StudioJobRow, next: boolean) => Promise<boolean>;
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

export default function JobCard({ job, onMoreLikeThis, onProcess, onShareSuccess, onToggleFavorite, onSetOfficialLogo }: Props) {
  const { playShare, playButtonPress } = useSoundFx();
  const reduce = useReducedMotion();
  const [downloading, setDownloading]   = useState(false);
  const [sharing, setSharing]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [copied, setCopied]             = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [processing, setProcessing]     = useState<"bg_removal" | "clarity_upscaler" | null>(null);
  const [moreLikeThis, setMoreLikeThis] = useState(false);
  const [fav, setFav]                   = useState<boolean>(job.favorite);
  const [favBusy, setFavBusy]           = useState(false);
  const [official, setOfficial]         = useState<boolean>(job.official_logo);
  const [officialBusy, setOfficialBusy] = useState(false);

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
      // Keep the real format — bg-removed images are transparent PNGs and must
      // NOT be renamed .jpg (that loses the transparency promise of the file).
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `goblin-studio-${job.image_type ?? "image"}-${job.id.slice(0, 8)}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* non-fatal */ } finally {
      setDownloading(false);
    }
  }

  // Best-effort extension for the share-sheet filename (actual blob type wins
  // in handleDownload). bg-removal outputs are PNG.
  const saveExt =
    job.job_type === "bg_removal" || /\.png(\?|$)/i.test(job.output_url ?? "") ? "png" : "jpg";
  const saveFilename = `goblin-studio-${job.image_type ?? "image"}-${job.id.slice(0, 8)}.${saveExt}`;

  async function handleShare() {
    if (!job.output_url || sharing) return;
    setSharing(true);
    // File-first share — puts the actual creation on the native sheet
    // (IG / TikTok / X / Save to Photos), URL → clipboard as the fallback.
    const result = await shareImageFile(job.output_url, { filename: saveFilename });
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

  // Phone-first "Save to Photos": on mobile, open the OS sheet (offers "Save
  // Image" → camera roll); on desktop, fall back to the blob download.
  //
  // Desktop Chrome reports canShare({files}) = true, but rejects the actual
  // share() call because the user-gesture window expires while we fetch the
  // image — so the old code silently did nothing. Fix: only take the share-
  // sheet path on touch devices, and if the sheet never really opened, still
  // hand the user their file via download.
  async function handleSave() {
    if (!job.output_url || saving) return;
    if (!canShareFiles() || !isTouchDevice()) {
      await handleDownload();
      return;
    }
    setSaving(true);
    try {
      const result = await shareImageFile(job.output_url, { filename: saveFilename });
      // "cancelled" = user closed the sheet on purpose — respect that.
      // "failed"/"copied" = no real file share happened — download instead.
      if (result === "failed" || result === "copied") await handleDownload();
    } finally {
      setSaving(false);
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

  async function handleSetOfficial() {
    if (!onSetOfficialLogo || officialBusy) return;
    const next = !official;
    setOfficial(next);     // optimistic
    setOfficialBusy(true);
    playButtonPress();
    try {
      const ok = await onSetOfficialLogo(job, next);
      if (!ok) setOfficial(!next); // revert on API failure
    } catch {
      setOfficial(!next);          // revert on network failure
    } finally {
      setOfficialBusy(false);
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
      {/* Image — click to open the full-screen viewer */}
      <div className="relative aspect-square bg-black/30">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${typeLabel} full screen`}
          className="absolute inset-0 z-0 cursor-zoom-in group"
        >
          <Image
            src={job.output_url}
            alt={`${typeLabel} by Goblin Studio`}
            fill
            className="object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 50vw"
            unoptimized
          />
        </button>
        {/* Derived variant tag */}
        {derivedTag && (
          <span className="absolute top-2 left-2 z-10 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
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
            className="absolute top-2 right-2 z-10 rounded-full bg-black/55 backdrop-blur-sm p-1.5 leading-none hover:bg-black/70 transition-colors disabled:opacity-70"
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

          {/* Save to Photos — phone-first (sheet → camera roll), desktop downloads.
              The #1 phone action; neutral styling so it doesn't fight Share. */}
          <button
            onClick={handleSave}
            disabled={saving || downloading}
            title="Save to Photos"
            className="shrink-0 rounded-xl px-2.5 py-2 text-xs font-semibold border border-white/12 text-muted hover:text-white hover:border-white/25 disabled:opacity-60 transition-colors"
          >
            {saving || downloading ? "…" : "⤓ Save"}
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

        {/* Official logo — GOLD (Studio's premium signature). Once set, generated
            product art + social graphics reuse this exact logo automatically. */}
        {job.image_type === "logo_concept" && isOriginalImage && onSetOfficialLogo && (
          <button
            onClick={handleSetOfficial}
            disabled={officialBusy}
            title={official ? "Click to remove as your official logo" : "Use this logo on all generated product art"}
            className={
              official
                ? "group/official w-full rounded-xl px-3 py-2 text-xs font-bold text-center border border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#E9C75A] hover:border-red-400/50 hover:text-red-300 disabled:opacity-70 transition-colors"
                : "w-full rounded-xl px-3 py-2 text-xs font-semibold text-center border border-white/12 text-muted hover:text-white hover:border-[#D4AF37]/50 disabled:opacity-60 transition-colors"
            }
          >
            {officialBusy ? (
              "…"
            ) : official ? (
              <>
                <span className="group-hover/official:hidden">✓ Official logo</span>
                <span className="hidden group-hover/official:inline">✕ Remove official logo</span>
              </>
            ) : (
              "⭐ Make this my official logo"
            )}
          </button>
        )}
      </div>

      {/* Full-screen viewer — reuses this card's own handlers + state. */}
      <AnimatePresence>
        {lightboxOpen && (
          <StudioLightbox
            job={job}
            typeLabel={typeLabel}
            onClose={() => setLightboxOpen(false)}
            onShare={handleShare}
            onSave={handleSave}
            onDownload={handleDownload}
            onMoreLikeThis={onMoreLikeThis ? handleMoreLikeThis : undefined}
            onToggleFavorite={onToggleFavorite ? handleToggleFavorite : undefined}
            isFavorite={fav}
            sharing={sharing}
            copied={copied}
            saving={saving}
            downloading={downloading}
            moreLikeThis={moreLikeThis}
            favBusy={favBusy}
            canMoreLikeThis={isOriginalImage}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
