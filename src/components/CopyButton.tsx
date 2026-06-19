"use client";

import { useState } from "react";
import clsx from "clsx";
import { useToast } from "./NixToast";
import { useSoundFx } from "./primitives/SoundFx";

const NIX_COPY_QUOTES = [
  "Copied! Go build something great.",
  "That's a good one. Copied! ✨",
  "Nix approves. Copied! 🧌",
  "Saved to clipboard!",
  "Copied! Use it well.",
];

export default function CopyButton({
  text,
  label = "Copy",
  className,
  silent,
}: {
  text: string;
  label?: string;
  className?: string;
  silent?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const { playCopy } = useSoundFx();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      playCopy();
      setTimeout(() => setCopied(false), 1500);
      if (!silent) {
        const quote = NIX_COPY_QUOTES[Math.floor(Math.random() * NIX_COPY_QUOTES.length)];
        showToast(quote, "nix");
      }
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx("btn-ghost !text-xs !py-1 !px-2.5", className)}
    >
      {copied ? "✅ Copied" : `📋 ${label}`}
    </button>
  );
}
