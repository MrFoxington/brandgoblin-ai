import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PreviewActions from "@/components/preview/PreviewActions";
import { renderBrandSiteHTML } from "@/lib/website/renderSite";
import type { BrandGenerationRow, BrandKit } from "@/types";

// Live-webpage preview of a brand. Mirrors the print page's data-load + ownership/auth pattern,
// then shows renderBrandSiteHTML(kit) in an <iframe srcDoc> so the preview is EXACTLY the file
// the user downloads/copies via PreviewActions.
export default async function BrandPreviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: row } = await supabase
    .from("brand_generations")
    .select("id, user_id, input_data, output_data, created_at")
    .eq("id", params.id)
    .eq("user_id", authData.user.id)
    .single();

  if (!row) notFound();

  const generation = row as BrandGenerationRow;
  const kit = generation.output_data as BrandKit;
  const html = renderBrandSiteHTML(kit);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PreviewActions html={html} brandName={kit.recommendedName} brandId={generation.id} />
      <iframe
        srcDoc={html}
        title={`${kit.recommendedName} — website preview`}
        sandbox="allow-same-origin"
        style={{ width: "100%", flex: 1, border: 0 }}
      />
    </div>
  );
}
