import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { reserveEnergy, refundEnergy } from "@/lib/energy";
import { STUDIO_MODELS, IMAGE_TYPE_SIZES, computeStudioEnergyCost, getPinnedSize } from "@/lib/energy-config";
import { submitImageJob } from "@/lib/studio/provider";
import { paletteToWords } from "@/lib/studio/color-names";
import { buildFontPromptClause, normalizeTypography, resolveTypography, nearestWeight } from "@/lib/studio/fonts";
import { buildThumbnailScenePrompt, pickAccentColor } from "@/lib/studio/thumbnail";
import type { ThumbnailOverlaySpec } from "@/lib/studio/thumbnail";
import type { BrandTypography } from "@/types";
import {
  getUserActiveJobCount,
  createJobRow,
  markJobRunning,
  markJobFailed,
  completeJob,
  listUserJobs,
} from "@/lib/studio/jobs";
import type { StudioModelKey, ImageType } from "@/lib/studio/models";

const MAX_CONCURRENT_JOBS = 2;

// ── POST /api/studio/jobs — create a generation job ─────────────────────────
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const adminSb = createAdminClient();

  // Studio is open to ANYONE with Creative Energy — paid Pro (monthly) or free
  // (one-time starter / top-ups). The atomic reserveEnergy() call below is the
  // real gate: it returns a 402 upsell when the balance can't cover the cost.

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    modelKey,
    imageType,
    brandId,
    prompt: clientPrompt,
    seed: clientSeed,
    stampLogo: clientStampLogo,
    showBrandName: clientShowBrandName,
    productLabelName: clientProductLabelName,
    typography: clientTypography,
  } = body as {
    modelKey: string;
    imageType: string;
    brandId?: string;
    prompt?: string;
    seed?: number;
    stampLogo?: boolean;
    showBrandName?: boolean;
    productLabelName?: string;
    typography?: Partial<BrandTypography>;
  };

  // Per-job official-logo stamp opt-out (defaults to true = stamp when set).
  const stampLogo = clientStampLogo !== false;

  // Brand name painted into the art is OPT-IN (July 11 2026 — default is a
  // clean, text-free image; the official-logo stamp handles branding).
  const showBrandName = clientShowBrandName === true;

  // Optional product-line name (July 17 2026) — only used when the brand name
  // is ON; rendered as the product name on the label, under the brand name.
  const productLabelName =
    showBrandName && typeof clientProductLabelName === "string"
      ? clientProductLabelName.trim().replace(/\0/g, "").slice(0, 60)
      : "";

  // Validate seed if provided: must be a safe positive integer
  const seed = (typeof clientSeed === "number" && Number.isInteger(clientSeed) && clientSeed >= 0 && clientSeed <= 2147483647)
    ? clientSeed
    : undefined;

  // Validate model is in the green-lit registry
  if (!modelKey || !(modelKey in STUDIO_MODELS)) {
    return NextResponse.json(
      { error: `Unknown model: ${modelKey}. Only registry models may be used.` },
      { status: 400 }
    );
  }

  // Validate image type and get pinned dimensions (server-side enforcement)
  if (!imageType || !(imageType in IMAGE_TYPE_SIZES)) {
    return NextResponse.json(
      { error: `Unknown imageType: ${imageType}.` },
      { status: 400 }
    );
  }

  const model = STUDIO_MODELS[modelKey as StudioModelKey];
  // Only Phase-1 image models are buildable; reject video model keys
  if (model.defaultFor === "video") {
    return NextResponse.json(
      { error: "Video generation is not available yet." },
      { status: 400 }
    );
  }

  const pinnedSize = getPinnedSize(imageType as ImageType);
  const energyCost = computeStudioEnergyCost(modelKey as StudioModelKey, {
    width: pinnedSize.width,
    height: pinnedSize.height,
  });

  // Per-user concurrency guard — fal account limit is 10; we cap at 2 per user
  const activeCount = await getUserActiveJobCount(authData.user.id);
  if (activeCount >= MAX_CONCURRENT_JOBS) {
    return NextResponse.json(
      { error: "You already have active generations running. Wait for one to finish before starting another." },
      { status: 429 }
    );
  }

  // ── Thumbnail makers (July 2026) ──────────────────────────────────────────
  // Thumbnails generate a text-free background, then the completion step draws
  // the title + accent word + logo in the brand font (overlay_spec). The
  // "real photo" mode skips AI generation and composes over the uploaded photo.
  const isThumbnail = imageType === "youtube_thumbnail" || imageType === "short_cover";
  let overlaySpecToStore: ThumbnailOverlaySpec | undefined;
  let thumbnailScenePrompt = "";

  if (isThumbnail) {
    const t = body as {
      title?: string; accentWord?: string; subtitle?: string;
      videoAbout?: string; oneThing?: string;
      peopleMode?: string; styleNote?: string;
      logoHidden?: boolean; logoPosition?: string; photoStoragePath?: string;
      textColor?: string; accentColor?: string;
    };
    const title = (t.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Add a title for your thumbnail." }, { status: 400 });
    }
    const format: "youtube" | "short" = imageType === "youtube_thumbnail" ? "youtube" : "short";
    const peopleMode: "none" | "silhouette" | "real_photo" =
      t.peopleMode === "silhouette" || t.peopleMode === "real_photo" ? t.peopleMode : "none";

    // Pull the brand's palette + saved fonts (auto-applied, no retyping).
    let palette: Array<{ hex?: string; name?: string }> | undefined;
    let brandTypography: BrandTypography | undefined;
    if (brandId) {
      const { data: b } = await adminSb
        .from("brand_generations").select("output_data")
        .eq("id", brandId).eq("user_id", authData.user.id).single();
      const kit = b?.output_data as
        | { colorPalette?: Array<{ hex?: string; name?: string }>; typography?: BrandTypography }
        | undefined;
      palette = kit?.colorPalette;
      brandTypography = kit?.typography;
    }
    const typo = resolveTypography({ ...(brandTypography ?? {}), ...normalizeTypography(clientTypography) });
    const allowedPos = new Set(["bottom-left", "bottom-right", "top-left", "top-right"]);
    const logoPosition = (typeof t.logoPosition === "string" && allowedPos.has(t.logoPosition)
      ? t.logoPosition
      : "bottom-left") as ThumbnailOverlaySpec["logoPosition"];

    // Optional user-chosen title + accent colors (hex). Fall back to a light
    // title and the auto-picked brand accent.
    const hexRe = /^#[0-9a-fA-F]{6}$/;
    const textColor = typeof t.textColor === "string" && hexRe.test(t.textColor) ? t.textColor : "#F7F5EF";
    const accentColor = typeof t.accentColor === "string" && hexRe.test(t.accentColor) ? t.accentColor : pickAccentColor(palette);

    overlaySpecToStore = {
      format,
      title: title.slice(0, 120),
      accentWord: (t.accentWord ?? "").trim().slice(0, 40) || undefined,
      subtitle: (t.subtitle ?? "").trim().slice(0, 120) || undefined,
      headlineFont: typo.headlineFont,
      headlineWeight: nearestWeight(typo.headlineFont, typo.headlineFontWeight),
      uppercase: typo.headlineUppercase,
      bodyFont: typo.bodyFont,
      bodyItalic: typo.bodyItalic,
      textColor,
      accentColor,
      logoShow: t.logoHidden !== true,
      logoPosition,
      scrim: true,
    };

    // An empty scene leaves the model with only "premium abstract focal
    // subject" to chase — which it answers with random 3D geometry. When the
    // user skips "what's the video about", derive the scene from the title
    // (the title IS the topic) and explicitly forbid the abstract default.
    const videoAbout =
      (t.videoAbout ?? "").trim() ||
      `a concrete, recognizable real-world scene that literally depicts the video topic "${title}" — ` +
        `actual subject matter and environment, NOT abstract shapes, NOT geometric objects, NOT a generic gradient backdrop`;

    thumbnailScenePrompt = buildThumbnailScenePrompt({
      videoAbout,
      oneThing: t.oneThing,
      colorWords: paletteToWords(palette, 3),
      styleNote: t.styleNote,
      peopleMode,
      format,
    });

    // Real-photo path: no AI generation — compose the overlay over the photo.
    if (peopleMode === "real_photo") {
      const photoPath = t.photoStoragePath ?? "";
      if (!photoPath.startsWith(`${authData.user.id}/`)) {
        return NextResponse.json({ error: "Please upload your photo first." }, { status: 400 });
      }
      const COMPOSE_ENERGY = 15;
      const res = await reserveEnergy(authData.user.id, COMPOSE_ENERGY);
      if (!res.success) {
        return NextResponse.json(
          { error: "Not enough Creative Energy. Refill to keep creating.", totalRemaining: res.totalRemaining, energyRequired: COMPOSE_ENERGY, requiresRefill: true },
          { status: 402 }
        );
      }
      let composeJobId: string;
      try {
        composeJobId = await createJobRow({
          userId: authData.user.id,
          brandId,
          modelKey: modelKey as StudioModelKey,
          imageType: imageType as ImageType,
          imageSize: pinnedSize.falSize,
          energyReserved: COMPOSE_ENERGY,
          prompt: "Real-photo thumbnail",
          reservationTxId: res.txId!,
          stampLogo: false,
          overlaySpec: overlaySpecToStore,
        });
      } catch (err) {
        await refundEnergy(authData.user.id, COMPOSE_ENERGY, "Studio refund: thumbnail job creation failed");
        console.error("[studio/jobs POST] thumbnail createJobRow failed:", err);
        return NextResponse.json({ error: "Failed to create your thumbnail. Energy has been returned." }, { status: 500 });
      }
      const { data: blob } = await adminSb.storage.from("studio-assets").download(photoPath);
      if (!blob) {
        await markJobFailed(composeJobId, authData.user.id, COMPOSE_ENERGY, "Uploaded photo missing — energy returned", res.txId);
        return NextResponse.json({ error: "We couldn't find your uploaded photo. Please upload it again." }, { status: 404 });
      }
      try {
        const photoBuf = Buffer.from(await blob.arrayBuffer());
        await completeJob({
          jobId: composeJobId,
          userId: authData.user.id,
          buffer: photoBuf,
          mimeType: "image/jpeg",
          modelKey: modelKey as StudioModelKey,
          txId: res.txId ?? null,
          energyReserved: COMPOSE_ENERGY,
        });
      } catch (err) {
        await markJobFailed(composeJobId, authData.user.id, COMPOSE_ENERGY, "Thumbnail compose failed — energy returned", res.txId);
        console.error("[studio/jobs POST] thumbnail compose failed:", err);
        return NextResponse.json({ error: "Couldn't build your thumbnail. Energy has been returned." }, { status: 502 });
      }
      return NextResponse.json({ jobId: composeJobId, imageType, energyReserved: COMPOSE_ENERGY, provider: "compose" });
    }
  }

  // Atomic energy reservation — the only gate before job creation
  const reservation = await reserveEnergy(authData.user.id, energyCost);
  if (!reservation.success) {
    return NextResponse.json(
      {
        error: "Not enough Creative Energy. Refill your energy to keep generating.",
        totalRemaining: reservation.totalRemaining,
        energyRequired: energyCost,
        requiresRefill: true,
      },
      { status: 402 }
    );
  }

  // Use the client-cooked prompt directly if provided; fall back to template builder.
  // Thumbnails use the text-free scene prompt built above.
  let prompt = isThumbnail
    ? thumbnailScenePrompt
    : clientPrompt
    ? clientPrompt.trim().replace(/\0/g, "").slice(0, 2000)
    : "";

  if (!prompt && brandId && !isThumbnail) {
    const { data: brand } = await adminSb
      .from("brand_generations")
      .select("output_data")
      .eq("id", brandId)
      .eq("user_id", authData.user.id)
      .single();

    if (brand?.output_data) {
      const kit = brand.output_data as {
        logoPrompt?: string;
        recommendedName?: string;
        colorPalette?: Array<{ hex?: string; name?: string }>;
        mascot?: { name?: string; appearance?: string; personality?: string; visualDescription?: string; imagePrompt?: string };
        typography?: BrandTypography;
      };
      const baseLogo   = kit.logoPrompt ?? "";
      const brandName  = kit.recommendedName ?? "";
      // Plain color WORDS only — never raw hex (image models print hex as text).
      const colors     = paletteToWords(kit.colorPalette, 3);
      const noJunk     = "Do not render any color codes, hex values, '#' symbols, hashtags, random numbers, or gibberish text.";
      // Saved brand fonts (merged with any per-generation override). Only used on
      // the text-bearing branded branches below.
      const fontClause = buildFontPromptClause({ ...(kit.typography ?? {}), ...normalizeTypography(clientTypography) });

      if (imageType === "logo_concept") {
        prompt = `${baseLogo || `Logo concept for ${brandName}`}. Clean icon / symbol mark, professional quality, symbol only — no text, letters, or numbers.${colors ? ` Color palette: ${colors}.` : ""} Presented on a clean, solid white background.`;
      } else if (imageType === "mascot") {
        const m = kit.mascot;
        const mascotDesc = [m?.imagePrompt || m?.visualDescription || m?.appearance, m?.personality ? `Personality: ${m.personality}.` : ""]
          .filter(Boolean).join(" ");
        prompt = `${mascotDesc || `A friendly brand mascot character for ${brandName}`}. Exactly one full-body mascot character, head to toe, expressive face, dynamic friendly pose, professional animation-studio character design.${colors ? ` Color palette: ${colors}.` : ""} No text, letters, or numbers anywhere. Clean, solid white background. Crisp self-contained silhouette — no smoke, mist, glows, sparkles, particles, or floating props drifting off the character into the background. ${noJunk}`;
      } else if (imageType === "social_graphic") {
        prompt = showBrandName
          ? `A branded social media graphic for ${brandName}.${colors ? ` Colors: ${colors}.` : ""} Clean, modern design. Display the brand name spelled exactly "${brandName}"${productLabelName ? ` and the product name spelled exactly "${productLabelName}"` : ""} in clean legible typography as the ONLY text. "${brandName}" is the only brand name in the image — never invent any other brand, company name, or wordmark. ${noJunk} ${fontClause}`
          : `A bold, modern social media graphic.${colors ? ` Colors: ${colors}.` : ""} Clean, striking design. No text at all — no brand names, letters, words, numbers, logos, or wordmarks; communicate purely through shape, color, and composition. ${noJunk}`;
      } else {
        prompt = showBrandName
          ? `Professional product hero photography for ${brandName}.${colors ? ` Color palette: ${colors}.` : ""} The product packaging clearly shows the brand name spelled exactly "${brandName}"${productLabelName ? ` with the product name spelled exactly "${productLabelName}" beneath it` : ""} in clean legible typography as the ONLY text. "${brandName}" is the only brand name in the image — never invent any other brand, company name, or wordmark on the product, accessories, or background props. ${noJunk} ${fontClause}`
          : `Professional product hero photography. The product is dressed in a bold wordless signature pattern${colors ? ` in the brand palette (${colors})` : ""} — illustrated motifs, abstract shapes, or scenic artwork covering its printable surfaces. Absolutely no text, brand names, letters, numbers, logos, wordmarks, or labels anywhere on the product or scene. ${noJunk}`;
      }
    }
  }

  if (!prompt) {
    // Fallback generic prompt per image type
    const defaults: Partial<Record<ImageType, string>> = {
      logo_concept:   "A clean, professional logo concept icon mark for a modern brand, on a clean solid white background.",
      social_graphic: "A bold, eye-catching social media graphic with modern design.",
      product_art:    "Professional product photography with clean background.",
      mascot:         "One friendly full-body brand mascot character, expressive face, professional animation-studio character design, no text, on a clean solid white background.",
    };
    prompt = defaults[imageType as ImageType] ?? "A professional branded image.";
  }

  // Create the DB row before submitting to fal (so we have a jobId for the webhook URL)
  let jobId: string;
  try {
    jobId = await createJobRow({
      userId:          authData.user.id,
      brandId,
      modelKey:        modelKey as StudioModelKey,
      imageType:       imageType as ImageType,
      imageSize:       pinnedSize.falSize,
      energyReserved:  energyCost,
      prompt,
      reservationTxId: reservation.txId!,
      stampLogo:       isThumbnail ? false : stampLogo,
      overlaySpec:     overlaySpecToStore,
    });
  } catch (err) {
    // No job row exists yet — refund directly; markJobFailed requires a row.
    await refundEnergy(authData.user.id, energyCost, "Studio refund: Job creation failed");
    console.error("[studio/jobs POST] createJobRow failed:", err);
    return NextResponse.json({ error: "Failed to create generation job. Energy has been returned." }, { status: 500 });
  }

  // Webhook URL lets fal notify us on completion (primary path)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const webhookSecret = process.env.FAL_WEBHOOK_SECRET ?? "";
  const webhookUrl = `${appUrl}/api/studio/webhook/fal?jobId=${jobId}&secret=${webhookSecret}`;

  // Recraft accepts the brand's exact palette as API-level color guidance —
  // the palette match no prompt wording can guarantee (July 16 2026, Wow Plan).
  let brandColors: string[] | undefined;
  if (modelKey === "recraft_v3" && brandId) {
    const { data: colorBrand } = await adminSb
      .from("brand_generations")
      .select("output_data")
      .eq("id", brandId)
      .eq("user_id", authData.user.id)
      .single();
    const palette = (colorBrand?.output_data as { colorPalette?: Array<{ hex?: string }> })?.colorPalette;
    brandColors = palette
      ?.map((c) => c.hex)
      .filter((h): h is string => typeof h === "string" && /^#?[0-9a-f]{6}$/i.test(h.trim()))
      .slice(0, 5);
  }

  let providerResult: { requestId: string; provider: "fal" | "replicate" };
  try {
    providerResult = await submitImageJob({
      modelKey:       modelKey as StudioModelKey,
      imageType:      imageType as ImageType,
      prompt,
      width:          pinnedSize.width,
      height:         pinnedSize.height,
      webhookUrl,
      seed,
      brandColors,
      // Recraft raster style per asset (vector styles bill 2x — not enabled)
      recraftStyle: modelKey === "recraft_v3"
        ? (imageType === "product_art" ? "realistic_image" : "digital_illustration")
        : undefined,
      // Discourage off-brand palette drift + junk text on models that accept
      // negative prompts (Seedream, Ideogram). FLUX models don't accept one.
      negativePrompt: modelKey === "seedream_v45" || modelKey === "ideogram_v3"
        ? "wrong colors, off-brand palette, clashing hues, inconsistent style, low quality, blurry, hex color codes, color code text, '#' symbols, hashtags, random numbers, gibberish text, misspelled text, scrambled letters, cut-off text, cropped letters, text extending past the edge, large white banner, solid white panel, watermark, qr code, barcode"
        : undefined,
    });
  } catch (err) {
    await markJobFailed(jobId, authData.user.id, energyCost, "Provider submission failed", reservation.txId);
    console.error("[studio/jobs POST] submitImageJob failed:", err);
    return NextResponse.json({ error: "Generation service unavailable. Energy has been returned." }, { status: 502 });
  }

  await markJobRunning(jobId, providerResult.requestId, providerResult.provider);

  return NextResponse.json({
    jobId,
    modelKey,
    imageType,
    energyReserved: energyCost,
    provider: providerResult.provider,
  });
}

// ── GET /api/studio/jobs — list recent jobs (re-signed URLs) ────────────────
export async function GET() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const jobs = await listUserJobs(authData.user.id);
  return NextResponse.json({ jobs });
}
