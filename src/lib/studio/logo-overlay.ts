// Goblin Studio — official logo overlay.
// Stamps a brand's chosen logo onto generated product art / social graphics so the
// EXACT same logo appears every time (text-to-image models cannot reuse a precise
// logo on their own). The logo is placed on a clean white rounded "badge" in the
// bottom-right corner, which reads as a deliberate brand lockup whether the source
// logo has a transparent background or not.

import sharp from "sharp";

export async function compositeLogoBadge(baseBuf: Buffer, logoBuf: Buffer): Promise<Buffer> {
  const base = sharp(baseBuf, { failOn: "none" });
  const meta = await base.metadata();
  const W = meta.width ?? 1024;
  const H = meta.height ?? 1024;

  // Logo sized to ~18% of the image width (min 96px so it's never tiny).
  const logoTargetW = Math.max(96, Math.round(W * 0.18));
  const resizedLogo = await sharp(logoBuf, { failOn: "none" })
    .resize({ width: logoTargetW, withoutEnlargement: false })
    .png()
    .toBuffer();
  const lm = await sharp(resizedLogo).metadata();
  const lw = lm.width ?? logoTargetW;
  const lh = lm.height ?? logoTargetW;

  // White rounded panel sized to the logo + inner padding.
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

  const margin = Math.round(W * 0.035);
  return base
    .composite([{ input: badge, top: H - badgeH - margin, left: W - badgeW - margin }])
    .jpeg({ quality: 90 })
    .toBuffer();
}
