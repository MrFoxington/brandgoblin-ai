import type { ShowcaseItem } from "@/lib/studio/showcase";

interface Props {
  item: ShowcaseItem;
  priority?: boolean;
}

// Plain <img loading="lazy"> (not next/image) — the embed runs cross-origin in an
// iframe and pulls already-signed remote URLs; the native lazy image is lightest.
export default function ShowcaseCard({ item, priority }: Props) {
  return (
    <div className="relative w-[200px] sm:w-[240px] shrink-0 overflow-hidden rounded-2xl border border-primary/25 bg-black/40 shadow-[0_0_20px_rgba(124,58,237,0.18)]">
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={`${item.brandName} — ${item.imageType}`}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* on-brand purple/gold sparkle accent */}
        <span className="pointer-events-none absolute top-2 right-2 text-sm text-amber-300/90 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">✦</span>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-sm font-bold text-white truncate">{item.brandName}</p>
          <p className="text-[11px] text-primary-light">{item.imageType}</p>
        </div>
      </div>
    </div>
  );
}
