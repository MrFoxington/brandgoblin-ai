// POST /api/studio/upload-photo — upload a real photo for a Thumbnail (July 2026)
// Accepts PNG, JPG, WebP, and HEIC/HEIF (typical iPhone photos) and auto-converts
// to a web-friendly JPG. AI-moderated (Claude vision), stored in studio-assets.
// Returns the storage path; the thumbnail job composites it as the background.
// No energy charge — the compose step is billed when the thumbnail is created.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BYTES = 12 * 1024 * 1024; // 12MB (phone photos run large)

async function moderateImage(jpegBuf: Buffer): Promise<boolean> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 10,
    system:
      "You are a strict content moderator for a brand-design app where users upload a photo of themselves for a video thumbnail. " +
      "Reply with exactly one word: SAFE or UNSAFE. " +
      "UNSAFE if the image contains: nudity or sexual content, minors in any inappropriate context, " +
      "graphic violence or gore, hate symbols or extremist imagery, or illegal activity. " +
      "Ordinary photos of people, places, products, and scenes are SAFE.",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpegBuf.toString("base64") } },
          { type: "text", text: "Moderate this uploaded photo." },
        ],
      },
    ],
  });
  const verdict = message.content[0]?.type === "text" ? message.content[0].text.trim().toUpperCase() : "";
  return verdict.startsWith("SAFE");
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A photo file is required." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo must be 12MB or smaller." }, { status: 413 });
  }

  const inputBuf = Buffer.from(await file.arrayBuffer());

  // Auto-convert anything (incl. HEIC/HEIF) to a clean JPG. If the format can't
  // be decoded, fail gently — never lecture the user about formats.
  let jpeg: Buffer;
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(inputBuf, { failOn: "none" }).metadata();
    if (!meta.width || !meta.height) throw new Error("no dimensions");
    // Cap the long edge so downstream compositing stays fast.
    jpeg = await sharp(inputBuf, { failOn: "none" })
      .rotate() // honor EXIF orientation from phone cameras
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "We couldn't read that photo. A PNG or JPG usually works best." },
      { status: 422 }
    );
  }

  // AI moderation (fail-closed).
  try {
    const safe = await moderateImage(jpeg);
    if (!safe) {
      return NextResponse.json({ error: "This photo can't be used. Please try a different one." }, { status: 422 });
    }
  } catch (err) {
    console.error("[studio/upload-photo] moderation failed:", err);
    return NextResponse.json({ error: "Couldn't verify the photo right now. Please try again." }, { status: 502 });
  }

  // Store under the user's namespace so the compose step can verify ownership.
  const adminSb = createAdminClient();
  const storagePath = `${authData.user.id}/thumb-src/${crypto.randomUUID()}.jpg`;
  const { error } = await adminSb.storage
    .from("studio-assets")
    .upload(storagePath, jpeg, { contentType: "image/jpeg", upsert: true });

  if (error) {
    console.error("[studio/upload-photo] storage failed:", error);
    return NextResponse.json({ error: "Failed to store your photo. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ storagePath });
}
