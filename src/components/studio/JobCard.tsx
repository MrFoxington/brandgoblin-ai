"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES } from "@/lib/energy-config";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import type { StudioJobRow } from "@/lib/studio/jobs";

interface Props {
  job: StudioJobRow;
}

const IMAGE_TYPE_LABELS: Record<string, string> = {
  logo_concept:   "Logo Concept",
  social_graphic: "Social Graphic",
  product_art:    "Product Art",
};

const MODEL_LABELS: Record<string, string> = {
  flux_schnell: "Standard",
  flux_pro_v1:  "Premium",
  seedream_v45: "Artistic",
};

export default function JobCard({ job }: Props) {
  const [downloading, setDownloading] = useState(false);

  // Derive action-row energy costs from the registry — never hardcoded
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
    } catch {
      // Non-fatal
    } finally {
      setDownloading(false);
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
          unoptimized // signed URLs bypass Next.js image optimization
        />
      </div>

      {/* Meta + actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{typeLabel}</p>
            <p className="text-xs text-faint">{modelLabel} · ⚡ {job.energy_reserved} used</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-ghost text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-primary/40 disabled:opacity-60"
          >
            {downloading ? "…" : "↓ Download"}
          </button>
        </div>

        {/* Post-process actions — each shows energy cost from registry */}
        <div className="flex gap-2 flex-wrap">
          <ActionButton
            label={`✂ Remove BG · ⚡${bgRemovalCost}`}
            title="Background removal coming soon"
            disabled
          />
          <ActionButton
            label={`↑ Upscale · ⚡${upscaleCost}`}
            title="Upscaling coming soon"
            disabled
          />
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({
  label,
  title,
  disabled,
  onClick,
}: {
  label: string;
  title?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-faint hover:border-primary/40 hover:text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {label}
    </button>
  );
}
