"use client";

/**
 * VaultHero (Creator Studio Phase B, Sept 2026).
 * The user's latest creation, big, at the top of the Vault. Pride first.
 *   art   → the image as large as the column allows + Open / Share / Download
 *   brand → the kit as a poster: name, tagline, palette (or the official logo)
 *   none  → the first-run invitation (was EmptyState)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import NixPose from "@/components/primitives/NixPose";
import { shareImageFile } from "@/lib/studio/share";
import { timeAgo, type VaultItem, type VaultArtItem, type VaultBrandItem } from "@/lib/vault";

const EXAMPLES = [
  "A dog treat company for health-conscious pet owners",
  "A coffee brand for gamers",
  "A Shopify store for handmade jewellery",
  "A productivity app for students",
];

export default function VaultHero({ item }: { item: VaultItem | null }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
      aria-label="Latest creation"
    >
      {!item ? <EmptyHero /> : item.kind === "art" ? <ArtHero item={item} /> : <BrandHero item={item} />}
    </motion.section>
  );
}

// Relative time only after mount: the server and the browser can disagree
// around midnight, which would be a hydration mismatch.
function useTimeAgo(dateStr: string): string | null {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => setLabel(timeAgo(dateStr)), [dateStr]);
  return label;
}

// ── Empty ─────────────────────────────────────────────────────────────────────

function EmptyHero() {
  return (
    <div className="rounded-3xl border border-[rgba(250,247,242,0.08)] bg-surface p-6 sm:p-10">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="shrink-0">
          <NixPose pose="waving" size={120} glow />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-light">Nothing in the vault yet</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
            Your first brand is one sentence away.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Tell Nix the idea. Big, small, half-baked or fully formed. You get the name, story, voice, colors, copy and a launch plan in about two minutes.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/generate" className="btn-green !px-6 !py-3 text-sm">
              Bring my idea to life
            </Link>
            <span className="text-xs text-faint">Free to try</span>
          </div>
        </div>
      </div>
      <div className="mt-6 border-t border-[rgba(250,247,242,0.08)] pt-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-faint">Or steal one of these</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <Link
              key={ex}
              href="/generate"
              className="rounded-xl border border-[rgba(250,247,242,0.10)] bg-[rgba(250,247,242,0.035)] px-4 py-3 text-left text-sm text-muted transition-colors hover:border-primary/40 hover:text-white"
            >
              &ldquo;{ex}&rdquo;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Studio creation ───────────────────────────────────────────────────────────

function ArtHero({ item }: { item: VaultArtItem }) {
  const when = useTimeAgo(item.createdAt);
  const [shareState, setShareState] = useState<"idle" | "busy" | "shared" | "copied">("idle");
  const [downloading, setDownloading] = useState(false);
  const portrait = item.height > item.width;
  const studioHref = item.brandId ? `/dashboard/studio?brand=${item.brandId}` : "/dashboard/studio";
  const filename = `goblin-studio-${item.imageType ?? "image"}-${item.id.slice(0, 8)}.jpg`;

  async function handleShare() {
    if (!item.url || shareState === "busy") return;
    setShareState("busy");
    const result = await shareImageFile(item.url, { filename, title: item.brandName ?? "BrandGoblin" });
    if (result === "shared" || result === "copied") {
      setShareState(result);
      setTimeout(() => setShareState("idle"), 2000);
    } else {
      setShareState("idle");
    }
  }

  async function handleDownload() {
    if (!item.url || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename.replace(/\.jpg$/, `.${ext}`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoking synchronously cancels the download in Safari/Firefox.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } catch {
      /* non-fatal */
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(250,247,242,0.08)] bg-surface">
      <div className={`grid ${portrait ? "md:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)]" : "md:grid-cols-[minmax(0,1.6fr)_minmax(240px,0.8fr)]"}`}>
        {/* The creation */}
        <Link href={studioHref} className="group relative block bg-black/30" aria-label={`Open ${item.typeLabel} in the Studio`}>
          <div
            className="relative mx-auto w-full"
            style={{
              aspectRatio: `${item.width} / ${item.height}`,
              maxHeight: portrait ? 560 : 520,
            }}
          >
            {item.url && (
              <Image
                src={item.url}
                alt={`${item.typeLabel}${item.brandName ? ` for ${item.brandName}` : ""}`}
                fill
                unoptimized
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.01]"
              />
            )}
          </div>
        </Link>

        {/* The words */}
        <div className="flex flex-col gap-4 p-5 sm:p-6 md:border-l md:border-[rgba(250,247,242,0.08)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold">
              Latest creation{when ? <span className="font-normal normal-case tracking-normal text-faint"> · {when}</span> : null}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">{item.typeLabel}</h2>
            {item.brandName && (
              <p className="mt-1 text-sm text-muted">
                for <span className="font-semibold text-white">{item.brandName}</span>
              </p>
            )}
            {item.favorite && <p className="mt-2 text-xs font-semibold text-gold">★ Favorite</p>}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Link href={studioHref} className="btn-green !py-2.5 !px-5 text-sm">
              Open in Studio
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleShare} disabled={!item.url || shareState === "busy"} className="btn-ghost justify-center disabled:opacity-50">
                {shareState === "shared" ? "Shared ✓" : shareState === "copied" ? "Link copied ✓" : shareState === "busy" ? "Sharing" : "Share"}
              </button>
              <button type="button" onClick={handleDownload} disabled={!item.url || downloading} className="btn-ghost justify-center disabled:opacity-50">
                {downloading ? "Saving" : "Download"}
              </button>
            </div>
            <p className="text-[11px] text-faint">Yours to keep. Saving and sharing never cost energy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Brand kit ─────────────────────────────────────────────────────────────────

