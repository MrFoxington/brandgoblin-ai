// Goblin Studio — provider abstraction layer
// Routes image jobs to fal.ai (primary) or Replicate (fallback).
// All provider-specific logic stays here; callers never import fal or replicate directly.

import { fal } from "@fal-ai/client";
import Replicate from "replicate";
import { STUDIO_MODELS } from "./models";
import type { StudioModelKey, ImageType } from "./models";

// fal reads FAL_KEY from the environment automatically; be explicit for safety
if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

export interface SubmitJobParams {
  modelKey: StudioModelKey;
  imageType: ImageType;
  prompt: string;
  width: number;
  height: number;
  webhookUrl: string;
}

export interface SubmitJobResult {
  requestId: string;
  provider: "fal" | "replicate";
}

export interface PollResult {
  status: "pending" | "running" | "completed" | "failed";
  imageUrl?: string;
  hasNsfw?: boolean;
}

export interface FalOutput {
  images?: Array<{ url: string; width: number; height: number; content_type?: string }>;
  has_nsfw_concepts?: boolean[];
}

// ── Submit a generation job ─────────────────────────────────────────────────

export async function submitImageJob(params: SubmitJobParams): Promise<SubmitJobResult> {
  const model = STUDIO_MODELS[params.modelKey];

  // Try fal first
  if (process.env.FAL_KEY) {
    try {
      const input: Record<string, unknown> = {
        prompt: params.prompt,
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: model.enableSafetyChecker,
        output_format: "jpeg",
      };

      // Most fal image models accept image_size as preset OR {width, height}
      // Use the pinned {width, height} so cost is always tied to confirmed dimensions
      if (params.modelKey === "flux_schnell" || params.modelKey === "flux_pro_v1") {
        input.image_size = { width: params.width, height: params.height };
      } else {
        // Seedream and others use width/height directly
        input.width  = params.width;
        input.height = params.height;
      }

      const { request_id } = await fal.queue.submit(model.falEndpoint, {
        input,
        webhookUrl: params.webhookUrl,
      });

      return { requestId: request_id, provider: "fal" };
    } catch (falErr) {
      console.error("[studio/provider] fal submit failed, trying Replicate:", falErr);
    }
  }

  // Replicate fallback (only for models that have a replicateModel configured)
  if (process.env.REPLICATE_API_TOKEN && model.replicateModel) {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const prediction = await replicate.predictions.create({
      model: model.replicateModel as `${string}/${string}`,
      input: {
        prompt: params.prompt,
        width: params.width,
        height: params.height,
        num_outputs: 1,
        output_format: "webp",
      },
    });
    return { requestId: prediction.id, provider: "replicate" };
  }

  throw new Error("No generation provider is configured (missing FAL_KEY and REPLICATE_API_TOKEN)");
}

// ── Poll fal job status ─────────────────────────────────────────────────────

export async function pollFalJob(
  modelKey: StudioModelKey,
  requestId: string
): Promise<PollResult> {
  const model = STUDIO_MODELS[modelKey];
  try {
    const status = await fal.queue.status(model.falEndpoint, {
      requestId,
      logs: false,
    });

    if (status.status === "COMPLETED") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (fal.queue as any).result(model.falEndpoint, { requestId }) as { data?: FalOutput };
      const imageUrl = result.data?.images?.[0]?.url;
      const hasNsfw  = result.data?.has_nsfw_concepts?.[0] ?? false;
      return { status: "completed", imageUrl, hasNsfw };
    }

    // IN_QUEUE or IN_PROGRESS — fal doesn't have a "FAILED" queue status;
    // failures surface as exceptions caught below.
    return { status: "running" };
  } catch (err) {
    console.error("[studio/provider] pollFalJob error:", err);
    return { status: "failed" };
  }
}

// ── Poll Replicate job status ───────────────────────────────────────────────

export async function pollReplicateJob(requestId: string): Promise<PollResult> {
  if (!process.env.REPLICATE_API_TOKEN) return { status: "failed" };

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  try {
    const prediction = await replicate.predictions.get(requestId);
    if (prediction.status === "succeeded") {
      const urls = prediction.output as string[] | string | null;
      const imageUrl = Array.isArray(urls) ? urls[0] : (urls ?? undefined);
      return { status: "completed", imageUrl, hasNsfw: false };
    }
    if (prediction.status === "failed" || prediction.status === "canceled") {
      return { status: "failed" };
    }
    return { status: "running" };
  } catch (err) {
    console.error("[studio/provider] pollReplicateJob error:", err);
    return { status: "failed" };
  }
}

// ── Parse a fal webhook payload ─────────────────────────────────────────────
// fal POSTs the same shape as fal.queue.result() — extract image URL + nsfw flag.

export function parseFalWebhook(body: unknown): PollResult {
  const b = body as Record<string, unknown>;

  // fal webhook format: { request_id, status, output/payload: { images, has_nsfw_concepts } }
  const output =
    (b.output  as FalOutput | undefined) ??
    (b.payload as FalOutput | undefined) ??
    (b         as FalOutput);

  const imageUrl = output?.images?.[0]?.url;
  const hasNsfw  = output?.has_nsfw_concepts?.[0] ?? false;

  if (b.status === "OK" || b.status === "COMPLETED" || imageUrl) {
    return { status: "completed", imageUrl, hasNsfw };
  }

  return { status: "failed" };
}

// ── Download an asset from a provider URL into a Buffer ────────────────────

export async function downloadAsset(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Asset download failed: ${res.status} ${res.statusText}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
