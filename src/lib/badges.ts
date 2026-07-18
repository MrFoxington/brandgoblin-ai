// 🏆 Creator Badges — the Trophy Shelf registry (July 18 2026, Fox's idea:
// Pokemon-style collector badges for creation milestones. Honest dopamine:
// every badge is EARNED by creating — never bought, never gated, never FOMO'd.)
//
// Art pipeline: Fox conjures each badge emblem in Studio (Design Pro, house
// badge style) → drops the transparent PNG at /public/badges/achievements/<id>.png
// → it lights up automatically (BadgeShelf falls back to the emoji icon until
// the file exists). No code change per badge.

export interface BadgeDef {
  id: string;
  title: string;
  desc: string;   // flavor text, shown in the fullscreen view
  hint: string;   // how to earn it (locked state)
  icon: string;   // emoji fallback until the conjured art lands
  href: string;   // where the earning action happens
}

export interface BadgeStats {
  brandCount: number;
  completedJobs: number;
  productArtJobs: number;
  hasOfficialLogo: boolean;
  /** Client-side (localStorage) — merged in by BadgeShelf on mount. */
  streakDays?: number;
}

export interface BadgeState extends BadgeDef {
  earned: boolean;
  comingSoon?: boolean;
  progress?: { current: number; target: number };
  art: string; // expected art path — shelf falls back to icon if missing
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-spark",
    title: "The First Spark",
    desc: "The exact moment an idea ignited. Your first brand, conjured from nothing.",
    hint: "Conjure your first brand",
    icon: "✨",
    href: "/generate",
  },
  {
    id: "conjurer",
    title: "The Conjurer",
    desc: "Words became art. Your first Studio creation left the cauldron.",
    hint: "Create your first piece in Goblin Studio",
    icon: "🎨",
    href: "/dashboard/studio",
  },
  {
    id: "mark-maker",
    title: "The Mark Maker",
    desc: "A brand crowned its official logo. This mark now stamps everything.",
    hint: "Crown an official logo for one of your brands",
    icon: "⭐",
    href: "/dashboard/studio",
  },
  {
    id: "merch-goblin",
    title: "The Merch Goblin",
    desc: "Your brand escaped the screen — product art worthy of real shelves.",
    hint: "Conjure your first product art",
    icon: "👕",
    href: "/dashboard/studio",
  },
  {
    id: "collector",
    title: "The Collector",
    desc: "Ten creations and counting. The vault is getting heavy.",
    hint: "Complete 10 Studio creations",
    icon: "🗃️",
    href: "/dashboard/studio",
  },
  {
    id: "on-fire",
    title: "On Fire",
    desc: "Three days straight in the workshop. The forge never cooled.",
    hint: "Keep a 3-day creation streak",
    icon: "🔥",
    href: "/dashboard",
  },
  {
    id: "herald",
    title: "The Herald",
    desc: "You showed the world. The first share is the bravest one.",
    hint: "Share a creation with the world",
    icon: "📣",
    href: "/dashboard/studio",
  },
  {
    id: "its-alive",
    title: "IT'S ALIVE",
    desc: "You pulled the lever. Your creation moved. Goblin Labs remembers.",
    hint: "Bring a creation to life in Goblin Labs",
    icon: "⚡",
    href: "/dashboard/labs",
  },
];

// Badges whose earning signal isn't wired yet — shown as mystery slots.
// herald: shares are client-side only today (no DB event). its-alive: Labs
// video ships with Phase 1. Flip these off as the signals land.
const COMING_SOON = new Set(["herald", "its-alive"]);

export function computeBadges(stats: BadgeStats): BadgeState[] {
  const streak = stats.streakDays ?? 0;

  const earnedMap: Record<string, boolean> = {
    "first-spark": stats.brandCount >= 1,
    "conjurer": stats.completedJobs >= 1,
    "mark-maker": stats.hasOfficialLogo,
    "merch-goblin": stats.productArtJobs >= 1,
    "collector": stats.completedJobs >= 10,
    "on-fire": streak >= 3,
    "herald": false,
    "its-alive": false,
  };

  const progressMap: Record<string, { current: number; target: number } | undefined> = {
    "collector": { current: Math.min(stats.completedJobs, 10), target: 10 },
    "on-fire": { current: Math.min(streak, 3), target: 3 },
  };

  return BADGES.map((b) => ({
    ...b,
    art: `/badges/achievements/${b.id}.png`,
    earned: !!earnedMap[b.id],
    comingSoon: COMING_SOON.has(b.id) || undefined,
    progress: earnedMap[b.id] ? undefined : progressMap[b.id],
  }));
}
