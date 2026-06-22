"use client";

import Image from "next/image";

interface Props {
  label: string;
}

// Graceful "coming soon" state — shown when an asset folder/manifest array is empty.
// Uses the existing waving Nix PNG only — never a generated/placeholder Nix.
export default function NixEmptyState({ label }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-10 flex flex-col items-center text-center gap-3">
      <Image
        src="/nix/happy-waving-nix.png"
        alt="Nix waving"
        width={80}
        height={80}
        className="object-contain opacity-70"
      />
      <p className="text-sm text-muted">
        {label} are on the way — Nix is working on more goodies. Check back soon! ✨
      </p>
    </div>
  );
}
