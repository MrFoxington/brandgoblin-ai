import type { Metadata } from "next";
import Link from "next/link";
import { listFeaturedPublic } from "@/lib/studio/showcase";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";

export const metadata: Metadata = {
  title: "Real brands made with BrandGoblin — Goblin Studio Showcase",
  description: "A live wall of real brands, logos, and product art made with Goblin Studio. Start creating yours free.",
};

// Re-run listFeaturedPublic() on every request — never serve a frozen empty static render.
export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const items = await listFeaturedPublic();

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-3">
            Watch your idea become real
          </h1>
          <p className="text-base text-muted max-w-xl mx-auto mb-8">
            Real brands, logos, and product art — all made with Goblin Studio. People made these.
            You have an idea. You could make yours right now.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_24px_rgba(255,107,53,0.5)] motion-safe:animate-conjure-pulse hover:opacity-90 transition-opacity"
          >
            ✦ Start Creating — Free
          </Link>
        </div>

        {/* Wall */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
            {items.map((item, i) => (
              <ShowcaseCard key={item.id} item={item} priority={i < 8} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-bold text-white mb-1">Fresh creations coming soon ✨</p>
            <p className="text-sm text-muted">Real brands made with Goblin Studio will appear here.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_24px_rgba(255,107,53,0.5)] motion-safe:animate-conjure-pulse hover:opacity-90 transition-opacity"
          >
            ✦ Start Creating — Free
          </Link>
        </div>
      </div>
    </main>
  );
}
