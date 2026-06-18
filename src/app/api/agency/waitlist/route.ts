import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("agency_waitlist")
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      // Unique constraint violation — already signed up
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, existing: true });
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/agency/waitlist]", err);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }
}