function BrandHero({ item }: { item: VaultBrandItem }) {
  const when = useTimeAgo(item.createdAt);
  const colors = item.colors.length ? item.colors : [{ hex: "#2E7D5B", name: "Goblin green" }];

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(250,247,242,0.08)] bg-surface">
      <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        {/* The words */}
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-light">
              Latest brand kit{when ? <span className="font-normal normal-case tracking-normal text-faint"> · {when}</span> : null}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl">{item.name}</h2>
            {item.tagline && (
              <p className="mt-3 font-display text-lg italic text-primary-light sm:text-xl">&ldquo;{item.tagline}&rdquo;</p>
            )}
            {item.idea && <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-relaxed text-muted">{item.idea}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.ownName && <span className="badge-purple text-xs">Own name</span>}
            {item.industry && <span className="badge-green text-xs capitalize">{item.industry}</span>}
            {item.traits.map((t) => (
              <span key={t} className="badge-purple text-xs capitalize">{t}</span>
            ))}
            {item.favorite && <span className="badge-gold text-xs">★ Favorite</span>}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/brand/${item.id}`} className="btn-green !py-2.5 !px-5 text-sm">
              Open brand kit
            </Link>
            <Link href={`/dashboard/studio?brand=${item.id}`} className="btn-ghost">
              Make art in the Studio
            </Link>
          </div>
        </div>

        {/* The poster: official logo if there is one, else the palette */}
        <div className="relative min-h-[220px] md:min-h-[320px]">
          {item.logoUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-paper p-6">
              <div className="relative h-full w-full">
                <Image
                  src={item.logoUrl}
                  alt={`${item.name} official logo`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex h-9">
                {colors.map((c, i) => (
                  <span key={c.hex + i} className="flex-1" style={{ backgroundColor: c.hex }} title={`${c.name} ${c.hex}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col">
              <div className="flex flex-1">
                {colors.map((c, i) => (
                  <div
                    key={c.hex + i}
                    className="group relative flex flex-1 items-end justify-center overflow-hidden"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    <span
                      className="mb-3 rotate-180 font-mono text-[10px] tracking-widest opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ writingMode: "vertical-rl", color: readableOn(c.hex) }}
                    >
                      {c.hex.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[rgba(250,247,242,0.08)] bg-raised px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">Palette</span>
                <span className="truncate font-mono text-[11px] text-muted">
                  {colors.map((c) => c.hex.toUpperCase()).join(" · ")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Ink or paper text over a hex background. */
function readableOn(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#FAF7F2";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#141518" : "#FAF7F2";
}
