import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import DashboardGrid from "@/components/DashboardGrid";
import DailyCreatorDashboard from "@/components/DailyCreatorDashboard";
import PaymentRecoveryBanner from "@/components/PaymentRecoveryBanner";
import { headers } from "next/headers";
import { grantFreeStudioStarterIfEligible, hashIp } from "@/lib/trial";
import { getEffectivePlan } from "@/lib/access";
import StudioFavoritesSection from "@/components/studio/StudioFavoritesSection";
import { listUserFavoriteJobs } from "@/lib/studio/jobs";
import type { BrandGenerationRow } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // One-time free Goblin Studio starter energy for brand-new free users
  // (idempotent + race-proof — guarded by has_received_free_studio_grant).
  const rawIp = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  await grantFreeStudioStarterIfEligible(authData.user.id, {
    email: authData.user.email ?? "",
    emailConfirmedAt: authData.user.email_confirmed_at ?? null,
    ipHash: rawIp ? hashIp(rawIp) : undefined,
  });

  const [{ data: userRow }, { data: generations }] = await Promise.all([
    supabase.from("users").select("credits, plan, payment_status, is_trial, trial_ends_at").eq("id", authData.user.id).single(),
    supabase
      .from("brand_generations")
      .select("id, input_data, output_data, created_at, favorite, archived")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = (generations ?? []) as BrandGenerationRow[];
  const email = authData.user.email ?? "";
  const paymentStatus = userRow?.payment_status ?? "active";

  // Studio favorites — anyone can now create in Studio (free starter energy),
  // so surface favorites for all users; the query returns [] when there are none.
  const studioFavorites = (await listUserFavoriteJobs(authData.user.id, 6)).map((j) => ({
    id: j.id,
    output_url: j.output_url,
    image_type: j.image_type,
  }));

  const effectivePlan = getEffectivePlan({
    plan: userRow?.plan ?? "free",
    is_trial: userRow?.is_trial ?? false,
    trial_ends_at: userRow?.trial_ends_at ?? null,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* Recovery banner — shows only on past_due */}
          {paymentStatus === "past_due" && <PaymentRecoveryBanner />}

          {/* Daily Creator Dashboard — greeting, XP, quick actions */}
          <DailyCreatorDashboard
            email={email}
            displayName={(authData.user.user_metadata?.display_name as string | undefined) ?? null}
            plan={effectivePlan}
            brandCount={rows.length}
            latestBrand={rows[0]}
            signupDate={authData.user.created_at}
          />

          {/* Studio Favorites — treasure stash (hidden if none) */}
          <StudioFavoritesSection favorites={studioFavorites} />

          {/* Brand Vault grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-black text-white">Your Brand Vault</h2>
              <p className="text-xs text-faint">
                {rows.length === 0
                  ? "No brands yet"
                  : `${rows.length} brand${rows.length === 1 ? "" : "s"}`}
              </p>
            </div>
            {rows.length === 0 ? <EmptyState /> : <DashboardGrid rows={rows} />}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
