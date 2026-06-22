// Showcase data layer — public-safe reads + admin curation.
// Privacy: listFeaturedPublic() returns ONLY id / imageUrl / brandName / imageType.
// No user IDs, emails, prompts, or any other private field ever leaves the server.

import { createAdminClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/studio/jobs";
import type { StudioJobRow } from "@/lib/studio/jobs";

// The ONLY shape exposed publicly.
export interface ShowcaseItem {
  id: string;
  imageUrl: string;
  brandName: string;
  imageType: string;
}

const PUBLIC_CAP = 20;
const SIGNED_TTL_SECONDS = 60 * 30; // short-lived (30 min) signed URLs
const FALLBACK_BRAND_NAME = "A BrandGoblin creation";

const IMAGE_TYPE_LABELS: Record<string, string> = {
  logo_concept:   "Logo",
  social_graphic: "Social",
  product_art:    "Product Art",
};

// ── Public: featured + completed (moderation-passed) only ────────────────────
// status='completed' is the moderation guarantee — NSFW images become
// 'moderation_blocked' at webhook time and never store an asset.
interface FeaturedRow {
  id: string;
  brand_id: string | null;
  image_type: string | null;
  storage_path: string | null;
  status: string;
  featured: boolean;
}

export async function listFeaturedPublic(): Promise<ShowcaseItem[]> {
  const supabase = createAdminClient();

  const { data: raw } = await supabase
    .from("studio_jobs")
    .select("id, brand_id, image_type, storage_path, status, featured")
    .eq("featured", true)
    .eq("status", "completed")
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("featured_at", { ascending: false })
    .limit(PUBLIC_CAP);

  const data = (raw ?? []) as FeaturedRow[];
  if (!data.length) return [];

  // Resolve brand names in one query (no per-row round-trips, no private fields).
  const brandIds = Array.from(
    new Set(data.map((r) => r.brand_id).filter((b): b is string => !!b))
  );
  const brandNames = new Map<string, string>();
  if (brandIds.length) {
    const { data: brands } = await supabase
      .from("brand_generations")
      .select("id, output_data")
      .in("id", brandIds);
    for (const b of brands ?? []) {
      const name = (b.output_data as { recommendedName?: string })?.recommendedName;
      if (name) brandNames.set(b.id as string, name);
    }
  }

  const items = await Promise.all(
    data.map(async (row) => {
      if (!row.storage_path) return null;
      let imageUrl: string;
      try {
        imageUrl = await getSignedUrl(row.storage_path, SIGNED_TTL_SECONDS);
      } catch {
        return null; // skip rather than expose a broken/blank card
      }
      const item: ShowcaseItem = {
        id: row.id as string,
        imageUrl,
        brandName: (row.brand_id && brandNames.get(row.brand_id)) || FALLBACK_BRAND_NAME,
        imageType: IMAGE_TYPE_LABELS[row.image_type ?? ""] ?? "Creation",
      };
      return item;
    })
  );

  return items.filter((i): i is ShowcaseItem => i !== null);
}

// ── Admin: list the admin's OWN completed image jobs (curation candidates) ───
export async function listAdminFeaturable(adminUserId: string): Promise<StudioJobRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("studio_jobs")
    .select("*")
    .eq("user_id", adminUserId)      // Fox-owned only — enforces the consent rule
    .eq("status", "completed")
    .eq("job_type", "image")
    .order("created_at", { ascending: false })
    .limit(60);

  if (!data?.length) return [];

  return Promise.all(
    data.map(async (job: StudioJobRow) => {
      if (job.storage_path) {
        try {
          job.output_url = await getSignedUrl(job.storage_path, SIGNED_TTL_SECONDS);
        } catch { /* non-fatal */ }
      }
      return job;
    })
  );
}

// ── Admin: toggle featured. Ownership-enforced — can only feature own jobs ────
export async function setJobFeatured(
  jobId: string,
  adminUserId: string,
  featured: boolean
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("studio_jobs")
    .update({
      featured,
      featured_at: featured ? new Date().toISOString() : null,
    })
    .eq("id", jobId)
    .eq("user_id", adminUserId)      // hard rule: only the admin's OWN jobs
    .select("id");
  return !error && !!data && data.length > 0;
}
