import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import DashboardGrid from "@/components/DashboardGrid";
import DailyCreatorDashboard from "@/components/DailyCreatorDashboard";
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
  const plan = userRow?.plan ?? "free";
  const email = authData.user.email ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* Daily Creator Dashboard — greeting, XP, quick actions */}
          <DailyCreatorDashboard
            email={email}
            plan={plan}
            brandCount={rows.length}
            latestBrand={rows[0]}
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
