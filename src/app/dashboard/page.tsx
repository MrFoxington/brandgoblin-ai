import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import DashboardGrid from "@/components/DashboardGrid";
import NixAvatar from "@/components/NixAvatar";
import type { BrandGenerationRow } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const [{ data: userRow }, { data: generations }] = await Promise.all([
    supabase.from("users").select("credits, plan").eq("id", authData.user.id).single(),
    supabase
      .from("brand_generations")
      .select("id, input_data, output_data, created_at, favorite")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = (generations ?? []) as BrandGenerationRow[];
  const credits = userRow?.credits ?? 0;
  const plan = userRow?.plan ?? "free";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <NixAvatar size="lg" glow className="shrink-0 hidden sm:block" />
              <div>
                <div className="mb-2">
                  <span className="badge-purple">✦ Brand Vault</span>
                </div>
                <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                  Hi, I&rsquo;m Nix. 🧙<br className="hidden sm:block" />
                  <span className="gradient-text">What idea are we bringing to life today?</span>
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {rows.length === 0
                    ? "Your brands will live here. Let's create something magical."
                    : `${rows.length} brand${rows.length === 1 ? "" : "s"} created so far. Keep building.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="badge-purple">
                <span className="text-white font-semibold">
                  {plan === "free" ? `${credits} credit${credits === 1 ? "" : "s"} left` : "Unlimited"}
                </span>
                <span className="text-faint">·</span>
                <span className="capitalize">{plan}</span>
              </div>
              <Link href="/generate" className="btn-primary !py-2.5 !px-5 text-sm">
                ✦ Create a Brand
              </Link>
            </div>
          </div>

          {/* Creator Pro banner */}
          {plan === "pro" || plan === "agency" ? (
            <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-purple text-xs">✨ Creator Pro</span>
                </div>
                <p className="font-display font-bold text-white">Your AI Marketing Department</p>
                <p className="text-xs text-muted mt-0.5">
                  Social posts · Blog content · Email campaigns · Ad copy · Content calendars
                </p>
              </div>
              <Link href="/dashboard/creator-pro" className="btn-primary !py-2.5 !px-6 text-sm shrink-0">
                Open Creator Pro →
              </Link>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.1)] px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display font-bold text-white text-sm">Unlock your AI Marketing Department</p>
                <p className="text-xs text-muted mt-0.5">Unlimited content for every channel — $19/month</p>
              </div>
              <Link href="/pricing" className="btn-secondary !py-2 !px-5 text-sm shrink-0">
                ✦ Upgrade to Creator Pro
              </Link>
            </div>
          )}

          {/* Grid */}
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <DashboardGrid rows={rows} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
