"use client";

import { motion } from "framer-motion";
import CopyButton from "./CopyButton";

interface NameOption {
  name: string;
  tagline?: string;
  reasoning?: string;
}

interface Props {
  favoriteName?: { name: string; tagline?: string; reasoning?: string };
  alternativeNames?: NameOption[];
  recommendedName?: string;
  brandNames?: NameOption[];
}

const NIX_COMMENTS = [
  "I'd personally launch with this one.",
  "This one feels memorable.",
  "Humans would remember this.",
  "This is the one. Trust me.",
  "I get excited every time I say this name.",
];

const MEDALS = [
  { icon: "🥇", label: "Goblin's Top Pick", color: "border-yellow-500/40 bg-yellow-500/8", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { icon: "🥈", label: "Strong Contender", color: "border-white/15 bg-white/3", badge: "bg-white/10 text-white/70 border-white/20" },
  { icon: "🥉", label: "Solid Choice", color: "border-white/10 bg-white/2", badge: "bg-white/8 text-white/60 border-white/15" },
];

const NIX_SECOND = ["This one has real potential.", "Could be the one.", "Solid. Very solid."];
const NIX_THIRD = ["Don't sleep on this one.", "A dark horse pick.", "Has a nice ring to it."];

export default function GoblinFavoritePick({ favoriteName, alternativeNames, recommendedName, brandNames }: Props) {
  // Build top 3 list from whatever data shape we have
  const picks: { name: string; tagline?: string; reasoning?: string }[] = [];

  if (favoriteName) {
    picks.push(favoriteName);
  } else if (recommendedName) {
    picks.push({ name: recommendedName });
  }

  if (alternativeNames?.length) {
    picks.push(...alternativeNames.slice(0, 2));
  } else if (brandNames?.length) {
    const others = brandNames.filter((b) => b.name !== picks[0]?.name).slice(0, 2);
    picks.push(...others);
  }

  if (picks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-2xl">⭐</span>
        <div>
          <h2 className="font-display text-xl font-black text-white">Goblin&apos;s Favorite Pick</h2>
          <p className="text-xs text-muted">Nix ranked these from best to great</p>
        </div>
      </div>

      {/* Pick cards */}
      <div className="space-y-3">
        {picks.slice(0, 3).map((pick, i) => {
          const medal = MEDALS[i] ?? MEDALS[2];
          const nixComment = i === 0
            ? NIX_COMMENTS[Math.floor(Math.random() * NIX_COMMENTS.length)]
            : i === 1
            ? NIX_SECOND[Math.floor(Math.random() * NIX_SECOND.length)]
            : NIX_THIRD[Math.floor(Math.random() * NIX_THIRD.length)];

          return (
            <motion.div
              key={pick.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`rounded-2xl border p-5 ${medal.color}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{medal.icon}</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-xl font-black text-white">{pick.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${medal.badge}`}>
                        {medal.label}
                      </span>
                    </div>
                    {pick.tagline && (
                      <p className="text-sm text-muted italic">&ldquo;{pick.tagline}&rdquo;</p>
                    )}
                    {pick.reasoning && (
                      <p className="text-xs text-faint leading-relaxed mt-1">
                        {pick.reasoning}
                      </p>
                    )}
                    {i === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xs text-primary-light font-semibold mt-1.5"
                      >
                        🧌 Nix says: &ldquo;{nixComment}&rdquo;
                      </motion.p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <CopyButton text={pick.name} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
