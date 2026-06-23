"use client";

import Link from "next/link";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/components/NixToast";

// Thin top bar over the live-webpage preview. Download / Copy both hand the user the EXACT
// same HTML string the iframe is rendering, so the file is byte-identical to the preview.
export default function PreviewActions({
  html,
  brandName,
  brandId,
}: {
  html: string;
  brandName: string;
  brandId: string;
}) {
  const { showToast } = useToast();

  function slug() {
    const s = (brandName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "brand";
  }

  function handleDownload() {
    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug()}-website.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Downloaded your website HTML.", "success", "⤓");
    } catch {
      showToast("Couldn't download — try Copy HTML instead.", "success", "⚠️");
    }
  }

  async function handleCopy() {
    const ok = await copyToClipboard(html);
    showToast(
      ok ? "HTML copied — paste it into any host." : "Couldn't copy — try Download HTML instead.",
      "success",
      ok ? "✅" : "⚠️"
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[rgba(45,45,78,0.8)] bg-[rgba(12,10,24,0.95)] px-4 py-3 backdrop-blur-md">
      <Link
        href={`/brand/${brandId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-white transition-colors"
      >
        ← Back to kit
      </Link>
      <div className="flex items-center gap-2">
        <button onClick={handleCopy} className="btn-secondary !py-1.5 !px-3 text-xs">
          Copy HTML
        </button>
        <button onClick={handleDownload} className="btn-primary !py-1.5 !px-3 text-xs !animate-none">
          ⤓ Download HTML
        </button>
      </div>
    </div>
  );
}
