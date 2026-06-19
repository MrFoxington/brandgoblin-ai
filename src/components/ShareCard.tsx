"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { BrandKit } from "@/types";
import { useSoundFx } from "./primitives/SoundFx";

interface ShareCardProps {
  kit: BrandKit;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Determine whether white or dark text reads better on a given hex colour
function textOnColor(hex: string): "white" | "dark" {
  try {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "dark" : "white";
  } catch {
    return "white";
  }
}

// The printable / screenshot-able card
function Card({ kit }: { kit: BrandKit }) {
  const primary = kit.colorPalette?.[0];
  const accent = kit.colorPalette?.[1];
  const bg = primary?.hex ?? "#7c3aed";
  const textColor = textOnColor(bg);
  const tagline = kit.taglines?.[0] ?? "";

  return (
    <div
      id="share-card"
      className="relative overflow-hidden rounded-3xl"
      style={{
        width: 600,
        height: 315,
        background: `linear-gradient(135deg, ${bg} 0%, ${accent?.hex ?? "#5b21b6"} 100%)`,
        fontFamily: "system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      {/* Palette swatches — bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 flex h-4">
        {kit.colorPalette?.slice(0, 5).map((c) => (
          <div key={c.hex} className="flex-1" style={{ backgroundColor: c.hex }} />
        ))}
      </div>

      {/* BrandGoblin watermark */}
      <div
        className="absolute top-5 right-6 flex items-center gap-1.5 opacity-80"
        style={{ color: textColor === "white" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)" }}
      >
        <Image src="/icon.svg" alt="BrandGoblin" width={16} height={16} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>BrandGoblin AI</span>
      </div>

      {/* Nix */}
      <div className="absolute right-8 bottom-6" style={{ opacity: 0.9 }}>
        <Image
          src="/nix/celebrating-nix.png"
          alt="Nix celebrating"
          width={110}
          height={110}
          className="drop-shadow-2xl"
        />
      </div>

      {/* Content */}
      <div
        className="absolute left-8 top-0 bottom-6 flex flex-col justify-center pr-32"
        style={{ color: textColor === "white" ? "#fff" : "#1a1a1a" }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", opacity: 0.7, textTransform: "uppercase", marginBottom: 10 }}>
          ✦ New Brand Alert
        </p>
        <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, marginBottom: 10, letterSpacing: "-0.02em" }}>
          {kit.recommendedName}
        </h1>
        {tagline && (
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.4, fontStyle: "italic", maxWidth: 340 }}>
            &ldquo;{tagline}&rdquo;
          </p>
        )}
        {kit.colorPalette?.slice(0, 3).map((c) => (
          <span key={c.hex} style={{ display: "inline-block", marginTop: 14, marginRight: 8, fontSize: 11, opacity: 0.75 }}>
            {c.hex}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ShareCard({ kit }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { playCopy } = useSoundFx();
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      playCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }

  async function handleDownload() {
    // Dynamic import so html2canvas only loads when needed
    try {
      const el = document.getElementById("share-card");
      if (!el) return;
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `${kit.recommendedName}-brand-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: just open print dialog
      window.print();
    }
  }

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost !text-sm flex items-center gap-2"
      >
        <span>🃏</span>
        {open ? "Hide Share Card" : "Share Your Brand"}
        <span className="text-xs text-faint">{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              {/* Card preview — scrollable on small screens */}
              <div className="overflow-x-auto rounded-2xl" ref={cardRef}>
                <Card kit={kit} />
              </div>

              {/* Action row */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
                >
                  📥 Download PNG
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
                >
                  {copied ? "✓ Link copied!" : "🔗 Copy link"}
                </button>
              </div>

              <p className="text-xs text-faint">
                Screenshot or download the card above to share on social media.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
