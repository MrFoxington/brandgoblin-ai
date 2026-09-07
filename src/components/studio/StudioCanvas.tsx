"use client";

/**
 * StudioCanvas (Creator Studio Phase C, Sept 2026).
 * The center of the Studio: the working creation, always the biggest thing on
 * screen. Generating = Nix cooking ON the canvas over the previous image; the
 * result lands in place (the celebration overlay still fires from the parent).
 * The floating toolbar under the picture carries every action a creation has,
 * through the same hook the gallery cards use, so behavior is identical.
 *
 * Swaps are a keyed remount with a fade-in and NO exit animation on purpose:
 * a job usually finishes while the user is in another tab, and an exit that
 * waits for a frame would leave the old picture up until they come back.
 */

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IMAGE_TYPE_SIZES, type ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";
import NixCooking from "./NixCooking";
import StudioLightbox, { CHECKERBOARD_STYLE } from "./StudioLightbox";
import { useJobActions, type JobActionCallbacks } from "./useJobActions";
import { shareCard, prepareShareCard, type ShareCardBrand, type ShareCardResult } from "@/lib/studio/share-card";
import { useSoundFx } from "@/components/primitives/SoundFx";

interface Props {
  job: StudioJobRow | null;
  activeCount: number;
  brandName: string;
  /** Brand meta for the share card (the job's own brand). */
  cardBrand: ShareCardBrand;
  cardFilename: string;
  callbacks: JobActionCallbacks;
  /** Phone only: open the tool sheet from the empty state. */
  onOpenTools: () => void;
  /** Coach: the user saved a creation (Phase D). */
  onSaved?: () => void;
  /** Coach tip pinned above the toolbar (Phase D). */
  coachTip?: ReactNode;
  /** Name of the brand whose history is still being fetched (empty state copy). */
  loadingBrand?: string | null;
}

