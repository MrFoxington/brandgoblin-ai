// Share card (Creator Studio Phase D, Sept 2026).
// The creation on a branded frame, built in the browser with <canvas>, handed
// to the native share sheet as a real file. Desktop (no file sheet) downloads
// the card instead. Same celebrate-only-on-real-share contract as share.ts.

import type { ShareResult } from "./share";

export interface ShareCardBrand {
  name: string;
  tagline?: string | null;
  /** Palette hexes, primary first. */
  colors: string[];
}
// Fox's rule (Sept 6, 2026): the card is the USER's brand, never ours. No
// BrandGoblin mark on anything a member makes, on any tier. Clean sharing only.

export type ShareCardResult = ShareResult | "downloaded";

// Prebuilt cards, by job id. Safari only forwards the tap's user activation for
// about a second, and fetch + decode + toBlob can eat that. Build the card the
// moment a creation lands on the canvas (or the reveal opens) so the tap path is
// "await an already-settled promise, then share()". Small, bounded cache.
const cardCache = new Map<string, Promise<Blob>>();
const CACHE_MAX = 8;

export function prepareShareCard(jobId: string, imageUrl: string, brand: ShareCardBrand): Promise<Blob> {
  const key = `${jobId}|${brand.name}`;
  const hit = cardCache.get(key);
  if (hit) return hit;
  const p = buildShareCard(imageUrl, brand);
  p.catch(() => cardCache.delete(key)); // a failed build is retried next time
  cardCache.set(key, p);
  if (cardCache.size > CACHE_MAX) {
    const first = cardCache.keys().next().value;
    if (first !== undefined) cardCache.delete(first);
  }
  return p;
}

const W = 1080;
const H = 1350;

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

function mix(hex: string, towards: [number, number, number], t: number): string {
  const rgb = hexToRgb(hex) ?? [20, 21, 24];
  const c = rgb.map((v, i) => Math.round(v + (towards[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

async function loadBitmap(url: string): Promise<ImageBitmap | HTMLImageElement> {
  // fetch + createImageBitmap keeps the canvas untainted (Supabase storage
  // answers CORS for fetch). Fall back to a crossOrigin <img>.
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    if (typeof createImageBitmap === "function") return await createImageBitmap(blob);
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    await img.decode();
    return img;
  } catch {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();
    return img;
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function displayFont(): string {
  if (typeof document === "undefined") return "serif";
  const v = getComputedStyle(document.body).getPropertyValue("--font-display").trim();
  return v ? v.split(",")[0].replace(/["']/g, "") : "serif";
}

export async function buildShareCard(imageUrl: string, brand: ShareCardBrand): Promise<Blob> {
  const [art] = await Promise.all([
    loadBitmap(imageUrl),
    typeof document !== "undefined" && document.fonts?.load
      ? document.fonts.load(`700 64px "${displayFont()}"`).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");

  const primary = brand.colors.find((c) => hexToRgb(c)) ?? "#141518";
  const lightBg = luminance(primary) > 0.6;
  const ink = "#141518";
  const paper = "#FAF7F2";
  const text = lightBg ? ink : paper;

  // Background: the brand's primary, deepened towards the bottom.
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, mix(primary, lightBg ? [255, 255, 255] : [20, 21, 24], 0.08));
  grad.addColorStop(1, mix(primary, lightBg ? [255, 255, 255] : [0, 0, 0], lightBg ? 0.3 : 0.45));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // The creation, fitted into a 920 box with a soft shadow and rounded corners.
  const box = 920;
  const aw = "width" in art ? art.width : (art as HTMLImageElement).naturalWidth;
  const ah = "height" in art ? art.height : (art as HTMLImageElement).naturalHeight;
  const scale = Math.min(box / aw, box / ah);
  const dw = Math.round(aw * scale);
  const dh = Math.round(ah * scale);
  const dx = Math.round((W - dw) / 2);
  const dy = Math.round(90 + (box - dh) / 2);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  roundedRect(ctx, dx, dy, dw, dh, 36);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.restore();

  // Paper under the art so transparent creations (BG removed, uploads) read
  // as a print, not a black slab.
  ctx.save();
  roundedRect(ctx, dx, dy, dw, dh, 36);
  ctx.clip();
  ctx.fillStyle = paper;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.drawImage(art as CanvasImageSource, dx, dy, dw, dh);
  ctx.restore();

  // Words: brand name, tagline, palette. Nothing of ours.
  const font = displayFont();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = text;
  ctx.font = `700 64px "${font}", Georgia, serif`;
  const name = brand.name.length > 26 ? brand.name.slice(0, 25) + "…" : brand.name;
  if (name) ctx.fillText(name, W / 2, 1138);

  if (brand.tagline) {
    ctx.globalAlpha = 0.8;
    ctx.font = `italic 400 32px "${font}", Georgia, serif`;
    const tag = brand.tagline.length > 60 ? brand.tagline.slice(0, 59) + "…" : brand.tagline;
    ctx.fillText(`“${tag}”`, W / 2, 1194);
    ctx.globalAlpha = 1;
  }

  // Palette dots
  const dots = brand.colors.filter((c) => hexToRgb(c)).slice(0, 5);
  if (dots.length) {
    const size = 22;
    const gap = 14;
    const total = dots.length * size + (dots.length - 1) * gap;
    let x = (W - total) / 2 + size / 2;
    for (const c of dots) {
      ctx.beginPath();
      ctx.arc(x, 1256, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = lightBg ? "rgba(20,21,24,0.15)" : "rgba(250,247,242,0.25)";
      ctx.stroke();
      x += size + gap;
    }
  }



  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Put the card on the share sheet. Phones: the real file goes to IG / TikTok /
 * Messages / Save to Photos. Desktop: the card downloads. Pass `jobId` so a
 * prebuilt card is used (see prepareShareCard); without it the card is built
 * on the spot, which Safari may treat as losing the tap.
 */
export async function shareCard(
  imageUrl: string,
  brand: ShareCardBrand,
  filename = "share-card.jpg",
  jobId?: string
): Promise<ShareCardResult> {
  let blob: Blob;
  try {
    blob = await (jobId ? prepareShareCard(jobId, imageUrl, brand) : buildShareCard(imageUrl, brand));
  } catch {
    return "failed";
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = (typeof navigator !== "undefined" ? navigator : null) as any;
  if (nav && typeof nav.canShare === "function" && typeof nav.share === "function" && typeof File !== "undefined") {
    const file = new File([blob], filename, { type: "image/jpeg" });
    try {
      if (nav.canShare({ files: [file] })) {
        // Sheet metadata stays theirs too: the brand name, nothing of ours.
        await nav.share({ files: [file], title: brand.name || "My creation" });
        return "shared";
      }
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === "AbortError") return "cancelled";
      // The tap's activation expired (Safari) or a share is already open: not
      // a desktop case, so do not surprise the user with a download.
      if (name === "NotAllowedError" || name === "InvalidStateError") return "failed";
      // Desktop browsers claim file share then reject: download instead.
    }
  }
  try {
    downloadBlob(blob, filename);
    return "downloaded";
  } catch {
    return "failed";
  }
}
