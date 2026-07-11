// POST /api/studio/archive
// Toggle the archived (hidden) flag on a Studio job. Ownership-checked.
// Soft-hide only — nothing is ever deleted; the Hidden tab can restore.
// Mirrors /api/studio/favorite. (July 11 2026)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setJobArchived } from "@/lib/studio/jobs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // NOTE: intentionally NOT Pro-gated — free users hold starter-energy
  // creations too and deserve to hide their duds.

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobId, archived } = body as { jobId?: string; archived?: boolean };
  if (!jobId || typeof archived !== "boolean") {
    return NextResponse.json({ error: "jobId and archived (boolean) are required." }, { status: 400 });
  }

  // ── Update (ownership enforced inside setJobArchived via user_id match) ────
  const ok = await setJobArchived(jobId, authData.user.id, archived);
  if (!ok) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, archived });
}
