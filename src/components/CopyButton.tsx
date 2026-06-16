"use client";

import { useState } from "react";
import clsx from "clsx";

export default function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        "inline-flex items-center gap-1 rounded-lg border border-goblin-border bg-goblin-bg/60 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-goblin-purple hover:text-white",
        className
      )}
    >
      {copied ? "✅ Copied" : `📋 ${label}`}
    </button>
  );
}
