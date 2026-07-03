import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { reserveEnergy, refundEnergy } from "@/lib/energy";
import { STUDIO_MODELS, IMAGE_TYPE_SIZES, computeStudioEnergyCost, getPinnedSize } from "@/lib/energy-config";
import { submitImageJob } from "@/lib/studio/provider";
import { paletteToWords } from "@/lib/studio/color-names";
import {
  getUserActiveJobCount,
  createJobRow,
  markJobRunning,
  markJobFailed,
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
  } = body as {
    modelKey: string;
    imageType: string;
    brandId?: string;
    prompt?: string;
    seed?: number;
    stampLogo?: boolean;
  };

  // Per-job official-logo stamp opt-out (defaults to true = stamp when set).
  const stampLogo = clientStampLogo !== false;

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

  // Use the client-cooked prompt directly if provided; fall back to template builder
  let prompt = clientPrompt
    ? clientPrompt.trim().replace(/\0/g, "").slice(0, 2000)
    : "";

  if (!prompt && brandId) {
    const { data: brand } = await adminSb
      .from("brand_generations")
      .select("output_data")
      .eq("id", brandId)
      .eq("user_id", authData.user.id)
      .single();

    if (brand?.output_data) {
      const kit = brand.output_data as { logoPrompt?: string; recommendedName?: string; colorPalette?: Array<{ hex?: string; name?: string }> };
      const baseLogo   = kit.logoPrompt ?? "";
      const brandName  = kit.recommendedName ?? "";
      // Plain color WORDS only — never raw hex (image models print hex as text).
      const colors     = paletteToWords(kit.colorPalette, 3);
      const noJunk     = "Do not render any color codes, hex values, '#' symbols, hashtags, random numbers, or gibberish text.";

      if (imageType === "logo_concept") {
        prompt = `${baseLogo || `Logo concept for ${brandName}`}. Clean icon / symbol mark, professional quality, symbol only — no text, letters, or numbers.${colors ? ` Color palette: ${colors}.` : ""}`;
      } else if (imageType === "social_graphic") {
        prompt = `A branded social media graphic for ${brandName}.${colors ? ` Colors: ${colors}.` : ""} Clean, modern design. Display the brand name spelled exactly "${brandName}" in clean legible typography as the ONLY text. ${noJunk}`;
      } else {
        prompt = `Professional product hero photography for ${brandName}.${colors ? ` Color palette: ${colors}.` : ""} The product packaging clearly shows the brand name spelled exactly "${brandName}" in clean legible typography as the ONLY text. ${noJunk}`;
      }
    }
  }

  if (!prompt) {
    // Fallback generic prompt per image type
    const defaults: Record<ImageType, string> = {
      logo_concept:   "A clean, professional logo concept icon mark for a modern brand.",
      social_graphic: "A bold, eye-catching social media graphic with modern design.",
      product_art:    "Professional product photography with clean background.",
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
      stampLogo,
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
      // Seedream: discourage off-brand palette drift + junk text (hex codes,
      // gibberish, watermarks). FLUX doesn't accept negative_prompt.
      negativePrompt: modelKey === "seedream_v45"
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
