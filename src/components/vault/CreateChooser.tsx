"use client";

/**
 * CreateChooser (Creator Studio Phase B, Sept 2026).
 * The one "Create" entry on the Vault opens this small chooser instead of a
 * grid of buttons. Three doors: Brand kit, Studio image, Thumbnail. Closes on
 * Esc, backdrop click, or picking a door.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NixPose from "@/components/primitives/NixPose";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Preselect this brand in the Studio doors (the user's latest brand). */
  brandId?: string | null;
  hasBrand: boolean;
}

export default function CreateChooser({ open, onClose, brandId, hasBrand }: Props) {
  const reduce = useReducedMotion();
  const firstRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const studioQuery = brandId ? `?brand=${brandId}` : "";
  const thumbQuery = brandId ? `?brand=${brandId}&type=youtube_thumbnail` : "?type=youtube_thumbnail";

  const doors = [
    {
      key: "brand",
      href: "/generate",
      kicker: "Brand kit",
      title: hasBrand ? "Start another brand" : "Start with a brand",
      desc: "One idea in. Name, story, voice, colors, copy and a launch plan out.",
      accent: "text-primary-light",
      ring: "hover:border-primary/50",
    },
    {
      key: "studio",
      href: `/dashboard/studio${studioQuery}`,
      kicker: "Studio",
      title: "Make an image",
      desc: "Logos, product art, social graphics and a mascot, all on-brand.",
      accent: "text-gold",
      ring: "hover:border-gold/50",
    },
    {
      key: "thumb",
      href: `/dashboard/studio${thumbQuery}`,
      kicker: "Thumbnail",
      title: "Make a thumbnail",
      desc: "YouTube and short-form covers with your title set in your brand font.",
      accent: "text-gold",
      ring: "hover:border-gold/50",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="create-chooser"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="What do you want to create?"
          onClick={onClose}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.16 } }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[rgba(250,247,242,0.10)] bg-surface p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden shrink-0 sm:block">
                  <NixPose pose="conjuring" size={64} glow={false} float={false} animated={false} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-light">Create</p>
                  <h2 className="font-display text-2xl font-bold text-white">What are we making?</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[rgba(250,247,242,0.12)] px-2.5 py-1 text-sm text-muted transition-colors hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {doors.map((d, i) => (
                <Link
                  key={d.key}
                  ref={i === 0 ? firstRef : undefined}
                  href={d.href}
                  onClick={onClose}
                  className={`group flex flex-col gap-2 rounded-2xl border border-[rgba(250,247,242,0.10)] bg-raised p-4 text-left transition-colors ${d.ring} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${d.accent}`}>{d.kicker}</span>
                  <span className="font-display text-lg font-bold leading-tight text-white">{d.title}</span>
                  <span className="text-xs leading-relaxed text-muted">{d.desc}</span>
                  <span className="mt-auto pt-1 text-xs font-semibold text-white/70 transition-colors group-hover:text-white">
                    Open →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-faint">
              <span>Saving and sharing are always free. Energy only powers new creations.</span>
              <Link href="/dashboard/creator-pro" onClick={onClose} className="text-primary-light hover:underline">
                Need words? Creator Pro →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
