"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { StudioJobRow } from "@/lib/studio/jobs";
import StudioLightbox, { CHECKERBOARD_STYLE } from "./StudioLightbox";
import { useJobActions, type JobActionCallbacks } from "./useJobActions";

interface Props extends JobActionCallbacks {
  job: StudioJobRow;
  /** Phase C: put this creation on the Studio canvas. */
  onOpenOnCanvas?: (job: StudioJobRow) => void;
  /** True when this creation is the one on the canvas right now. */
  onCanvas?: boolean;
}

export default function JobCard({ job, onOpenOnCanvas, onCanvas = false, ...callbacks }: Props) {
  const { onMoreLikeThis, onProcess, onToggleFavorite, onToggleArchive, onSetOfficialLogo } = callbacks;
  const reduce = useReducedMotion();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const a = useJobActions(job, callbacks);
  const {
    downloading, sharing, saving, copied, processing, moreLikeThis,
    fav, favBusy, official, officialBusy, archiveBusy,
    typeLabel, modelLabel, derivedTag, isOriginalImage, isUpload, canBeOfficial,
    bgRemovalCost, upscaleCost,
    handleDownload, handleShare, handleSave, handleProcess, handleMoreLikeThis,
    handleSetOfficial, handleToggleArchive, handleToggleFavorite,
  } = a;

  if (!job.output_url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border bg-card overflow-hidden transition-colors ${onCanvas ? "border-gold/60" : "border-primary/20"}`}
    >
      {/* Image — click to open the full-screen viewer. Transparent (bg-removed)
          images sit on a light checkerboard so dark logos stay visible. */}
      <div
        className="relative aspect-square bg-black/30"
        style={job.job_type === "bg_removal" || isUpload ? CHECKERBOARD_STYLE : undefined}
      >
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
        {/* Hide / restore — gray, quiet, next to the star. Soft-archive only. */}
        {onToggleArchive && (
          <button
            onClick={handleToggleArchive}
            disabled={archiveBusy}
            title={job.archived ? "Restore this creation" : "Hide this creation (find it under Hidden)"}
            className="absolute top-2 right-11 z-10 rounded-full bg-black/55 backdrop-blur-sm p-1.5 leading-none text-white/50 hover:text-white hover:bg-black/70 transition-colors disabled:opacity-60"
          >
            <span className="block text-base">{job.archived ? "↩" : "✕"}</span>
          </button>
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
              {fav ? "★" : "☆"}
            </motion.span>
          </button>
        )}
      </div>

      {/* Meta + actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{typeLabel}</p>
            <p className="text-xs text-faint">
              {isUpload ? "Your file · no energy used" : <>{modelLabel} · ⚡ {job.energy_reserved} used</>}
            </p>
          </div>
          {onOpenOnCanvas && (
            <button
              type="button"
              onClick={() => onOpenOnCanvas(job)}
              disabled={onCanvas}
              className={`shrink-0 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
                onCanvas
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-white/12 text-muted hover:border-gold/50 hover:text-white"
              }`}
            >
              {onCanvas ? "On canvas" : "Open on canvas"}
            </button>
          )}
        </div>

        {/* Primary loop actions — only Share (orange) + More like this (green) get bold color */}
        <div className="flex items-center gap-2">
          {/* Share — ORANGE, most prominent (the growth action) */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-white text-center bg-primary hover:bg-[#3A9A70] hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {copied ? "✓ Copied" : sharing ? "…" : "Share it"}
          </button>

          {/* More like this — GREEN, solid (the create-again action).
              Also shown on bg-removed variants (prompt is inherited). */}
          {(isOriginalImage || job.job_type === "bg_removal") && onMoreLikeThis && (
            <button
              onClick={handleMoreLikeThis}
              disabled={moreLikeThis}
              className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-white text-center bg-secondary hover:bg-secondary/85 shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              {moreLikeThis ? "Creating…" : "More like this"}
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

        {/* Quiet utility chips — paid upsells, must NOT compete with the loop actions.
            Uploads get them too (Remove BG on an uploaded logo is a common need). */}
        {(isOriginalImage || isUpload) && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleProcess("bg_removal")}
              disabled={!!processing}
              className="text-[11px] px-2.5 py-1 rounded-md border border-white/8 text-faint hover:text-paper hover:border-white/15 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {processing === "bg_removal" ? "Removing BG…" : `Remove BG · ⚡${bgRemovalCost}`}
            </button>
            <button
              onClick={() => handleProcess("clarity_upscaler")}
              disabled={!!processing}
              className="text-[11px] px-2.5 py-1 rounded-md border border-white/8 text-faint hover:text-paper hover:border-white/15 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {processing === "clarity_upscaler" ? "Upscaling…" : `↑ Upscale · ⚡${upscaleCost}`}
            </button>
          </div>
        )}

        {/* Official logo — GOLD (Studio's premium signature). Once set, generated
            product art + social graphics reuse this exact logo automatically.
            Bg-removed logo variants qualify too (transparent = cleanest stamp). */}
        {canBeOfficial && onSetOfficialLogo && (
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
              "Make this my official logo"
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
