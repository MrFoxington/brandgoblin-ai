import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/access";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreatorProHub from "@/components/CreatorProHub";
import EnergyWidget from "@/components/EnergyWidget";
import RefillSuccessBanner from "@/components/RefillSuccessBanner";
import Link from "next/link";
import type { BrandGenerationRow, CreatorContentRow } from "@/types";

export default async function CreatorProPage({
  searchParams,
}: {
  searchParams: { refill?: string };
}) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const [{ data: userRow }, { data: brands }, { data: recentContent }] = await Promise.all([
    supabase.from("users").select("plan, is_trial, trial_ends_at").eq("id", authData.user.id).single(),
    supabase
      .from("brand_generations")
      .select("id, input_data, output_data")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("creator_content")
      .select("id, user_id, brand_id, content_type, title, content, created_at")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const plan = getEffectivePlan({
    plan: userRow?.plan ?? "free",
    is_trial: userRow?.is_trial ?? false,
    trial_ends_at: userRow?.trial_ends_at ?? null,
  });

  // Gate: free users see upgrade prompt
  if (plan === "free") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="bg-card w-full max-w-md rounded-2xl border border-primary/20 p-10 text-center">
            <span className="text-5xl block mb-4">✨</span>
            <h1 className="font-display text-2xl font-extrabold text-white mb-2">
              Creator Pro
            </h1>
            <p className="text-sm font-semibold text-secondary mb-4">Your AI Marketing Department</p>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Unlock unlimited social posts, blog content, email campaigns, ad copy, content calendars, and more — all tailored to your brand.
            </p>
            <div className="space-y-2 text-left mb-8">
              {["Unlimited copywriter", "Unlimited social media manager", "Unlimited content strategist", "Unlimited marketing ideas"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-secondary shrink-0">✓</span>{f}
                </div>
              ))}
            </div>
            <Link href="/pricing" className="btn-primary w-full py-3 block text-center mb-3">
              ✦ Upgrade to Creator Pro — $19/mo
            </Link>
            <Link href="/dashboard" className="text-sm text-muted hover:text-white transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const brandRows = (brands ?? []) as Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];
  const contentRows = (recentContent ?? []) as CreatorContentRow[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">

          {/* Back nav */}
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
          >
            ← Back to Brand Vault
          </Link>

          {searchParams.refill === "success" && <RefillSuccessBanner />}

          <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Main content area */}
            <div className="flex-1 min-w-0">
              {brandRows.length === 0 ? (
                <div className="text-center py-24">
                  <span className="text-4xl block mb-4">🧌</span>
                  <h2 className="font-display text-xl font-bold text-white mb-2">Generate a brand first</h2>
                  <p className="text-sm text-muted mb-6">Creator Pro needs at least one saved brand to generate content for.</p>
                  <Link href="/generate" className="btn-primary px-8 py-3">
                    ✦ Create Your First Brand
                  </Link>
                </div>
              ) : (
                <CreatorProHub brands={brandRows} recentContent={contentRows} />
              )}
            </div>

            {/* Energy sidebar */}
            <div className="w-full xl:w-72 shrink-0">
              <EnergyWidget />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
