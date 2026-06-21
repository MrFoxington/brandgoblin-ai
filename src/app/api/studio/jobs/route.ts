import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { reserveEnergy, refundEnergy } from "@/lib/energy";
import { STUDIO_MODELS, IMAGE_TYPE_SIZES, computeStudioEnergyCost, getPinnedSize } from "@/lib/energy-config";
import { submitImageJob } from "@/lib/studio/provider";
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
  const { data: userRow } = await adminSb
    .from("users")
    .select("plan, is_trial")
    .eq("id", authData.user.id)
    .single();

  // Studio is PAID Pro only — trial users are explicitly excluded even though
  // getEffectivePlan() would count them as Pro (trial energy grant must not fund media).
  if (!userRow || userRow.plan !== "pro") {
    const isTrial = userRow?.is_trial ?? false;
    return NextResponse.json(
      {
        error: isTrial
          ? "Goblin Studio is available on Creator Pro. Upgrade to unlock image generation."
          : "Creator Pro subscription required to use Goblin Studio.",
        requiresUpgrade: true,
        isTrial,
      },
      { status: 403 }
    );
  }

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
    customPrompt,
  } = body as {
    modelKey: string;
    imageType: string;
    brandId?: string;
    customPrompt?: string;
  };

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

  // Build the prompt — use the brand kit's logoPrompt if available, else customPrompt
  let prompt = customPrompt ?? "";
  if (brandId) {
    const { data: brand } = await adminSb
      .from("brand_generations")
      .select("output_data")
      .eq("id", brandId)
      .eq("user_id", authData.user.id)
      .single();

    if (brand?.output_data) {
      const kit = brand.output_data as { logoPrompt?: string; recommendedName?: string; colorPalette?: Array<{ hex: string }> };
      const baseLogo   = kit.logoPrompt ?? "";
      const brandName  = kit.recommendedName ?? "";
      const palette    = kit.colorPalette?.slice(0, 3).map((c) => c.hex).join(", ") ?? "";

      if (imageType === "logo_concept") {
        prompt = `${baseLogo}${brandName ? `, brand name: ${brandName}` : ""}${palette ? `, color palette: ${palette}` : ""}. Clean logo concept, icon mark, professional quality.`;
      } else if (imageType === "social_graphic") {
        prompt = `A branded social media graphic for ${brandName}. ${palette ? `Use colors: ${palette}.` : ""} Clean, modern design for social media post.`;
      } else {
        prompt = `Product photography for ${brandName}. ${palette ? `Color palette: ${palette}.` : ""} Professional brand imagery.`;
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
      modelKey:   modelKey as StudioModelKey,
      imageType:  imageType as ImageType,
      prompt,
      width:      pinnedSize.width,
      height:     pinnedSize.height,
      webhookUrl,
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
