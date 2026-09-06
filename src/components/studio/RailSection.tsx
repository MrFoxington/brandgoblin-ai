"use client";

/**
 * RailSection (Creator Studio Phase C, Sept 2026).
 * One collapsible section of the Studio tool rail. The header always shows
 * the current choice, so a closed rail still reads at a glance.
 */

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  /** The current choice, shown in the header (white, truncated). */
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  /** Gold = Studio signature sections (engine, fonts). */
  tone?: "green" | "gold";
}

export default function RailSection({ id, title, summary, open, onToggle, children, tone = "green" }: Props) {
  const reduce = useReducedMotion();
  const panelId = `rail-${id}`;
  return (
    <section className="rounded-xl border border-[rgba(250,247,242,0.08)] bg-[rgba(250,247,242,0.025)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className={`block text-[10px] font-bold uppercase tracking-widest ${tone === "gold" ? "text-gold" : "text-primary-light"}`}>
            {title}
          </span>
          {summary !== undefined && summary !== null && summary !== "" && (
            <span className="mt-0.5 block truncate text-sm text-white">{summary}</span>
          )}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="shrink-0 text-xs text-faint"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgba(250,247,242,0.08)] px-3.5 pb-4 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
