"use client";

/**
 * StudioCoach (Creator Studio Phase D, Sept 2026).
 * Six one-sentence tips that walk a first-timer to their first shared image:
 * pick a brand → Product Art → name the product → Conjure → Save → Share.
 * Each tip sits on the control it points at (the rail section, the Conjure
 * button, the canvas toolbar). A step disappears the moment it is done; ✕
 * ends the coach for good. Never shown to anyone who already has a creation.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export type CoachStep = "brand" | "type" | "product" | "conjure" | "save" | "share";

export const COACH_STEPS: { key: CoachStep; text: string }[] = [
  { key: "brand",   text: "Pick the brand this is for." },
  { key: "type",    text: "Choose Product Art to see your brand on a real thing." },
  { key: "product", text: "Name the product, like coffee bag or hoodie." },
  { key: "conjure", text: "Hit Conjure. Nix cooks the rest." },
  { key: "save",    text: "Save it. Yours to keep, no energy spent." },
  { key: "share",   text: "Share it and Nix celebrates with you." },
];

const STORAGE_KEY = "brandgoblin_studio_coach_v1";

interface CoachInputs {
  /** False for anyone who already has a finished creation at page load. */
  firstTimer: boolean;
  hasBrand: boolean;
  isProductArt: boolean;
  hasProduct: boolean;
  hasCompleted: boolean;
  saved: boolean;
  shared: boolean;
}

export function useStudioCoach(i: CoachInputs) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true); // stable for SSR

  useEffect(() => {
    setMounted(true);
    try {
      // ?coach=1 (forced preview) ignores the remembered dismissal.
      const forced = typeof location !== "undefined" && new URLSearchParams(location.search).get("coach") === "1";
      setDismissed(!forced && localStorage.getItem(STORAGE_KEY) === "done");
    } catch {
      setDismissed(false);
    }
  }, []);

  const done: Record<CoachStep, boolean> = useMemo(
    () => ({
      brand: i.hasBrand,
      type: i.isProductArt,
      product: i.hasProduct,
      conjure: i.hasCompleted,
      save: i.saved,
      share: i.shared,
    }),
    [i.hasBrand, i.isProductArt, i.hasProduct, i.hasCompleted, i.saved, i.shared]
  );

  const active = mounted && i.firstTimer && !dismissed;
  const current = active ? COACH_STEPS.find((s) => !done[s.key]) ?? null : null;

  // All six done: remember it so the coach never comes back.
  useEffect(() => {
    if (active && !current) {
      try { localStorage.setItem(STORAGE_KEY, "done"); } catch { /* ignore */ }
      setDismissed(true);
    }
  }, [active, current]);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, "done"); } catch { /* ignore */ }
    setDismissed(true);
  }, []);

  return {
    active: active && !!current,
    step: current?.key ?? null,
    text: current?.text ?? "",
    index: current ? COACH_STEPS.findIndex((s) => s.key === current.key) + 1 : 0,
    total: COACH_STEPS.length,
    dismiss,
  };
}

/** The bubble. Renders wherever the current step's control lives. */
export function CoachTip({
  text,
  index,
  total,
  onDismiss,
  action,
  className = "",
}: {
  text: string;
  index: number;
  total: number;
  onDismiss: () => void;
  /** Optional button, e.g. "Open tools" on phones. */
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border border-primary/50 bg-primary/10 px-3 py-2.5 ${className}`}
    >
      <Image src="/nix/happy-waving-nix.png" alt="" width={28} height={28} className="mt-0.5 h-7 w-7 shrink-0 object-contain" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light">
          Nix tip {index} of {total}
        </p>
        <p className="mt-0.5 text-sm leading-snug text-white">{text}</p>
        {action && (
          <button type="button" onClick={action.onClick} className="mt-1.5 text-xs font-semibold text-primary-light hover:underline">
            {action.label} →
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-faint transition-colors hover:text-white"
        aria-label="Turn off tips"
        title="Turn off tips"
      >
        ✕
      </button>
    </motion.div>
  );
}
