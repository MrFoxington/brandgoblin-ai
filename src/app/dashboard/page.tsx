import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
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
  const credits = userRow?.credits ?? 0;
  const plan = userRow?.plan ?? "free";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2">
                <span className="badge-purple">✦ Brand Vault</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                Your <span className="gradient-text">Brand Vault</span>
              </h1>
              <p className="mt-1 text-sm text-muted">
                {rows.length} brand{rows.length === 1 ? "" : "s"} summoned so far.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="badge-purple">
                <span className="text-white font-semibold">
                  {plan === "free" ? `${credits} credits left` : "Unlimited"}
                </span>
                <span className="text-faint">·</span>
                <span className="capitalize">{plan}</span>
              </div>
              <Link href="/generate" className="btn-primary !py-2.5 !px-5 text-sm">
                ✦ New Brand
              </Link>
            </div>
          </div>

          {/* Grid */}
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/brand/${row.id}`}
                  className="bg-card bg-card-hover group flex flex-col gap-3 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="logo-glow text-2xl">🪄</span>
                    {row.favorite && (
                      <span className="badge-green text-xs">★ Favorite</span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-primary-light transition-colors">
                    {row.output_data?.recommendedName ?? "Untitled Brand"}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted leading-relaxed">
                    {row.input_data?.businessIdea}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="badge-purple text-xs capitalize">{row.input_data?.vibe}</span>
                    <span className="text-xs text-faint">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
