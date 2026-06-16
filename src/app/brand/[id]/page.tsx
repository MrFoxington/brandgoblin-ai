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

  if (!authData.user) {
    redirect("/login");
  }

  const { data: row } = await supabase
    .from("brand_generations")
    .select("id, user_id, input_data, output_data, created_at, favorite")
    .eq("id", params.id)
    .eq("user_id", authData.user.id)
    .single();

  if (!row) {
    notFound();
  }

  const generation = row as BrandGenerationRow;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
                ← Back to vault
              </Link>
              <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                {generation.output_data.recommendedName}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {generation.input_data.businessIdea}
              </p>
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
