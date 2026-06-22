"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { downloadFile, downloadStickersZip } from "@/lib/nix-download";
import { useSoundFx } from "@/components/primitives/SoundFx";
import type { Sticker } from "@/lib/nix-assets";
import NixEmptyState from "./NixEmptyState";

interface Props {
  stickers: Sticker[];
}

function stickerFileName(name: string, path: string) {
  const ext = path.split(".").pop() ?? "png";
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `nix-${safe || "sticker"}.${ext}`;
}

export default function NixStickers({ stickers }: Props) {
  const { playButtonPress } = useSoundFx();
  const [zipBusy, setZipBusy] = useState(false);

  async function handleDownloadAll() {
    if (zipBusy) return;
    setZipBusy(true);
    playButtonPress();
    try {
      await downloadStickersZip(stickers);
    } finally {
      setZipBusy(false);
    }
  }

  if (!stickers.length) {
    return <NixEmptyState label="Stickers" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted">
          Transparent PNGs — drop them into WhatsApp, Telegram, or Discord as custom stickers/emoji.
        </p>
        <button
          onClick={handleDownloadAll}
          disabled={zipBusy}
          className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-white hover:bg-secondary/85 disabled:opacity-60 transition-colors"
        >
          {zipBusy ? "Zipping…" : "⬇ Download all (zip)"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {stickers.map((s) => (
          <motion.div
            key={s.path}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/15 bg-[conic-gradient(at_50%_50%,#ffffff0a,#ffffff03)] p-3 flex flex-col items-center gap-2.5"
          >
            <div className="relative aspect-square w-full">
              <Image src={s.path} alt={s.name} fill className="object-contain" sizes="200px" />
            </div>
            <button
              onClick={() => { playButtonPress(); downloadFile(s.path, stickerFileName(s.name, s.path)); }}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-2 py-1.5 text-xs font-semibold text-muted hover:text-white hover:border-white/25 transition-colors"
            >
              ⬇ Download
            </button>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-xs text-faint leading-relaxed">
        <p className="font-semibold text-muted mb-1">How to add these to your messenger:</p>
        <ul className="space-y-0.5">
          <li>• <span className="text-muted">WhatsApp:</span> use a sticker-maker app, import the PNGs, add to your pack.</li>
          <li>• <span className="text-muted">Telegram:</span> message @Stickers, send the PNGs, follow the prompts.</li>
          <li>• <span className="text-muted">Discord:</span> Server Settings → Stickers/Emoji → Upload.</li>
        </ul>
      </div>
    </div>
  );
}
