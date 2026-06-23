"use client";

import Link from "next/link";
import { copyToClipboard } from "@/lib/clipboard";

async function track(brandGenerationId: string, eventType: string) {
  await fetch("/api/brand/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandGenerationId, eventType }),
  }).catch(() => {});
}

export default function BrandActions({
  brandGenerationId,
  brandName,
}: {
  brandGenerationId: string;
  brandName: string;
}) {
  return (
    <div data-print-hide className="mt-10 bg-card rounded-2xl p-8">
      <h2 className="font-display text-xl font-extrabold text-white text-center mb-6">
        What would you like to do next?
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ActionCard
          emoji="🚀"
          title="Create Another Brand"
          desc="Start fresh with a new idea."
          href="/generate"
          onClick={() => track(brandGenerationId, "create_another_click")}
          primary
        />
        <ActionCard
          emoji="💾"
          title="Save This Brand"
          desc="It's already saved in your Brand Vault."
          href="/dashboard"
          onClick={() => track(brandGenerationId, "save_click")}
        />
        <ActionCard
          emoji="📥"
          title="Export My Launch Kit"
          desc="Print or save as a clean dark-mode PDF."
          onClick={() => {
            track(brandGenerationId, "export_click");
            window.open(`/brand/${brandGenerationId}/print`, "_blank");
          }}
        />
        <ActionCard
          emoji="👁"
          title="Preview Website"
          desc="See your copy as a real, downloadable landing page."
          onClick={() => {
            track(brandGenerationId, "preview_website_click");
            window.open(`/brand/${brandGenerationId}/preview`, "_blank");
          }}
        />
        <ActionCard
          emoji="📣"
          title="Share My Brand"
          desc="Show the world what you built."
          onClick={() => {
            track(brandGenerationId, "share_click");
            if (navigator.share) {
              navigator.share({
                title: brandName,
                text: `Check out ${brandName} — created with BrandGoblin AI!`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              copyToClipboard(window.location.href).then((ok) =>
                alert(ok ? "Link copied!" : "Couldn't copy the link — please copy it from the address bar.")
              );
            }
          }}
        />
      </div>
    </div>
  );
}

function ActionCard({
  emoji,
  title,
  desc,
  href,
  onClick,
  primary,
}: {
  emoji: string;
  title: string;
  desc: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const cls = `flex items-start gap-4 rounded-xl border-2 p-5 text-left transition cursor-pointer ${
    primary
      ? "border-primary/50 bg-primary/10 hover:bg-primary/20"
      : "border-[rgba(45,45,78,0.8)] hover:border-primary/40 hover:bg-[rgba(45,45,78,0.3)]"
  }`;

  const inner = (
    <>
      <span className="text-3xl shrink-0">{emoji}</span>
      <div>
        <p className="font-display font-bold text-white">{title}</p>
        <p className="text-sm text-muted mt-0.5">{desc}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={cls} onClick={onClick}>
      {inner}
    </button>
  );
}
