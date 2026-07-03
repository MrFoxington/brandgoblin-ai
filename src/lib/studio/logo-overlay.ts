// Goblin Studio — official logo overlay.
// Stamps a brand's chosen logo onto generated product art / social graphics so the
// EXACT same logo appears every time (text-to-image models cannot reuse a precise
// logo on their own).
//
// Watermark-first: if the logo has real transparency (or its white background can
// be removed cleanly), it is composited directly onto the art like a watermark —
// no white box. Only a logo on a COLORED background falls back to the white
// rounded badge, where the panel actually reads as intentional.

import sharp from "sharp";

// True when the PNG buffer has a meaningful amount of transparent area — not
// just an alpha channel that happens to be fully opaque, and not a few stray
// pixels. mean < 250 ≈ at least ~2% of the image is see-through.
async function hasRealTransparency(pngBuf: Buffer): Promise<boolean> {
  const stats = await sharp(pngBuf).stats();
  const alpha = stats.channels[3];
  return !!alpha && alpha.min < 128 && alpha.mean < 250;
}

export async function compositeLogoBadge(baseBuf: Buffer, logoBuf: Buffer): Promise<Buffer> {
  const base = sharp(baseBuf, { failOn: "none" });
  const meta = await base.metadata();
  const W = meta.width ?? 1024;
  const H = meta.height ?? 1024;

  // Logo sized to ~12% of the image width (min 80px so it's never tiny).
  const logoTargetW = Math.max(80, Math.round(W * 0.12));
  const resizedLogo = await sharp(logoBuf, { failOn: "none" })
    .resize({ width: logoTargetW, withoutEnlargement: false })
    .png()
    .toBuffer();

  // ── Get a transparent version of the logo if at all possible ──────────────
  let watermark: Buffer | null = null;

  if (await hasRealTransparency(resizedLogo)) {
    watermark = resizedLogo; // already a proper transparent PNG (e.g. after Remove BG)
  } else {
    // Opaque logo — most logo concepts sit on a plain white background, and
    // sharp's unflatten() turns pure-white pixels transparent. Keep the result
    // only if it actually produced real transparency (i.e. the bg WAS white).
    try {
      const unflattened = await sharp(resizedLogo).unflatten().png().toBuffer();
      if (await hasRealTransparency(unflattened)) watermark = unflattened;
    } catch {
      /* fall through to the badge */
    }
  }

  const margin = Math.round(W * 0.035);

  // ── Watermark path: stamp the transparent logo directly, no panel ─────────
  if (watermark) {
    const wm = await sharp(watermark).metadata();
    const ww = wm.width ?? logoTargetW;
    const wh = wm.height ?? logoTargetW;
    return base
      .composite([{ input: watermark, top: H - wh - margin, left: W - ww - margin }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  // ── Fallback (colored-background logo): white rounded badge ───────────────
  const lm = await sharp(resizedLogo).metadata();
  const lw = lm.width ?? logoTargetW;
  const lh = lm.height ?? logoTargetW;

  const pad = Math.round(logoTargetW * 0.16);
  const badgeW = lw + pad * 2;
  const badgeH = lh + pad * 2;
  const radius = Math.round(Math.min(badgeW, badgeH) * 0.18);

  const panelSvg = Buffer.from(
    `<svg width="${badgeW}" height="${badgeH}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect x="0" y="0" width="${badgeW}" height="${badgeH}" rx="${radius}" ry="${radius}" fill="white"/>` +
      `</svg>`
  );

  const badge = await sharp(panelSvg)
    .composite([{ input: resizedLogo, top: pad, left: pad }])
    .png()
    .toBuffer();

  return base
    .composite([{ input: badge, top: H - badgeH - margin, left: W - badgeW - margin }])
    .jpeg({ quality: 90 })
    .toBuffer();
}
