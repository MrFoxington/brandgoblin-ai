// POST /api/studio/official-logo
// Mark / unmark a completed logo concept as the brand's official logo. Once set,
// generated product art + social graphics get that exact logo stamped on (overlay
// happens server-side in completeJob). Pro-gated, ownership-checked.

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setOfficialLogo } from "@/lib/studio/jobs";

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

  const { jobId, official } = body as { jobId?: string; official?: boolean };
  if (!jobId || typeof official !== "boolean") {
    return NextResponse.json({ error: "jobId and official (boolean) are required." }, { status: 400 });
  }

  // ── Update (ownership + logo-concept validation inside setOfficialLogo) ────
  const ok = await setOfficialLogo(jobId, authData.user.id, official);
  if (!ok) {
    return NextResponse.json(
      { error: "Could not set official logo. Only your own completed logo concepts can be set." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, official });
}
