import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listUserJobs, sweepStaleJobs } from "@/lib/studio/jobs";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnergyWidget from "@/components/EnergyWidget";
import StudioImageGenerator from "@/components/studio/StudioImageGenerator";
import type { BrandGenerationRow } from "@/types";

export default async function StudioPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("plan, is_trial, trial_ends_at")
    .eq("id", authData.user.id)
    .single();

  // Studio is PAID Pro only — trial users see the upgrade prompt.
  // We do NOT use getEffectivePlan() here because that counts active trials as Pro;
  // trial energy is an unpaid grant and must not fund media generation.
  const isPaidPro = userRow?.plan === "pro" || userRow?.plan === "agency";
  const isTrial   = !!(userRow?.is_trial);

  if (!isPaidPro) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="bg-card w-full max-w-md rounded-2xl border border-primary/20 p-10 text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/nix/conjuring-nix.png"
                alt="Nix conjuring"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white mb-2">
              Goblin Studio
            </h1>
            <p className="text-sm font-semibold text-secondary mb-4">
              ⚡ Images & video, powered by Creative Energy
            </p>

            {isTrial ? (
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Studio is available on Creator Pro. Your free trial gives you unlimited text content
                — upgrade to start generating real images with Nix.
              </p>
            ) : (
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Turn your brand kit into real images. Nix already knows your palette, voice, and
                logo direction — just pick a template and conjure it.
              </p>
            )}

            <div className="space-y-2 text-left mb-8">
              {[
                "Logo concepts from your brand kit",
                "Social graphics in your palette",
                "Product & hero art",
                "⚡ Creative Energy powers every generation",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-secondary shrink-0">✓</span>{f}
                </div>
              ))}
            </div>

            <Link href="/pricing" className="btn-primary w-full py-3 block text-center mb-3">
              ✦ {isTrial ? "Upgrade to Creator Pro" : "Get Creator Pro — $19/mo"}
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

  // Fetch brands for the brand selector
  const { data: brands } = await supabase
    .from("brand_generations")
    .select("id, input_data, output_data")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Sweep stale jobs + fetch recent jobs directly from DB (avoids auth complexity)
  await sweepStaleJobs(authData.user.id);
  const recentJobs = await listUserJobs(authData.user.id, 20);

  const brandRows = (brands ?? []) as Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">

          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
          >
            ← Back to Brand Vault
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-black text-white mb-1">
              🎨 Goblin Studio
            </h1>
            <p className="text-sm text-muted">
              ⚡ Creative Energy powers your images — text content stays unlimited.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Generator */}
            <div className="flex-1 min-w-0">
              <StudioImageGenerator
                brands={brandRows}
                initialJobs={recentJobs}
              />
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
