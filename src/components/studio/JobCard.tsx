"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES } from "@/lib/energy-config";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";

interface Props {
  job: StudioJobRow;
  onMoreLikeThis?: (job: StudioJobRow) => Promise<void>;
  onProcess?: (job: StudioJobRow, operation: "bg_removal" | "clarity_upscaler") => Promise<void>;
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

export default function JobCard({ job, onMoreLikeThis, onProcess }: Props) {
  const [downloading, setDownloading]   = useState(false);
  const [sharing, setSharing]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [processing, setProcessing]     = useState<"bg_removal" | "clarity_upscaler" | null>(null);
  const [moreLikeThis, setMoreLikeThis] = useState(false);

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
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = (typeof navigator !== "undefined" ? navigator : null) as any;
      if (nav?.share) {
        await nav.share({ title: "My creation — BrandGoblin Studio", text: "Made with Goblin Studio 🎨", url: job.output_url });
      } else if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(job.output_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled or clipboard failed */ } finally {
      setSharing(false);
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
      </div>

      {/* Meta + actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{typeLabel}</p>
            <p className="text-xs text-faint">{modelLabel} · ⚡ {job.energy_reserved} used</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Share */}
            <button
              onClick={handleShare}
              disabled={sharing}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-faint hover:border-primary/40 hover:text-muted disabled:opacity-60 transition-colors"
              title="Share"
            >
              {copied ? "✓ Copied" : sharing ? "…" : "↗ Share"}
            </button>
            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-faint hover:border-primary/40 hover:text-muted disabled:opacity-60 transition-colors"
            >
              {downloading ? "…" : "↓"}
            </button>
          </div>
        </div>

        {/* Process actions + More like this */}
        <div className="flex gap-2 flex-wrap">
          {isOriginalImage && (
            <>
              <button
                onClick={() => handleProcess("bg_removal")}
                disabled={!!processing}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-faint hover:border-primary/40 hover:text-muted disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                {processing === "bg_removal" ? "Removing BG…" : `✂ Remove BG · ⚡${bgRemovalCost}`}
              </button>
              <button
                onClick={() => handleProcess("clarity_upscaler")}
                disabled={!!processing}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-faint hover:border-primary/40 hover:text-muted disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                {processing === "clarity_upscaler" ? "Upscaling…" : `↑ Upscale · ⚡${upscaleCost}`}
              </button>
            </>
          )}
          {isOriginalImage && onMoreLikeThis && (
            <button
              onClick={handleMoreLikeThis}
              disabled={moreLikeThis}
              className="text-xs px-3 py-1.5 rounded-lg border border-secondary/30 text-secondary/80 hover:border-secondary/60 hover:text-secondary disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {moreLikeThis ? "Creating…" : "✨ More like this"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
