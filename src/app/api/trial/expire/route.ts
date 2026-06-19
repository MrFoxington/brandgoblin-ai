// Daily sweep — expires stale trials for users who haven't returned.
// Call via cron: GET /api/trial/expire?secret=<CRON_SECRET>

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revokeEnergy } from "@/lib/energy";

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

  // Mark trials as expired
  await supabase
    .from("users")
    .update({ is_trial: false })
    .in("id", ids);

  // Revoke energy for each (idempotent)
  await Promise.all(ids.map((id: string) => revokeEnergy(id)));

  console.log(`[trial/expire] expired ${ids.length} trial(s)`);
  return NextResponse.json({ expired: ids.length });
}
