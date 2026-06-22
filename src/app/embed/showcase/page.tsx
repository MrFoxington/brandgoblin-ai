import type { Metadata } from "next";
import { listFeaturedPublic } from "@/lib/studio/showcase";
import ShowcaseMarquee from "@/components/showcase/ShowcaseMarquee";

// Chrome-less embed — designed to live inside an iframe on the Airo marketing site.
// No navbar/footer. noindex (it's an embed surface, not a destination page).
export const metadata: Metadata = {
  title: "Real brands made with BrandGoblin Studio",
  robots: { index: false, follow: false },
};

// Re-run listFeaturedPublic() on every request — never serve a frozen empty static render.
export const dynamic = "force-dynamic";

export default async function EmbedShowcasePage() {
  const items = await listFeaturedPublic();

  return (
    <main className="min-h-screen w-full bg-bg flex flex-col items-center justify-center py-4">
      <ShowcaseMarquee initialItems={items} />
    </main>
  );
}
