import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandKitView from "@/components/BrandKitView";
import FavoriteToggle from "@/components/FavoriteToggle";
import type { BrandGenerationRow } from "@/types";

export default async function BrandPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: row } = await supabase
    .from("brand_generations")
    .select("id, user_id, input_data, output_data, created_at, favorite")
    .eq("id", params.id)
    .eq("user_id", authData.user.id)
    .single();

  if (!row) notFound();

  const generation = row as BrandGenerationRow;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
              >
                ← Back to vault
              </Link>
              <div className="mb-2">
                <span className="badge-purple">✦ Brand Kit</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                <span className="gradient-text">{generation.output_data.recommendedName}</span>
              </h1>
              <p className="mt-2 text-sm text-muted max-w-xl leading-relaxed">
                {generation.input_data.businessIdea}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="badge-purple capitalize">{generation.input_data.vibe}</span>
                <span className="badge-green">{generation.input_data.industry}</span>
              </div>
            </div>
            <FavoriteToggle id={generation.id} initialFavorite={generation.favorite} />
          </div>

          <BrandKitView kit={generation.output_data} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
