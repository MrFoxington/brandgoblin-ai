"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { downloadFile } from "@/lib/nix-download";
import { shareImage } from "@/lib/studio/share";
import { useSoundFx } from "@/components/primitives/SoundFx";
import type { GalleryItem } from "@/lib/nix-assets";
import NixEmptyState from "./NixEmptyState";

interface Props {
  items: GalleryItem[];
}

const SHARE_TEXT = "Meet Nix from BrandGoblin 🧙✨ brandgoblinai.com";

function itemFileName(name: string, path: string) {
  const ext = path.split(".").pop() ?? "png";
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `nix-${safe || "clip"}.${ext}`;
}

export default function NixGallery({ items }: Props) {
  const { playButtonPress, playShare } = useSoundFx();
  const [copied, setCopied] = useState<string | null>(null);

  async function handleShare(item: GalleryItem) {
    // Absolute URL so the shared link resolves anywhere
    const url = typeof window !== "undefined" ? window.location.origin + item.path : item.path;
    const result = await shareImage(url, { title: "Nix from BrandGoblin", text: SHARE_TEXT });
    if (result === "shared" || result === "copied") {
      playShare();
      if (result === "copied") {
        setCopied(item.path);
        setTimeout(() => setCopied((c) => (c === item.path ? null : c)), 2000);
      }
    }
  }

  if (!items.length) {
    return <NixEmptyState label="Gallery clips" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <motion.div
          key={item.path}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-primary/20 bg-card overflow-hidden"
        >
          <div className="relative aspect-square bg-black/30">
            {item.kind === "clip" ? (
              <video
                src={item.path}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                controls={false}
              />
            ) : (
              <Image src={item.path} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            )}
          </div>
          <div className="p-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white truncate">{item.name}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleShare(item)}
                className="rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] px-2.5 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
              >
                {copied === item.path ? "✓ Copied" : "Share ✨"}
              </button>
              <button
                onClick={() => { playButtonPress(); downloadFile(item.path, itemFileName(item.name, item.path)); }}
                title="Download"
                className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-faint hover:text-muted hover:border-white/20 transition-colors"
              >
                ↓
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