export default function StudioCanvas({ job, activeCount, brandName, cardBrand, cardFilename, callbacks, onOpenTools, onSaved, coachTip, loadingBrand = null }: Props) {
  const cooking = activeCount > 0;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[rgba(250,247,242,0.08)] bg-surface">
      {job ? (
        <CanvasJob
          key={job.id}
          job={job}
          brandName={brandName}
          cardBrand={cardBrand}
          cardFilename={cardFilename}
          callbacks={callbacks}
          dimmed={cooking}
          onSaved={onSaved}
          coachTip={coachTip}
        />
      ) : (
        <EmptyCanvas cooking={cooking} onOpenTools={onOpenTools} loadingBrand={loadingBrand} />
      )}

      {/* Nix cooking ON the canvas. Leaves instantly when the result lands so
          nothing invisible ever sits over the toolbar. */}
      {cooking && (
        <motion.div
          key="cooking"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-6 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm">
            <NixCooking count={activeCount} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EmptyCanvas({ cooking, onOpenTools, loadingBrand }: { cooking: boolean; onOpenTools: () => void; loadingBrand: string | null }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center lg:min-h-[560px]">
      <Image
        src="/nix/conjuring-nix.png"
        alt="Nix ready to create"
        width={120}
        height={120}
        className={`object-contain ${cooking ? "opacity-0" : loadingBrand ? "opacity-50 motion-safe:animate-pulse" : "opacity-80"}`}
        priority
      />
      {loadingBrand ? (
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Fetching {loadingBrand}&apos;s creations</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">One moment. Everything you have made for this brand is on its way.</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Your canvas is waiting</h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
              Pick a brand and what to make in the tools, then hit Conjure. Your creation lands right here.
            </p>
          </div>
          <button type="button" onClick={onOpenTools} className="btn-green !py-2.5 !px-5 text-sm lg:hidden">
            Open the tools
          </button>
        </>
      )}
    </div>
  );
}

function CanvasJob({
  job,
  brandName,
  cardBrand,
  cardFilename,
  callbacks,
  dimmed,
  onSaved,
  coachTip,
}: {
  job: StudioJobRow;
  brandName: string;
  cardBrand: ShareCardBrand;
  cardFilename: string;
  callbacks: JobActionCallbacks;
  dimmed: boolean;
  onSaved?: () => void;
  coachTip?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { playShare } = useSoundFx();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cardState, setCardState] = useState<"idle" | "busy" | ShareCardResult>("idle");
  const a = useJobActions(job, callbacks);

  // Prebuild the share card once the creation is on the canvas, so the tap
  // itself is instant (Safari drops the share sheet if the tap goes stale).
  useEffect(() => {
    if (!job.output_url) return;
    const t = setTimeout(() => { prepareShareCard(job.id, job.output_url as string, cardBrand).catch(() => undefined); }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id, job.output_url]);

  // One-tap share card: the creation on its brand's frame, straight to the
  // share sheet (desktop downloads it). Celebrates only on a real share.
  async function handleShareCard() {
    if (!job.output_url || cardState === "busy") return;
    setCardState("busy");
    const result = await shareCard(job.output_url, cardBrand, cardFilename, job.id);
    setCardState(result);
    if (result === "shared") {
      playShare();
      callbacks.onShareSuccess?.(job);
    }
    setTimeout(() => setCardState("idle"), 2200);
  }

  function handleSaveTracked() {
    onSaved?.();
    return a.handleSave();
  }
  const { onMoreLikeThis, onProcess, onToggleFavorite, onToggleArchive, onSetOfficialLogo } = callbacks;

  const size = IMAGE_TYPE_SIZES[(job.image_type ?? "logo_concept") as ImageType] ?? IMAGE_TYPE_SIZES.logo_concept;
  const w = job.image_type === "youtube_thumbnail" ? 1280 : job.image_type === "short_cover" ? 1080 : size.width;
  const h = job.image_type === "youtube_thumbnail" ? 720 : job.image_type === "short_cover" ? 1920 : size.height;
  const transparent = job.job_type === "bg_removal" || job.job_type === "upload";

  return (
    <>
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.99 }}
      animate={{ opacity: dimmed ? 0.4 : 1, scale: 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      {/* The picture */}
      <div className="flex items-center justify-center bg-black/30 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View ${a.typeLabel} full screen`}
          className="relative w-full cursor-zoom-in overflow-hidden rounded-2xl"
          style={{
            aspectRatio: `${w} / ${h}`,
            maxHeight: "min(64vh, 720px)",
            ...(transparent ? CHECKERBOARD_STYLE : {}),
          }}
        >
          {job.output_url && (
            <Image
              src={job.output_url}
              alt={`${a.typeLabel} by Goblin Studio`}
              fill
              unoptimized
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-contain"
            />
          )}
        </button>
      </div>

      {/* Meta + floating toolbar */}
      <div className="border-t border-[rgba(250,247,242,0.08)] px-4 py-3 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
          <span className="font-semibold text-white">{a.typeLabel}</span>
          <span>{brandName}</span>
          <span>{a.isUpload ? "Your file · no energy used" : `${a.modelLabel} · ⚡ ${job.energy_reserved} used`}</span>
          {a.derivedTag && <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-bold text-white">{a.derivedTag}</span>}
          {a.official && <span className="rounded-md border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">Official logo</span>}
        </div>

        {coachTip && <div className="mb-3">{coachTip}</div>}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={a.handleShare}
            disabled={a.sharing}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#3A9A70] disabled:opacity-60"
          >
            {a.copied ? "✓ Copied" : a.sharing ? "…" : "Share it"}
          </button>
          <button
            type="button"
            onClick={handleShareCard}
            disabled={cardState === "busy"}
            title="The creation on a branded card, ready for Instagram, TikTok or Messages"
            className="rounded-xl border border-primary/50 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary-light transition-colors hover:bg-primary/20 hover:text-white disabled:opacity-60"
          >
            {cardState === "busy"
              ? "Building card…"
              : cardState === "shared"
              ? "Shared ✓"
              : cardState === "downloaded"
              ? "Card saved ✓"
              : cardState === "failed"
              ? "Try again"
              : "Share card"}
          </button>
          {(a.isOriginalImage || job.job_type === "bg_removal") && onMoreLikeThis && (
            <button
              type="button"
              onClick={a.handleMoreLikeThis}
              disabled={a.moreLikeThis}
              className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-secondary/85 disabled:cursor-wait disabled:opacity-60"
            >
              {a.moreLikeThis ? "Creating…" : "Variation"}
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveTracked}
            disabled={a.saving || a.downloading}
            title="Save to Photos"
            className="rounded-xl border border-white/12 px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-white/25 hover:text-white disabled:opacity-60"
          >
            {a.saving || a.downloading ? "…" : "⤓ Save"}
          </button>
          {(a.isOriginalImage || a.isUpload) && onProcess && (
            <>
              <button
                type="button"
                onClick={() => a.handleProcess("bg_removal")}
                disabled={!!a.processing}
                className="rounded-xl border border-white/8 px-3 py-2 text-xs text-faint transition-colors hover:border-white/20 hover:text-paper disabled:cursor-wait disabled:opacity-50"
              >
                {a.processing === "bg_removal" ? "Removing BG…" : `Remove BG · ⚡${a.bgRemovalCost}`}
              </button>
              <button
                type="button"
                onClick={() => a.handleProcess("clarity_upscaler")}
                disabled={!!a.processing}
                className="rounded-xl border border-white/8 px-3 py-2 text-xs text-faint transition-colors hover:border-white/20 hover:text-paper disabled:cursor-wait disabled:opacity-50"
              >
                {a.processing === "clarity_upscaler" ? "Upscaling…" : `↑ Upscale · ⚡${a.upscaleCost}`}
              </button>
            </>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={a.handleToggleFavorite}
              disabled={a.favBusy}
              aria-pressed={a.fav}
              title={a.fav ? "Remove from Favorites" : "Add to Favorites"}
              className="rounded-xl border border-white/12 px-3 py-2 text-sm leading-none transition-colors hover:border-white/25 disabled:opacity-70"
            >
              <span className={a.fav ? "text-gold drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" : "text-muted"}>{a.fav ? "★" : "☆"}</span>
            </button>
          )}
          {a.canBeOfficial && onSetOfficialLogo && (
            <button
              type="button"
              onClick={a.handleSetOfficial}
              disabled={a.officialBusy}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                a.official
                  ? "border-gold/60 bg-gold/10 text-gold hover:border-red-400/50 hover:text-red-300"
                  : "border-white/12 text-muted hover:border-gold/50 hover:text-white"
              }`}
            >
              {a.officialBusy ? "…" : a.official ? "✓ Official logo" : "Make official logo"}
            </button>
          )}
          {onToggleArchive && (
            <button
              type="button"
              onClick={a.handleToggleArchive}
              disabled={a.archiveBusy}
              title={job.archived ? "Restore this creation" : "Hide this creation (find it under Hidden)"}
              className="ml-auto rounded-xl border border-white/8 px-3 py-2 text-xs text-faint transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
            >
              {job.archived ? "↩ Restore" : "✕ Hide"}
            </button>
          )}
        </div>
      </div>

    </motion.div>

      {/* Outside the dimmed box: opacity would trap the viewer's z-index */}
      <AnimatePresence>
        {lightboxOpen && (
          <StudioLightbox
            job={job}
            typeLabel={a.typeLabel}
            onClose={() => setLightboxOpen(false)}
            onShare={a.handleShare}
            onSave={handleSaveTracked}
            onDownload={() => { onSaved?.(); return a.handleDownload(); }}
            onMoreLikeThis={onMoreLikeThis ? a.handleMoreLikeThis : undefined}
            onToggleFavorite={onToggleFavorite ? a.handleToggleFavorite : undefined}
            isFavorite={a.fav}
            sharing={a.sharing}
            copied={a.copied}
            saving={a.saving}
            downloading={a.downloading}
            moreLikeThis={a.moreLikeThis}
            favBusy={a.favBusy}
            canMoreLikeThis={a.isOriginalImage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
