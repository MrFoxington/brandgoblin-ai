// GET /api/studio/trending-fonts — this month's 🔥 Hot Right Now font list.
// Cheap: the heavy lifting (Claude + validation) happens at most once per
// calendar month; every other call is a single cached-table read.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTrendingFonts } from "@/lib/studio/trending-fonts";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const payload = await getTrendingFonts();
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "private, max-age=3600" },
    });
  } catch (err) {
    console.error("[trending-fonts route] failed:", err);
    return NextResponse.json({ error: "Could not load trending fonts." }, { status: 500 });
  }
}
