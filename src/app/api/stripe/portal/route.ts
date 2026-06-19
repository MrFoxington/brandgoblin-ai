import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", authData.user.id)
    .single();

  if (!userRow?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found." }, { status: 400 });
  }

  const { return_url } = await request.json().catch(() => ({}));
  const returnUrl = return_url ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`;

  const session = await stripe.billingPortal.sessions.create({
    customer: userRow.stripe_customer_id,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: session.url });
}
