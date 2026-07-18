import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { listUserJobs, sweepStaleJobs } from "@/lib/studio/jobs";
import { grantFreeStudioStarterIfEligible, hashIp } from "@/lib/trial";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnergyWidget from "@/components/EnergyWidget";
import StudioImageGenerator from "@/components/studio/StudioImageGenerator";
import StudioHero from "@/components/studio/StudioHero";
import type { BrandGenerationRow } from "@/types";

export default async function StudioPage({
  searchParams,
}: {
  searchParams?: { brand?: string };
}) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // One-time free starter energy so any new free user can taste Studio
  // (idempotent + race-proof — guarded by has_received_free_studio_grant).
  const rawIp = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  await grantFreeStudioStarterIfEligible(authData.user.id, {
    email: authData.user.email ?? "",
    emailConfirmedAt: authData.user.email_confirmed_at ?? null,
    ipHash: rawIp ? hashIp(rawIp) : undefined,
  });

  // Studio is open to everyone — Creative Energy is the gate, not the plan.
  // Free users spend their starter/top-up energy; the EnergyWidget surfaces the
  // Upgrade / $19 top-up upsell when they run low or out.

  // Plan check — powers the "Bring your own logo" Pro perk (locked upsell for free)
  const adminSb = createAdminClient();
  const { data: userRow } = await adminSb
    .from("users")
    .select("plan")
    .eq("id", authData.user.id)
    .single();
  const isPro = userRow?.plan === "pro" || userRow?.plan === "agency";

  // Fetch brands for the brand selector
  const { data: brands } = await supabase
    .from("brand_generations")
    .select("id, input_data, output_data")
    .eq("user_id", authData.user.id)
    .eq("archived", false) // archived brands stay out of the Studio picker
    .order("created_at", { ascending: false })
    .limit(20);

  // Sweep stale jobs + fetch recent jobs directly from DB (avoids auth complexity)
  await sweepStaleJobs(authData.user.id);
  const recentJobs = await listUserJobs(authData.user.id, 20);

  const brandRows = (brands ?? []) as Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];

  // Deep link from the brand kit's "Create in Studio" CTA (?brand=<id>).
  // Only honored if the brand actually belongs to this user's list.
  const requestedBrandId = searchParams?.brand;
  const initialBrandId = brandRows.find((b) => b.id === requestedBrandId)?.id;

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

          {/* Badge hero — matches the Labs arrival moment (July 18 2026) */}
          <StudioHero />

          <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Generator */}
            <div className="flex-1 min-w-0">
              <StudioImageGenerator
                brands={brandRows}
                initialJobs={recentJobs}
                isPro={isPro}
                initialBrandId={initialBrandId}
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
