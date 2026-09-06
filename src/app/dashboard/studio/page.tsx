import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { listUserJobs, sweepStaleJobs, getJob, getSignedUrl } from "@/lib/studio/jobs";
import { grantFreeStudioStarterIfEligible, hashIp } from "@/lib/trial";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import StudioImageGenerator from "@/components/studio/StudioImageGenerator";
import type { BrandGenerationRow } from "@/types";
import { hasProAccess } from "@/lib/access";
import { getMaxConcurrentJobs, IMAGE_TYPE_SIZES, type ImageType } from "@/lib/energy-config";

export default async function StudioPage({
  searchParams,
}: {
  searchParams?: { brand?: string; type?: string; job?: string };
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
  const isPro = hasProAccess(userRow?.plan);
  // Creator Max runs up to 4 Studio jobs at once (Pro/Free: 2). Sept 2026.
  const maxConcurrentJobs = getMaxConcurrentJobs(userRow?.plan);

  // Fetch brands for the brand selector
  const { data: brands } = await supabase
    .from("brand_generations")
    .select("id, input_data, output_data")
    .eq("user_id", authData.user.id)
    .eq("archived", false) // archived brands stay out of the Studio picker
    .order("created_at", { ascending: false })
    .limit(20);

  // Sweep stale jobs + fetch recent jobs directly from DB (avoids auth complexity).
  // Phase C: the Studio gallery holds every asset, so load a deeper window.
  await sweepStaleJobs(authData.user.id);
  const recentJobs = await listUserJobs(authData.user.id, 60);

  const brandRows = (brands ?? []) as Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];

  // Deep link from a Vault card (?job=<id>): open that creation on the canvas.
  // If it is older than the loaded window, fetch it on its own and add it.
  const requestedJobId = searchParams?.job;
  let initialJobId: string | undefined;
  if (requestedJobId) {
    const inWindow = recentJobs.find((j) => j.id === requestedJobId);
    if (inWindow) {
      initialJobId = inWindow.id;
    } else {
      const extra = await getJob(requestedJobId, authData.user.id);
      if (extra && extra.status === "completed" && extra.storage_path) {
        try { extra.output_url = await getSignedUrl(extra.storage_path); } catch { /* card shows nothing */ }
        recentJobs.push(extra);
        initialJobId = extra.id;
      }
    }
  }

  // Deep link from the brand kit's "Create in Studio" CTA (?brand=<id>).
  // Only honored if the brand actually belongs to this user's list. A ?job=
  // link without a brand follows the creation's brand.
  const initialJob = initialJobId ? recentJobs.find((j) => j.id === initialJobId) : undefined;
  const initialBrandId =
    initialJob && !initialJob.brand_id && !searchParams?.brand
      ? "" // freeform creation: "" survives the client's `??` fallback to brands[0]
      : brandRows.find((b) => b.id === (searchParams?.brand ?? initialJob?.brand_id ?? undefined))?.id;
  // Deep link from the Vault's Create chooser (?type=youtube_thumbnail).
  const requestedType = searchParams?.type;
  const initialImageType =
    requestedType && requestedType in IMAGE_TYPE_SIZES ? (requestedType as ImageType) : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">

          {/* Compact header: the badge, the name, the way back */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/badges/goblin-studio-badge.png"
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
                priority
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Goblin Studio</p>
                <h1 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">Bring your brand to life</h1>
              </div>
            </div>
            <Link href="/dashboard" className="shrink-0 text-sm text-muted transition-colors hover:text-white">
              ← Vault
            </Link>
          </div>

          <StudioImageGenerator
            brands={brandRows}
            initialJobs={recentJobs}
            isPro={isPro}
            maxConcurrentJobs={maxConcurrentJobs}
            initialBrandId={initialBrandId}
            initialImageType={initialImageType}
            initialJobId={initialJobId}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
