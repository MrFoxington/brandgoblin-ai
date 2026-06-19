import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import DashboardGrid from "@/components/DashboardGrid";
import DailyCreatorDashboard from "@/components/DailyCreatorDashboard";
import PaymentRecoveryBanner from "@/components/PaymentRecoveryBanner";
import TrialCountdownBanner from "@/components/TrialCountdownBanner";
import TrialEndScreen from "@/components/TrialEndScreen";
import { startTrialIfEligible } from "@/lib/trial";
import { getEffectivePlan, isTrialing, trialDaysLeft, trialExpired } from "@/lib/access";
import type { BrandGenerationRow } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // Start 7-day trial for brand-new users (idempotent — guarded by has_used_trial)
  await startTrialIfEligible(authData.user.id);

  const [{ data: userRow }, { data: generations }] = await Promise.all([
    supabase.from("users").select("credits, plan, payment_status, is_trial, trial_ends_at, has_used_trial").eq("id", authData.user.id).single(),
    supabase
      .from("brand_generations")
      .select("id, input_data, output_data, created_at, favorite")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const rows = (generations ?? []) as BrandGenerationRow[];
  const email = authData.user.email ?? "";
  const paymentStatus = userRow?.payment_status ?? "active";

  const userAccess = {
    plan: userRow?.plan ?? "free",
    is_trial: userRow?.is_trial ?? false,
    trial_ends_at: userRow?.trial_ends_at ?? null,
    has_used_trial: userRow?.has_used_trial ?? false,
  };
  const effectivePlan = getEffectivePlan(userAccess);
  const trialing = isTrialing(userAccess);
  const daysLeft = trialDaysLeft(userAccess);
  const trialDone = trialExpired(userAccess);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* Recovery banner — shows only on past_due */}
          {paymentStatus === "past_due" && <PaymentRecoveryBanner />}

          {/* Trial countdown — shows while trialing */}
          {trialing && <TrialCountdownBanner daysLeft={daysLeft} trialEndsAt={userAccess.trial_ends_at!} />}

          {/* Trial-end upgrade screen — shown after trial expires */}
          {trialDone && <TrialEndScreen brandCount={rows.length} />}

          {/* Daily Creator Dashboard — greeting, XP, quick actions */}
          <DailyCreatorDashboard
            email={email}
            plan={effectivePlan}
            brandCount={rows.length}
            latestBrand={rows[0]}
            signupDate={authData.user.created_at}
          />

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
