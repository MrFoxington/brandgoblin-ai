// POST /api/admin/showcase-feature — admin-only curation toggle.
// Gated by ADMIN_EMAIL; ownership-enforced so the admin can feature ONLY their
// own jobs (the structural guarantee of the consent rule). Additive.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setJobFeatured } from "@/lib/studio/showcase";

export const runtime = "nodejs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "joepro@hotmail.com";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (authData.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobId, featured } = body as { jobId?: string; featured?: boolean };
  if (!jobId || typeof featured !== "boolean") {
    return NextResponse.json({ error: "jobId and featured (boolean) are required." }, { status: 400 });
  }

  // setJobFeatured enforces user_id === admin.id — features only Fox-owned jobs.
  const ok = await setJobFeatured(jobId, authData.user.id, featured);
  if (!ok) {
    return NextResponse.json({ error: "Job not found or not owned by admin." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, featured });
}
