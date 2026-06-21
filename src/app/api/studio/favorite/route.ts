// POST /api/studio/favorite
// Toggle the favorite flag on a Studio job. Pro-gated, ownership-checked.
// Additive — no energy/Stripe/trial/generation logic touched.

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setJobFavorite } from "@/lib/studio/jobs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // ── Pro gate (paid Pro or agency — same as the rest of Studio) ─────────────
  const adminSb = createAdminClient();
  const { data: userRow } = await adminSb
    .from("users")
    .select("plan")
    .eq("id", authData.user.id)
    .single();

  if (!userRow || (userRow.plan !== "pro" && userRow.plan !== "agency")) {
    return NextResponse.json({ error: "Creator Pro required." }, { status: 403 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobId, favorite } = body as { jobId?: string; favorite?: boolean };
  if (!jobId || typeof favorite !== "boolean") {
    return NextResponse.json({ error: "jobId and favorite (boolean) are required." }, { status: 400 });
  }

  // ── Update (ownership enforced inside setJobFavorite via user_id match) ────
  const ok = await setJobFavorite(jobId, authData.user.id, favorite);
  if (!ok) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, favorite });
}
