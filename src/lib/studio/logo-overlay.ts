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
export async function hasRealTransparency(pngBuf: Buffer): Promise<boolean> {
  const stats = await sharp(pngBuf).stats();
  const alpha = stats.channels[3];
  return !!alpha && alpha.min < 128 && alpha.mean < 250;
}

// Strip a logo's white/cream background via EDGE-CONNECTED FLOOD FILL.
// Unlike a global near-white pass, this only removes near-white pixels that are
// reachable from the image border — so white/cream shapes INSIDE the logo
// (wave foam, highlights, negative space enclosed by the mark) survive.
// Threshold 225 catches white AND warm cream backdrops while leaving real brand
// colors (golds, teals, oranges) untouched. Output is always PNG with alpha.
export async function stripLogoBackground(inputBuf: Buffer, threshold = 225): Promise<Buffer> {
  const { data, info } = await sharp(inputBuf, { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;

  const isNearWhite = (p: number): boolean => {
    const i = p * 4;
    return data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold;
  };

  const visited = new Uint8Array(W * H);
  const stack: number[] = [];

  const seed = (p: number) => {
    if (!visited[p] && isNearWhite(p)) {
      visited[p] = 1;
      stack.push(p);
    }
  };

  // Seed every border pixel that is near-white.
  for (let x = 0; x < W; x++) {
    seed(x);                 // top row
    seed((H - 1) * W + x);   // bottom row
  }
  for (let y = 0; y < H; y++) {
    seed(y * W);             // left column
    seed(y * W + (W - 1));   // right column
  }

  // Flood inward: only near-white pixels CONNECTED to the border go transparent.
  while (stack.length > 0) {
    const p = stack.pop()!;
    data[p * 4 + 3] = 0; // alpha → 0

    const x = p % W;
    if (x > 0) seed(p - 1);
    if (x < W - 1) seed(p + 1);
    if (p >= W) seed(p - W);
    if (p < W * (H - 1)) seed(p + W);
  }

  return sharp(data, {
    raw: { width: W, height: H, channels: 4 },
  })
    .png()
    .toBuffer();
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
    // Opaque logo — logo concepts sit on white OR cream/off-white backgrounds.
    // Flood-fill strip from the edges and keep the result only if it actually
    // produced real transparency (i.e. the background WAS white-ish).
    try {
      const stripped = await stripLogoBackground(resizedLogo);
      if (await hasRealTransparency(stripped)) watermark = stripped;
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
