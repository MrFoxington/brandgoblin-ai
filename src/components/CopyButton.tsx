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
