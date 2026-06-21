"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FAVORITES_LABEL } from "@/lib/studio/favorites";

interface FavoriteThumb {
  id: string;
  output_url: string | null;
  image_type: string | null;
}

interface Props {
  favorites: FavoriteThumb[];
}

const TYPE_LABELS: Record<string, string> = {
  logo_concept:   "Logo",
  social_graphic: "Social",
  product_art:    "Product",
};

export default function StudioFavoritesSection({ favorites }: Props) {
  if (!favorites.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-black text-white">{FAVORITES_LABEL}</h2>
        <Link
          href="/dashboard/studio"
          className="text-xs text-secondary hover:text-white transition-colors"
        >
          View all in Studio →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {favorites.map((fav, i) => (
          <motion.div
            key={fav.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href="/dashboard/studio"
              className="group relative block aspect-square rounded-xl overflow-hidden border border-amber-400/20 bg-black/30 hover:border-amber-400/50 transition-colors"
            >
              {fav.output_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fav.output_url}
                  alt={TYPE_LABELS[fav.image_type ?? ""] ?? "Creation"}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute top-1 right-1 text-xs drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]">⭐</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
