// GET /api/showcase — PUBLIC, no auth.
// Returns ONLY featured + completed (moderation-passed) creations, and ONLY
// public-safe fields: id, imageUrl (short-lived signed), brandName, imageType.
// No user IDs, emails, prompts, or any private data ever leaves the server.

import { NextResponse } from "next/server";
import { listFeaturedPublic } from "@/lib/studio/showcase";

export const runtime = "nodejs";
// Short server cache so it's fast and doesn't hammer storage signing.
export const revalidate = 120;

export async function GET() {
  try {
    const items = await listFeaturedPublic();
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    // Never leak internals — return an empty wall on error (graceful, not broken).
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
