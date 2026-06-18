import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandKitView from "@/components/BrandKitView";
import FavoriteToggle from "@/components/FavoriteToggle";
import GoblinFeedback from "@/components/GoblinFeedback";
import BrandActions from "@/components/BrandActions";
import type { BrandGenerationRow } from "@/types";

export default async function BrandPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: row } = await supabase
    .from("brand_generations")
    .select("id, user_id, input_data, output_data, created_at, favorite, rerolls_used")
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

          {/* Back nav */}
          <Link
            data-print-hide
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
          >
            ← Back to Brand Vault
          </Link>

          {/* Celebration header */}
          <div className="mb-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 px-8 py-10 text-center">
            <span className="logo-glow block text-5xl mb-4">🎉</span>
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl mb-3">
              Your Idea Has Become A Brand.
            </h1>
            <p className="text-muted max-w-lg mx-auto leading-relaxed">
              You started with an idea. Now you have a name, identity, story, and launch plan.
              <br className="hidden sm:block" />
              <span className="text-primary-light font-semibold"> Keep building.</span>
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="font-display text-2xl font-black gradient-text">
                {generation.output_data.recommendedName}
              </span>
              <span className="badge-purple capitalize">{generation.input_data.vibe}</span>
              <span className="badge-green">{generation.input_data.industry}</span>
              <FavoriteToggle id={generation.id} initialFavorite={generation.favorite} />
            </div>
            <p className="mt-3 text-sm text-faint max-w-xl mx-auto">{generation.input_data.businessIdea}</p>
          </div>

          <BrandKitView
            kit={generation.output_data}
            brandInput={generation.input_data}
            brandGenerationId={generation.id}
            initialRerollsUsed={(generation as { rerolls_used?: string[] }).rerolls_used ?? []}
          />

          <BrandActions
            brandGenerationId={generation.id}
            brandName={generation.output_data.recommendedName}
          />

          <div data-print-hide className="mt-6">
            <GoblinFeedback
              brandGenerationId={generation.id}
              brandName={generation.output_data.recommendedName}
            />
          </div>

          {/* Bottom CTA */}
          <div data-print-hide className="mt-8 rounded-2xl border border-secondary/20 bg-secondary/5 px-8 py-8 text-center">
            <h2 className="font-display text-xl font-extrabold text-white mb-2">Ready to keep building?</h2>
            <p className="text-muted mb-5">Every great brand started as just an idea. Now you have yours.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/generate" className="btn-primary px-8 py-3">
                ✦ Create Another Brand
              </Link>
              <Link href="/dashboard" className="btn-secondary px-8 py-3">
                View Brand Vault
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
