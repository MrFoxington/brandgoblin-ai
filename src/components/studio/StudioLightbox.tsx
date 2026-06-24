"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { StudioJobRow } from "@/lib/studio/jobs";

// Full-screen viewer for a single creation. Keeps every action IN the viewer so
// the user never has to exit to share/save/iterate. Closes via X, Esc, backdrop.
// All behavior is delegated to the handlers JobCard already owns → identical
// inside and outside the lightbox (single source of truth).

interface Props {
  job: StudioJobRow;
  typeLabel: string;
  onClose: () => void;
  // Actions — reuse JobCard's handlers so behavior is identical.
  onShare: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
  onMoreLikeThis?: () => void | Promise<void>;
  onToggleFavorite?: () => void | Promise<void>;
  // Display state (mirrors JobCard's button states).
  isFavorite: boolean;
  sharing: boolean;
  copied: boolean;
  saving: boolean;
  downloading: boolean;
  moreLikeThis: boolean;
  favBusy: boolean;
  canMoreLikeThis: boolean;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

function isVideoJob(job: StudioJobRow): boolean {
  if (job.job_type === "video") return true;
  return /\.(mp4|webm|mov)(\?|$)/i.test(job.output_url ?? "");
}

export default function StudioLightbox({
  job,
  typeLabel,
  onClose,
  onShare,
  onSave,
  onDownload,
  onMoreLikeThis,
  onToggleFavorite,
  isFavorite,
  sharing,
  copied,
  saving,
  downloading,
  moreLikeThis,
  favBusy,
  canMoreLikeThis,
}: Props) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isVideo = isVideoJob(job);

  // Esc to close + Tab focus trap. Restore focus + scroll on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the close button once mounted.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  if (!job.output_url) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${typeLabel} — full screen`}
      ref={dialogRef}
      onMouseDown={(e) => {
        // Backdrop click (only when the press starts on the backdrop itself).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={reduce ? false : { scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="relative flex w-full max-w-4xl max-h-full flex-col gap-4"
      >
        {/* Close */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 sm:right-0 z-10 -translate-y-full rounded-full bg-black/60 p-2 text-lg leading-none text-white hover:bg-black/80 transition-colors"
        >
          ✕
        </button>

        {/* Media */}
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
          {isVideo ? (
            <video
              src={job.output_url}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[70vh] w-auto max-w-full rounded-xl bg-black"
            />
          ) : (
            <div className="relative h-[70vh] w-full">
              <Image
                src={job.output_url}
                alt={`${typeLabel} by Goblin Studio`}
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Actions — kept in the viewer so the user never has to exit. */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onShare()}
            disabled={sharing}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_12px_rgba(255,107,53,0.4)] hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {copied ? "✓ Copied" : sharing ? "…" : "Share it ✨"}
          </button>

          {canMoreLikeThis && onMoreLikeThis && (
            <button
              onClick={() => onMoreLikeThis()}
              disabled={moreLikeThis}
              className="rounded-xl px-4 py-2 text-sm font-bold text-white bg-secondary hover:bg-secondary/85 shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              {moreLikeThis ? "Creating…" : "✨ More like this"}
            </button>
          )}

          <button
            onClick={() => onSave()}
            disabled={saving || downloading}
            title="Save to Photos"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-60 transition-colors"
          >
            {saving || downloading ? "…" : "⤓ Save"}
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite()}
              disabled={favBusy}
              aria-pressed={isFavorite}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              className="rounded-xl px-3 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-70 transition-colors"
            >
              <span className={isFavorite ? "drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" : ""}>
                {isFavorite ? "⭐" : "☆"}
              </span>
            </button>
          )}

          <button
            onClick={() => onDownload()}
            disabled={downloading}
            title="Download"
            className="rounded-xl px-3 py-2 text-sm border border-white/10 text-faint hover:text-muted hover:border-white/20 disabled:opacity-60 transition-colors"
          >
            {downloading ? "…" : "↓"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
