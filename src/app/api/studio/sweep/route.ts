// Stale-job sweeper — refunds energy for jobs stuck in 'running' > 10 minutes.
// Called server-side on Studio page load. Can also be wired to a Vercel Cron
// (add crons: [{path: "/api/studio/sweep", schedule: "*/5 * * * *"}] to vercel.json).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sweepStaleJobs } from "@/lib/studio/jobs";

export async function POST(request: Request) {
  // Allow both auth'd user scope (sweep only their jobs) and internal calls
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const userId = authData.user?.id ?? searchParams.get("userId") ?? undefined;

  const swept = await sweepStaleJobs(userId);
  return NextResponse.json({ swept });
}

export async function GET(request: Request) {
  // Allow GET for Vercel Cron (no auth — sweeps all stale jobs globally)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const swept = await sweepStaleJobs();
  return NextResponse.json({ swept });
}
