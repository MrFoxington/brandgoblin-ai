"use client";

/**
 * RecentStrip (Creator Studio Phase C, Sept 2026).
 * Recent creations for the selected brand. A vertical strip beside the canvas
 * on desktop, a swipe row under it on phones. Tap one to put it on the canvas.
 */

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { StudioJobRow } from "@/lib/studio/jobs";
import { CHECKERBOARD_STYLE } from "./StudioLightbox";
import { IMAGE_TYPE_LABELS } from "./useJobActions";

interface Props {
  jobs: StudioJobRow[];
  currentId: string | null;
  onPick: (job: StudioJobRow) => void;
  onSeeAll: () => void;
  totalCount: number;
}

export default function RecentStrip({ jobs, currentId, onPick, onSeeAll, totalCount }: Props) {
  const reduce = useReducedMotion();
  if (jobs.length === 0) return null;

  return (
    <div className="lg:sticky lg:top-24">
      <p className="mb-2 hidden text-[10px] font-bold uppercase tracking-widest text-faint lg:block">Recent</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-h-[calc(100vh-9rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pr-1">
        {jobs.map((job, i) => {
          const isCurrent = job.id === currentId;
          const label = IMAGE_TYPE_LABELS[job.image_type ?? ""] ?? "Creation";
          return (
            <motion.button
              key={job.id}
              type="button"
              onClick={() => onPick(job)}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.22 }}
              aria-label={`${label}${isCurrent ? " (on canvas)" : ""}`}
              aria-pressed={isCurrent}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-black/30 transition-colors lg:h-auto lg:w-full lg:aspect-square ${
                isCurrent ? "border-gold" : "border-transparent hover:border-[rgba(250,247,242,0.35)]"
              }`}
              style={job.job_type === "bg_removal" || job.job_type === "upload" ? CHECKERBOARD_STYLE : undefined}
            >
              {job.output_url && (
                <Image src={job.output_url} alt="" fill unoptimized sizes="96px" className="object-cover" />
              )}
              {job.favorite && (
                <span className="absolute right-1 top-1 text-[10px] text-gold drop-shadow" aria-hidden>★</span>
              )}
            </motion.button>
          );
        })}
        {totalCount > jobs.length && (
          <button
            type="button"
            onClick={onSeeAll}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-[rgba(250,247,242,0.2)] px-1 text-center text-[10px] font-semibold leading-tight text-muted hover:border-primary/50 hover:text-white lg:h-auto lg:w-full lg:aspect-square"
          >
            +{totalCount - jobs.length} more
          </button>
        )}
      </div>
    </div>
  );
}
