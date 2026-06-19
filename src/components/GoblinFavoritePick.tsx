"use client";

import { motion } from "framer-motion";
import CopyButton from "./CopyButton";
import { useSoundFx } from "./primitives/SoundFx";

interface NameOption {
  name: string;
  tagline?: string;
  whyItWorks?: string;
  reasoning?: string;
}

interface FavoriteName {
  name: string;
  tagline?: string;
  whyPicked?: string;
  bestFor?: string;
}

interface Props {
  favoriteName?: FavoriteName;
  alternativeNames?: NameOption[];
  recommendedName?: string;
  brandNames?: NameOption[];
}

const MEDALS = [
  {
    icon: "🥇",
    label: "Goblin's Top Pick",
    color: "border-yellow-500/40 bg-yellow-500/8",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  {
    icon: "🥈",
    label: "Strong Contender",
    color: "border-white/15 bg-white/3",
    badge: "bg-white/10 text-white/70 border-white/20",
  },
  {
    icon: "🥉",
    label: "Solid Choice",
    color: "border-white/10 bg-white/2",
    badge: "bg-white/8 text-white/60 border-white/15",
  },
];

export default function GoblinFavoritePick({ favoriteName, alternativeNames, recommendedName, brandNames }: Props) {
  const { playFavorite } = useSoundFx();

  const picks: { name: string; tagline?: string; why?: string; bestFor?: string }[] = [];

  if (favoriteName) {
    picks.push({
      name: favoriteName.name,
      tagline: favoriteName.tagline,
      why: favoriteName.whyPicked,
      bestFor: favoriteName.bestFor,
    });
  } else if (recommendedName) {
    picks.push({ name: recommendedName });
  }

  if (alternativeNames?.length) {
    picks.push(
      ...alternativeNames.slice(0, 2).map((a) => ({
        name: a.name,
        tagline: a.tagline,
        why: a.whyItWorks ?? a.reasoning,
      }))
    );
  } else if (brandNames?.length) {
    const others = brandNames.filter((b) => b.name !== picks[0]?.name).slice(0, 2);
    picks.push(...others.map((b) => ({ name: b.name, tagline: b.tagline, why: b.reasoning })));
  }

  if (picks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 px-1">
        <span className="text-2xl">⭐</span>
        <div>
          <h2 className="font-display text-xl font-black text-white">Goblin&apos;s Favorite Pick</h2>
          <p className="text-xs text-muted">Nix ranked these from best to great</p>
        </div>
      </div>

      <div className="space-y-3">
        {picks.slice(0, 3).map((pick, i) => {
          const medal = MEDALS[i] ?? MEDALS[2];
          return (
            <motion.div
              key={pick.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`rounded-2xl border p-5 ${medal.color}`}
              onAnimationComplete={() => { if (i === 0) playFavorite(); }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0 mt-0.5">{medal.icon}</span>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-xl font-black text-white">{pick.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${medal.badge}`}>
                        {medal.label}
                      </span>
                    </div>
                    {pick.tagline && (
                      <p className="text-sm text-muted italic">&ldquo;{pick.tagline}&rdquo;</p>
                    )}
                    {/* Model-specific reasoning — replaces generic random praise */}
                    {pick.why && (
                      <p className="text-xs text-faint leading-relaxed mt-1.5">{pick.why}</p>
                    )}
                    {i === 0 && pick.bestFor && (
                      <p className="text-xs text-primary-light font-medium mt-1">
                        🎯 Best for: {pick.bestFor}
                      </p>
                    )}
                  </div>
                </div>
                <CopyButton text={pick.name} className="shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
