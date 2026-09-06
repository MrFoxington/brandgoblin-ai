import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentRecoveryBanner from "@/components/PaymentRecoveryBanner";
import VaultShell from "@/components/vault/VaultShell";
import { headers } from "next/headers";
import { grantFreeStudioStarterIfEligible, hashIp } from "@/lib/trial";
import { getEffectivePlan } from "@/lib/access";
import { listUserGalleryJobs, listOfficialLogos } from "@/lib/studio/jobs";
import { buildVault } from "@/lib/vault";
import type { BrandGenerationRow } from "@/types";

// The Vault (Creator Studio Phase B, Sept 2026): the home screen opens on what
// the user made. Latest creation big, everything else in a gallery, one Create
// button, stats in a quiet rail. Data shaping lives in src/lib/vault.ts.

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // One-time free Goblin Studio starter energy for brand-new free users
  // (idempotent + race-proof: guarded by has_received_free_studio_grant).
  const rawIp = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  await grantFreeStudioStarterIfEligible(authData.user.id, {
    email: authData.user.email ?? "",
    emailConfirmedAt: authData.user.email_confirmed_at ?? null,
    ipHash: rawIp ? hashIp(rawIp) : undefined,
  });

  const [{ data: userRow }, { data: generations }, { data: jobRows }, galleryJobs, officialLogos] = await Promise.all([
    supabase.from("users").select("credits, plan, payment_status, is_trial, trial_ends_at").eq("id", authData.user.id).single(),
    supabase
      .from("brand_generations")
      .select("id, input_data, output_data, created_at, favorite, archived")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false }),
    // Trophy Shelf stats: lightweight flags only, capped
    supabase
      .from("studio_jobs")
      .select("image_type, official_logo, status")
      .eq("user_id", authData.user.id)
      .eq("status", "completed")
      .limit(500),
    // The gallery: visible Studio creations, signed in one batch
    listUserGalleryJobs(authData.user.id, 40),
    // Official logos per brand, for the brand cards + hero poster
    listOfficialLogos(authData.user.id),
  ]);

  const rows = (generations ?? []) as BrandGenerationRow[];
  const paymentStatus = userRow?.payment_status ?? "active";

  const jobs = (jobRows ?? []) as { image_type: string; official_logo: boolean }[];
  const badgeStats = {
    brandCount: rows.length,
    completedJobs: jobs.length,
    productArtJobs: jobs.filter((j) => j.image_type === "product_art").length,
    hasOfficialLogo: jobs.some((j) => j.official_logo),
  };

  const { items } = buildVault(rows, galleryJobs, officialLogos);
  const activeRows = rows.filter((r) => !r.archived);
  const brands = activeRows.map((r) => ({ id: r.id, name: r.output_data?.recommendedName || "Untitled brand" }));
  const latestBrand = activeRows[0] ?? rows[0] ?? null;
  const ideaSource = latestBrand
    ? {
        brandName: latestBrand.output_data?.recommendedName || "your brand",
        ideas: latestBrand.output_data?.marketingIdeas?.viralContentIdeas ?? [],
      }
    : null;

  const effectivePlan = getEffectivePlan({
    plan: userRow?.plan ?? "free",
    is_trial: userRow?.is_trial ?? false,
    trial_ends_at: userRow?.trial_ends_at ?? null,
  });
  // Creator Max shows as "max" on the plan card (still Pro access everywhere).
  const displayPlan = userRow?.plan === "max" ? "max" : effectivePlan;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          {paymentStatus === "past_due" && <PaymentRecoveryBanner />}

          <VaultShell
            displayName={(authData.user.user_metadata?.display_name as string | undefined) ?? null}
            plan={displayPlan}
            signupDate={authData.user.created_at}
            items={items}
            brands={brands}
            brandCount={rows.length}
            latestBrandId={latestBrand?.id ?? null}
            ideaSource={ideaSource}
            badgeStats={badgeStats}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
