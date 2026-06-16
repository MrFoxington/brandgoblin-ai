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

  if (!authData.user) {
    redirect("/login");
  }

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
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                Your Brand Vault 🗝️
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {rows.length} brand{rows.length === 1 ? "" : "s"} summoned so far.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="goblin-chip flex items-center gap-1">
                <span className="font-semibold text-white">
                  {plan === "free" ? `${credits} credits left` : "Unlimited credits"}
                </span>
                <span className="capitalize text-goblin-emerald">· {plan}</span>
              </div>
              <Link href="/generate" className="goblin-btn-primary !px-4 !py-2 text-sm">
                + New Brand
              </Link>
            </div>
          </div>

          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/brand/${row.id}`}
                  className="goblin-card group flex flex-col gap-2 p-5 transition hover:border-goblin-purple"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🪄</span>
                    {row.favorite ? <span className="text-amber-400">★</span> : null}
                  </div>
                  <h3 className="font-bold text-white group-hover:text-goblin-purple-light">
                    {row.output_data?.recommendedName ?? "Untitled Brand"}
                  </h3>
                  <p className="line-clamp-2 text-sm text-zinc-400">
                    {row.input_data?.businessIdea}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
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
