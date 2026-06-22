"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { downloadWallpaperBranded } from "@/lib/nix-download";
import type { Wallpaper } from "@/lib/nix-assets";
import NixEmptyState from "./NixEmptyState";

interface Props {
  wallpapers: Wallpaper[];
}

function fileName(name: string, variant: string, path: string) {
  const ext = path.split(".").pop() ?? "png";
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `nix-${safe || "wallpaper"}-${variant}.${ext}`;
}

export default function NixWallpapers({ wallpapers }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  async function handleDownload(wp: Wallpaper, variant: "desktop" | "phone", path: string) {
    const key = `${wp.name}-${variant}`;
    setBusy(key);
    try {
      await downloadWallpaperBranded(path, fileName(wp.name, variant, path));
    } finally {
      setBusy(null);
    }
  }

  if (!wallpapers.length) {
    return <NixEmptyState label="Wallpapers" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {wallpapers.map((wp) => {
        const preview = wp.desktop ?? wp.phone;
        return (
          <motion.div
            key={wp.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-card overflow-hidden"
          >
            <div className="relative aspect-video bg-black/30">
              {preview && (
                <Image
                  src={preview}
                  alt={`${wp.name} wallpaper`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              )}
              <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-white/70 drop-shadow">
                Nix · brandgoblinai.com
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-white mb-2.5">{wp.name}</p>
              <div className="flex gap-2 flex-wrap">
                {wp.desktop && (
                  <button
                    onClick={() => handleDownload(wp, "desktop", wp.desktop!)}
                    disabled={busy === `${wp.name}-desktop`}
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/85 disabled:opacity-60 transition-colors"
                  >
                    {busy === `${wp.name}-desktop` ? "Preparing…" : "🖥 Desktop"}
                  </button>
                )}
                {wp.phone && (
                  <button
                    onClick={() => handleDownload(wp, "phone", wp.phone!)}
                    disabled={busy === `${wp.name}-phone`}
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/85 disabled:opacity-60 transition-colors"
                  >
                    {busy === `${wp.name}-phone` ? "Preparing…" : "📱 Phone"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
