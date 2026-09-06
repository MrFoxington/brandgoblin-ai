import type { ShowcaseItem } from "@/lib/studio/showcase";

interface Props {
  item: ShowcaseItem;
  priority?: boolean;
}

// Plain <img loading="lazy"> (not next/image) — the embed runs cross-origin in an
// iframe and pulls already-signed remote URLs; the native lazy image is lightest.
export default function ShowcaseCard({ item, priority }: Props) {
  return (
    <div className="relative w-[200px] sm:w-[240px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_16px_32px_-20px_rgba(20,21,24,0.5)]">
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={`${item.brandName} — ${item.imageType}`}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-sm font-bold text-white truncate">{item.brandName}</p>
          <p className="text-[11px] text-emerald-300">{item.imageType}</p>
        </div>
      </div>
    </div>
  );
}
