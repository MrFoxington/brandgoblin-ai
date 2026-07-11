import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShowcaseAdmin from "@/components/admin/ShowcaseAdmin";
import { listAdminFeaturable } from "@/lib/studio/showcase";

// July 10 2026: fixed fallback typo "joepro" → "jopro" (Fox's real email).
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "jopro@hotmail.com";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user || authData.user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const [
    { count: totalBrands },
    { data: feedbackRows },
    { data: validationRows },
    { data: analyticsRows },
    { data: testimonialRows },
    { data: rerollRows },
    { data: nameModeRows },
  ] = await Promise.all([
    admin.from("brand_generations").select("*", { count: "exact", head: true }),
    admin.from("brand_feedback").select("rating"),
    admin.from("brand_validation").select("would_build"),
    admin.from("brand_analytics").select("event_type"),
    admin.from("brand_testimonials").select("id, testimonial_text, created_at").order("created_at", { ascending: false }).limit(10),
    admin.from("brand_generations").select("rerolls_used").not("rerolls_used", "eq", "{}"),
    admin.from("brand_generations").select("input_data"),
  ]);

  // Feedback breakdown
  const feedbackCounts = { nailed_it: 0, pretty_close: 0, not_what_i_imagined: 0 };
  for (const row of feedbackRows ?? []) {
    const r = row.rating as keyof typeof feedbackCounts;
    if (r in feedbackCounts) feedbackCounts[r]++;
  }
  const totalFeedback = Object.values(feedbackCounts).reduce((a, b) => a + b, 0);

  // Validation breakdown
  const validationCounts = { yes: 0, maybe: 0, no: 0 };
  for (const row of validationRows ?? []) {
    const v = row.would_build as keyof typeof validationCounts;
    if (v in validationCounts) validationCounts[v]++;
  }
  const totalValidation = Object.values(validationCounts).reduce((a, b) => a + b, 0);

  // Analytics event counts
  const eventCounts: Record<string, number> = {};
  for (const row of analyticsRows ?? []) {
    eventCounts[row.event_type] = (eventCounts[row.event_type] ?? 0) + 1;
  }
  const sortedEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]);

  // Most rerolled sections
  const sectionCounts: Record<string, number> = {};
  for (const row of rerollRows ?? []) {
    for (const s of (row.rerolls_used as string[]) ?? []) {
      sectionCounts[s] = (sectionCounts[s] ?? 0) + 1;
    }
  }
  const sortedSections = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1]);

  // Name mode breakdown
  let generatedCount = 0, existingCount = 0;
  for (const row of nameModeRows ?? []) {
    const mode = (row.input_data as { nameMode?: string })?.nameMode;
    if (mode === "existing") existingCount++;
    else generatedCount++;
  }

  // ── Showcase curation — the admin's OWN completed image jobs (consent rule) ──
  const featurableJobs = await listAdminFeaturable(authData.user.id);
  const showcaseBrandIds = Array.from(
    new Set(featurableJobs.map((j) => j.brand_id).filter((b): b is string => !!b))
  );
  const showcaseBrandNames = new Map<string, string>();
  if (showcaseBrandIds.length) {
    const { data: scBrands } = await admin
      .from("brand_generations")
      .select("id, output_data")
      .in("id", showcaseBrandIds);
    for (const b of scBrands ?? []) {
      const name = (b.output_data as { recommendedName?: string })?.recommendedName;
      if (name) showcaseBrandNames.set(b.id as string, name);
    }
  }
  const showcaseJobs = featurableJobs.map((j) => ({
    id: j.id,
    output_url: j.output_url,
    image_type: j.image_type,
    brand_name: (j.brand_id && showcaseBrandNames.get(j.brand_id)) || "Freeform",
    featured: j.featured,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <span className="badge-purple mb-3 inline-block">🧌 Admin</span>
            <h1 className="font-display text-3xl font-extrabold text-white">Analytics Dashboard</h1>
            <p className="text-muted mt-1 text-sm">Real-time data from your Supabase tables.</p>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            <StatCard label="Total Brands" value={totalBrands ?? 0} emoji="🏷️" />
            <StatCard label="Feedback Received" value={totalFeedback} emoji="🧌" />
            <StatCard label="Validations" value={totalValidation} emoji="🚀" />
            <StatCard label="Testimonials" value={testimonialRows?.length ?? 0} emoji="⭐" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Feedback breakdown */}
            <div className="bg-card p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white mb-4">🎯 Feedback Ratings</h2>
              <div className="space-y-3">
                <Bar label="🟢 Nailed It" count={feedbackCounts.nailed_it} total={totalFeedback} color="bg-green-500" />
                <Bar label="🟡 Pretty Close" count={feedbackCounts.pretty_close} total={totalFeedback} color="bg-yellow-500" />
                <Bar label="🔴 Not What I Imagined" count={feedbackCounts.not_what_i_imagined} total={totalFeedback} color="bg-red-500" />
              </div>
            </div>

            {/* Validation breakdown */}
            <div className="bg-card p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white mb-4">🚀 Would Build This?</h2>
              <div className="space-y-3">
                <Bar label="Yes, I'd launch" count={validationCounts.yes} total={totalValidation} color="bg-green-500" />
                <Bar label="Maybe" count={validationCounts.maybe} total={totalValidation} color="bg-yellow-500" />
                <Bar label="Probably not" count={validationCounts.no} total={totalValidation} color="bg-red-500" />
              </div>
            </div>

            {/* Name mode */}
            <div className="bg-card p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white mb-4">🏷️ Name Mode</h2>
              <div className="space-y-3">
                <Bar label="🧌 Named by Goblin" count={generatedCount} total={generatedCount + existingCount} color="bg-primary" />
                <Bar label="✨ Own Name" count={existingCount} total={generatedCount + existingCount} color="bg-secondary" />
              </div>
            </div>

            {/* Most rerolled sections */}
            <div className="bg-card p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white mb-4">🔄 Most Re-Conjured Sections</h2>
              {sortedSections.length === 0 ? (
                <p className="text-sm text-muted">No rerolls yet.</p>
              ) : (
                <div className="space-y-2">
                  {sortedSections.slice(0, 8).map(([section, count]) => (
                    <div key={section} className="flex items-center justify-between text-sm">
                      <span className="text-muted capitalize">{section.replace(/([A-Z])/g, " $1")}</span>
                      <span className="badge-purple text-xs">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top events */}
            <div className="bg-card p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white mb-4">📊 Top Events</h2>
              {sortedEvents.length === 0 ? (
                <p className="text-sm text-muted">No events yet.</p>
              ) : (
                <div className="space-y-2">
                  {sortedEvents.slice(0, 10).map(([event, count]) => (
                    <div key={event} className="flex items-center justify-between text-sm">
                      <span className="text-muted font-mono text-xs">{event}</span>
                      <span className="badge-purple text-xs">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent testimonials */}
            <div className="bg-card p-6 rounded-2xl">
              <h2 className="font-display text-lg font-bold text-white mb-4">⭐ Recent Testimonials</h2>
              {!testimonialRows?.length ? (
                <p className="text-sm text-muted">No testimonials yet.</p>
              ) : (
                <div className="space-y-3">
                  {testimonialRows.map((t: { id: string; testimonial_text: string; created_at: string }) => (
                    <div key={t.id} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
                      <p className="text-sm text-muted leading-relaxed">&ldquo;{t.testimonial_text}&rdquo;</p>
                      <p className="text-xs text-faint mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Showcase curation */}
          <div className="bg-card p-6 rounded-2xl mt-6">
            <h2 className="font-display text-lg font-bold text-white mb-1">⭐ Showcase Curation</h2>
            <p className="text-xs text-muted mb-4">
              Feature your best creations on the public wall (<span className="font-mono">/embed/showcase</span>,{" "}
              <span className="font-mono">/showcase</span>). Only your own creations can be featured.
            </p>
            <ShowcaseAdmin jobs={showcaseJobs} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="bg-card rounded-2xl p-5 text-center">
      <span className="text-3xl block mb-2">{emoji}</span>
      <p className="font-display text-3xl font-black text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted">{label}</span>
        <span className="text-white font-semibold">{count} <span className="text-faint font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 w-full rounded-full bg-[rgba(45,45,78,0.6)]">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
