// Download helpers for the Nix Zone. All client-side, same-origin /public files.
// Branded wallpaper download adds a small "Nix · brandgoblinai.com" text mark at
// download time — it never modifies the source file on disk and never generates art.

const BRAND_MARK = "Nix · brandgoblinai.com";

// ── Plain file download (stickers keep transparency, gallery as-is) ───────────
export async function downloadFile(path: string, filename: string): Promise<void> {
  try {
    const res = await fetch(path);
    const blob = await res.blob();
    triggerBlobDownload(blob, filename);
  } catch {
    // Fallback: navigate the browser to the file (lets it download/handle directly)
    try {
      const a = document.createElement("a");
      a.href = path;
      a.download = filename;
      a.click();
    } catch { /* non-fatal */ }
  }
}

// ── Branded wallpaper download — composites a tasteful corner mark via canvas ──
export async function downloadWallpaperBranded(path: string, filename: string): Promise<void> {
  try {
    const img = await loadImage(path);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas ctx");

    ctx.drawImage(img, 0, 0);

    // Small, tasteful mark in the bottom-right corner (scales with image size)
    const fontSize = Math.max(16, Math.round(canvas.width * 0.018));
    const pad = Math.round(fontSize * 0.9);
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";

    const x = canvas.width - pad;
    const y = canvas.height - pad;
    // Soft shadow for legibility on any background, then the mark itself
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = Math.round(fontSize * 0.4);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText(BRAND_MARK, x, y);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );
    if (blob) {
      triggerBlobDownload(blob, filename);
      return;
    }
    throw new Error("toBlob failed");
  } catch {
    // If canvas/branding fails for any reason, fall back to the plain file
    await downloadFile(path, filename);
  }
}

// ── Download all stickers as a zip (jszip loaded dynamically — click-time only) ─
export async function downloadStickersZip(
  stickers: { name: string; path: string }[]
): Promise<boolean> {
  if (!stickers.length) return false;
  try {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const folder = zip.folder("nix-stickers");

    await Promise.all(
      stickers.map(async (s) => {
        const res = await fetch(s.path);
        const blob = await res.blob();
        const ext = s.path.split(".").pop() ?? "png";
        const safe = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        folder?.file(`${safe || "nix-sticker"}.${ext}`, blob);
      })
    );

    const out = await zip.generateAsync({ type: "blob" });
    triggerBlobDownload(out, "nix-sticker-pack.zip");
    return true;
  } catch {
    return false;
  }
}

// ── internals ─────────────────────────────────────────────────────────────────
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
