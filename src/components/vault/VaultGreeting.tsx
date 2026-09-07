"use client";

/**
 * VaultGreeting (Creator Studio Phase B, Sept 2026).
 * Greeting + Nix line + the one green Create button. Also carries the
 * one-time "What should Nix call you?" ask (personalization by invitation).
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import NixPose from "@/components/primitives/NixPose";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

const NAME_ASK_DISMISSED_KEY = "brandgoblin_name_ask_dismissed_v1";

interface Props {
  greeting: string;
  nixSays: string;
  displayName: string | null;
  /** True once the client has mounted (localStorage-backed bits render then). */
  mounted: boolean;
  askDismissedInitial: boolean;
  itemCount: number;
  onCreate: () => void;
}

export default function VaultGreeting({
  greeting,
  nixSays,
  displayName,
  mounted,
  askDismissedInitial,
  itemCount,
  onCreate,
}: Props) {
  const reduce = useReducedMotion();
  const [name, setName] = useState<string | null>(displayName?.trim() || null);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [dismissedNow, setDismissedNow] = useState(false);

  async function handleSaveName() {
    const cleaned = nameInput.trim().slice(0, 24);
    if (!cleaned || savingName) return;
    setSavingName(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { display_name: cleaned } });
      if (!error) {
        setName(cleaned);
        trackEvent("display_name_set", {});
      }
    } catch {
      /* non-fatal: greeting stays nameless */
    } finally {
      setSavingName(false);
    }
  }

  function handleDismissAsk() {
    setDismissedNow(true);
    try {
      localStorage.setItem(NAME_ASK_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  const showAsk = mounted && !name && !askDismissedInitial && !dismissedNow;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4 sm:gap-5"
      >
        <div className="shrink-0">
          <NixPose pose="waving" size={76} glow priority />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-light">Your Vault</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            {greeting}{name ? `, ${name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Nix says: &ldquo;{nixSays}&rdquo;
            {itemCount > 0 && (
              <span className="text-faint"> · {itemCount} {itemCount === 1 ? "creation" : "creations"} in the vault</span>
            )}
          </p>
          {showAsk && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">What should Nix call you?</span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                maxLength={24}
                placeholder="Your name"
                className="w-32 rounded-lg border border-[rgba(250,247,242,0.12)] bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-faint focus:border-primary/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName || !nameInput.trim()}
                className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-light transition-colors hover:bg-primary/20 hover:text-white disabled:opacity-40"
              >
                {savingName ? "Saving" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDismissAsk}
                className="text-xs text-faint transition-colors hover:text-white"
                title="Don't ask again"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="shrink-0"
      >
        {/* THE SPARK of the Vault (Sept 7 2026: the nav no longer carries one in-app). */}
        <button type="button" onClick={onCreate} className="btn-primary !px-6 !py-3 text-sm w-full sm:w-auto">
          + Create
        </button>
      </motion.div>
    </div>
  );
}
