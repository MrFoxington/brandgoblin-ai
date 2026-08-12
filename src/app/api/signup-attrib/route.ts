import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Brand Maturity Prompt 3: record which hero variant a new signup first saw.
// Called fire-and-forget from the signup page right after auth.signUp succeeds.
// The variant is read from the visitor's own first-touch cookie (set in
// middleware), never from the request body, so it cannot be spoofed to an
// arbitrary value. Insert-only, one row per user, service-role only via RLS.

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userId?: unknown };
    const userId = body.userId;
    if (typeof userId !== "string" || !UUID_RE.test(userId)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const heroVariant = request.cookies.get("bg_hero")?.value ?? null;
    const landedAtRaw = request.cookies.get("bg_landed_at")?.value;
    const landedMs = landedAtRaw ? Number(landedAtRaw) : NaN;
    const landedAt = Number.isFinite(landedMs)
      ? new Date(landedMs).toISOString()
      : null;

    const admin = createAdminClient();
    await admin.from("signup_events").upsert(
      { user_id: userId, hero_variant: heroVariant, landed_at: landedAt },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
