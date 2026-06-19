// Email confirmation handler for Supabase SSR.
// Supabase sends the user here after they click the confirmation link in their inbox.
// Reads token_hash + type, verifies the OTP, then redirects to the intended destination.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type") as EmailOtpType | null;
  const next       = searchParams.get("next") ?? "/dashboard";

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    console.error("[auth/confirm] verifyOtp failed:", error.message);
    return NextResponse.redirect(
      new URL(`/login?error=confirmation_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // Verification succeeded — redirect to intended destination (default: /dashboard)
  return NextResponse.redirect(new URL(next, request.url));
}
