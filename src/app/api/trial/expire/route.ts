// Daily sweep — clears the stale legacy trial flag for the mid-transition cohort.
// Freemium model: energy is NEVER revoked here — free users keep what they have.
// Becomes a no-op once all legacy trials have aged out.
// Call via cron: GET /api/trial/expire?secret=<CRON_SECRET>

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find all expired active trials
  const { data: expiredUsers, error } = await supabase
    .from("users")
    .select("id")
    .eq("is_trial", true)
    .eq("plan", "free")
    .lt("trial_ends_at", new Date().toISOString());

  if (error) {
    console.error("[trial/expire] query error:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!expiredUsers?.length) {
    return NextResponse.json({ expired: 0 });
  }

  const ids = expiredUsers.map((u: { id: string }) => u.id);

  // Clear the stale trial flag only — energy is preserved (freemium model).
  await supabase
    .from("users")
    .update({ is_trial: false })
    .in("id", ids);

  console.log(`[trial/expire] cleared ${ids.length} stale trial flag(s)`);
  return NextResponse.json({ expired: ids.length });
}
