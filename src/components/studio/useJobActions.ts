"use client";

/**
 * useJobActions (Creator Studio Phase C, Sept 2026).
 * Every action a finished creation supports, in one hook, so the gallery card
 * (JobCard), the full-screen viewer, and the canvas toolbar behave identically.
 * Extracted from JobCard: download keeps the real file format, save
 * is phone-first (share sheet) with a desktop download fallback, share
 * celebrates only on a genuine success, and every toggle is optimistic with a
 * revert on failure.
 *
 * State is keyed to the job passed at mount: render the consumer with
 * `key={job.id}` when the job can change under it (the canvas does).
 */

import { useEffect, useState } from "react";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES } from "@/lib/energy-config";
import type { ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";
import { useSoundFx } from "@/components/primitives/SoundFx";
import { shareImageFile, canShareFiles, isTouchDevice } from "@/lib/studio/share";

export const IMAGE_TYPE_LABELS: Record<string, string> = {
  logo_concept:      "Logo Concept",
  mascot:            "Mascot",
  social_graphic:    "Social Graphic",
  product_art:       "Product Art",
  youtube_thumbnail: "YouTube Thumbnail",
  short_cover:       "Short-form Cover",
};

export const MODEL_LABELS: Record<string, string> = {
  flux_schnell:     "Quick",
  flux_pro_v1:      "Classic",
  flux_2_flex:      "Studio",
  recraft_v3:       "Design Pro",
  ideogram_v3:      "Poster Pro",
  gpt_image_2:      "Print Pro",
  seedream_v45:     "Artistic",
  bg_removal:       "BG Removed",
  clarity_upscaler: "Upscaled",
  upload:           "Your file",
};

// Tags for derived (post-processed / uploaded) jobs
export const DERIVED_TAGS: Record<string, string> = {
  bg_removal:       "Background removed",
  clarity_upscaler: "Upscaled",
  upload:           "⤴ Uploaded",
};

export interface JobActionCallbacks {
  onMoreLikeThis?: (job: StudioJobRow) => Promise<void>;
  onProcess?: (job: StudioJobRow, operation: "bg_removal" | "clarity_upscaler") => Promise<void>;
  onShareSuccess?: (job: StudioJobRow) => void;
  onToggleFavorite?: (job: StudioJobRow, next: boolean) => Promise<boolean>;
  onToggleArchive?: (job: StudioJobRow, next: boolean) => Promise<boolean>;
  onSetOfficialLogo?: (job: StudioJobRow, next: boolean) => Promise<boolean>;
}

export function useJobActions(job: StudioJobRow, cb: JobActionCallbacks) {
  const { playShare, playButtonPress } = useSoundFx();
  const [downloading, setDownloading]   = useState(false);
  const [sharing, setSharing]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [copied, setCopied]             = useState(false);
  const [processing, setProcessing]     = useState<"bg_removal" | "clarity_upscaler" | null>(null);
  const [moreLikeThis, setMoreLikeThis] = useState(false);
  const [fav, setFav]                   = useState<boolean>(job.favorite);
  const [favBusy, setFavBusy]           = useState(false);
  const [official, setOfficial]         = useState<boolean>(job.official_logo);
  const [officialBusy, setOfficialBusy] = useState(false);
  const [archiveBusy, setArchiveBusy]   = useState(false);

  // The same job can be on the canvas AND in the gallery. The parent's jobs
  // state is the truth; follow it so both views agree after a toggle.
  useEffect(() => { setFav(job.favorite); }, [job.favorite]);
  useEffect(() => { setOfficial(job.official_logo); }, [job.official_logo]);

  const pinnedSize = job.image_type
    ? IMAGE_TYPE_SIZES[job.image_type as ImageType] ?? IMAGE_TYPE_SIZES.logo_concept
    : IMAGE_TYPE_SIZES.logo_concept;

  const bgRemovalCost = computeStudioEnergyCost("bg_removal", { width: pinnedSize.width, height: pinnedSize.height });
  const upscaleCost   = computeStudioEnergyCost("clarity_upscaler", { width: pinnedSize.width, height: pinnedSize.height });

  const isOriginalImage = job.job_type === "image";
  const isUpload        = job.job_type === "upload";
  const derivedTag = DERIVED_TAGS[job.job_type] ?? null;
  // Uploaded logos + bg-removed logo variants can be the brand's official logo
  // (backend allows any completed logo_concept; these UI gates just match it).
  const canBeOfficial =
    job.image_type === "logo_concept" &&
    (isOriginalImage || isUpload || job.job_type === "bg_removal");

  const typeLabel  = IMAGE_TYPE_LABELS[job.image_type ?? ""] ?? job.image_type ?? "Image";
  const modelLabel = MODEL_LABELS[job.model_key] ?? job.model_key;

  // Best-effort extension for the share-sheet filename (actual blob type wins
  // in handleDownload). bg-removal outputs are PNG.
  const saveExt =
    job.job_type === "bg_removal" || /\.png(\?|$)/i.test(job.output_url ?? "") ? "png" : "jpg";
  const saveFilename = `goblin-studio-${job.image_type ?? "image"}-${job.id.slice(0, 8)}.${saveExt}`;

  async function handleDownload() {
    if (!job.output_url || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(job.output_url);
      const blob = await res.blob();
      // Keep the real format: bg-removed images are transparent PNGs and must
      // NOT be renamed .jpg (that loses the transparency promise of the file).
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `goblin-studio-${job.image_type ?? "image"}-${job.id.slice(0, 8)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoking synchronously cancels the download in Safari/Firefox.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } catch { /* non-fatal */ } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    if (!job.output_url || sharing) return;
    setSharing(true);
    // File-first share: puts the actual creation on the native sheet
    // (IG / TikTok / X / Save to Photos), URL to clipboard as the fallback.
    const result = await shareImageFile(job.output_url, { filename: saveFilename });
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setSharing(false);
    // Celebrate ONLY a genuine success (shared or copied), never on cancel.
    if (result === "shared" || result === "copied") {
      playShare();
      cb.onShareSuccess?.(job);
    }
  }

  // Phone-first "Save to Photos": on mobile, open the OS sheet (offers "Save
  // Image" to the camera roll); on desktop, fall back to the blob download.
  async function handleSave() {
    if (!job.output_url || saving) return;
    if (!canShareFiles() || !isTouchDevice()) {
      await handleDownload();
      return;
    }
    setSaving(true);
    try {
      const result = await shareImageFile(job.output_url, { filename: saveFilename });
      // "cancelled" = user closed the sheet on purpose; respect that.
      // "failed"/"copied" = no real file share happened; download instead.
      if (result === "failed" || result === "copied") await handleDownload();
    } finally {
      setSaving(false);
    }
  }

  async function handleProcess(operation: "bg_removal" | "clarity_upscaler") {
    if (!cb.onProcess || processing) return;
    setProcessing(operation);
    try {
      await cb.onProcess(job, operation);
    } finally {
      setProcessing(null);
    }
  }

  async function handleMoreLikeThis() {
    if (!cb.onMoreLikeThis || moreLikeThis) return;
    setMoreLikeThis(true);
    try {
      await cb.onMoreLikeThis(job);
    } finally {
      setMoreLikeThis(false);
    }
  }

  async function handleSetOfficial() {
    if (!cb.onSetOfficialLogo || officialBusy) return;
    const next = !official;
    setOfficial(next);     // optimistic
    setOfficialBusy(true);
    playButtonPress();
    try {
      const ok = await cb.onSetOfficialLogo(job, next);
      if (!ok) setOfficial(!next); // revert on API failure
    } catch {
      setOfficial(!next);          // revert on network failure
    } finally {
      setOfficialBusy(false);
    }
  }

  // Hide (archive) / restore: the parent flips job.archived optimistically.
  async function handleToggleArchive() {
    if (!cb.onToggleArchive || archiveBusy) return;
    setArchiveBusy(true);
    playButtonPress();
    try {
      await cb.onToggleArchive(job, !job.archived);
    } finally {
      setArchiveBusy(false);
    }
  }

  async function handleToggleFavorite() {
    if (!cb.onToggleFavorite || favBusy) return;
    const next = !fav;
    setFav(next);          // optimistic
    setFavBusy(true);
    playButtonPress();
    try {
      const ok = await cb.onToggleFavorite(job, next);
      if (!ok) setFav(!next); // revert on API failure
    } catch {
      setFav(!next);          // revert on network failure
    } finally {
      setFavBusy(false);
    }
  }

  return {
    // state
    downloading, sharing, saving, copied, processing, moreLikeThis,
    fav, favBusy, official, officialBusy, archiveBusy,
    // derived
    typeLabel, modelLabel, derivedTag, isOriginalImage, isUpload, canBeOfficial,
    bgRemovalCost, upscaleCost, saveFilename,
    // actions
    handleDownload, handleShare, handleSave, handleProcess, handleMoreLikeThis,
    handleSetOfficial, handleToggleArchive, handleToggleFavorite,
  };
}
