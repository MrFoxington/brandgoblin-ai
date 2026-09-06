"use client";

/**
 * VaultShell (Creator Studio Phase B, Sept 2026).
 * The work-first home: greeting, the latest creation big, a gallery of
 * everything, one Create button, and the quiet rail. Owns the bits of state
 * the old dashboard kept (streak, energy, daily idea, refill modal) so every
 * child is a plain presentational piece.
 *
 * Hydration rule (learned the hard way, July 2026): anything that depends on
 * the clock, randomness or localStorage starts with a stable value and gets
 * its real value after mount.
 */

import { useCallback, useEffect, useState } from "react";
import EnergyRefillModal from "@/components/EnergyRefillModal";
import { trackEvent } from "@/lib/analytics";
import type { BadgeStats } from "@/lib/badges";
import { pickHero, type VaultItem } from "@/lib/vault";
import VaultGreeting from "./VaultGreeting";
import VaultHero from "./VaultHero";
import VaultGallery from "./VaultGallery";
import VaultRail, { MobileStrip, type EnergyData, type DailyIdea } from "./VaultRail";
import CreateChooser from "./CreateChooser";

// ── Streak (same key BadgeShelf reads) ────────────────────────────────────────
const STREAK_KEY = "brandgoblin_streak_v1";
const NAME_ASK_DISMISSED_KEY = "brandgoblin_name_ask_dismissed_v1";

interface StreakData { lastDate: string; count: number }

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function loadAndUpdateStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const today = dateStr(0);
    const yesterday = dateStr(-1);
    let data: StreakData = raw ? JSON.parse(raw) : { lastDate: "", count: 0 };
    if (data.lastDate === today) return data.count;
    data = data.lastDate === yesterday ? { lastDate: today, count: data.count + 1 } : { lastDate: today, count: 1 };
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data.count;
  } catch {
    return 1;
  }
}

// ── Daily idea ────────────────────────────────────────────────────────────────
const FALLBACK_IDEAS = [
  "Write a 3-sentence brand story for your next business idea.",
  "List 5 competitors and note what your brand does differently.",
  "Draft your brand's first Instagram caption.",
  "Write down 3 words you never want people to associate with your brand.",
  "Pick a brand color and explain why it fits your personality.",
  "Write a tweet that introduces your brand in under 280 characters.",
  "Brainstorm 5 potential brand names for a future product.",
];

export interface IdeaSource { brandName: string; ideas: string[] }

function getDailyIdea(source: IdeaSource | null): DailyIdea {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  if (source?.ideas.length) return { idea: source.ideas[dayOfYear % source.ideas.length], brandName: source.brandName };
  return { idea: FALLBACK_IDEAS[dayOfYear % FALLBACK_IDEAS.length] };
}

const NIX_GREETINGS = [
  "Let's build something today.",
  "Ready to make some magic?",
  "Your brand is waiting for content.",
  "I've been warming up the cauldron.",
  "Time to give your brand a voice.",
];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  displayName: string | null;
  /** "free" | "pro" | "max" | "agency" as the dashboard shows it. */
  plan: string;
  signupDate?: string;
  items: VaultItem[];
  brands: { id: string; name: string }[];
  brandCount: number;
  latestBrandId: string | null;
  /** The latest brand's viral content ideas, for Today's Idea. */
  ideaSource: IdeaSource | null;
  badgeStats: BadgeStats;
}

export default function VaultShell({
  displayName,
  plan,
  signupDate,
  items: initialItems,
  brands,
  brandCount,
  latestBrandId,
  ideaSource,
  badgeStats,
}: Props) {
  const isPro = plan === "pro" || plan === "max" || plan === "agency";
  const isMax = plan === "max";

  // The vault list lives here so archiving a brand in the gallery also updates
  // the hero (the newest non-archived item) without a round trip.
  const [items, setItems] = useState<VaultItem[]>(initialItems);
  const hero = pickHero(items);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");
  const [nixSays, setNixSays] = useState(NIX_GREETINGS[0]);
  const [askDismissed, setAskDismissed] = useState(true);
  const [streak, setStreak] = useState(1);
  const [energy, setEnergy] = useState<EnergyData | null>(null);
  const [showRefill, setShowRefill] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [idea, setIdea] = useState<DailyIdea>({ idea: FALLBACK_IDEAS[0] });
  const [ideaDismissed, setIdeaDismissed] = useState(false);

  const fetchEnergy = useCallback(() => {
    fetch("/api/energy/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: EnergyData | null) => d && setEnergy(d))
      .catch(() => null);
  }, []);

  useEffect(() => {
    setMounted(true);
    setStreak(loadAndUpdateStreak());
    setGreeting(getTimeOfDay());
    setNixSays(NIX_GREETINGS[Math.floor(Math.random() * NIX_GREETINGS.length)]);
    setIdea(getDailyIdea(ideaSource));
    try {
      setAskDismissed(localStorage.getItem(NAME_ASK_DISMISSED_KEY) === "1");
    } catch {
      /* keep the ask hidden */
    }
    fetchEnergy();

    // D1/D7 return tracking, once per dashboard load
    const daysSinceSignup = signupDate
      ? Math.floor((Date.now() - new Date(signupDate).getTime()) / 86400000)
      : undefined;
    trackEvent("session_start", { daysSinceSignup, plan });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Soft-archive / restore a brand: optimistic, reverts on failure, never deletes.
  const toggleArchive = useCallback(async (id: string, archived: boolean) => {
    const patch = (value: boolean) =>
      setItems((prev) => prev.map((i) => (i.kind === "brand" && i.id === id ? { ...i, archived: value } : i)));
    patch(archived);
    try {
      const res = await fetch("/api/brands/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandGenerationId: id, archived }),
      });
      if (!res.ok) throw new Error();
    } catch {
      patch(!archived);
    }
  }, []);

  const closeChooser = useCallback(() => setChooserOpen(false), []);
  const openRefill = useCallback(() => setShowRefill(true), []);
  const dismissIdea = useCallback(() => setIdeaDismissed(true), []);

  const shelfStats: BadgeStats = mounted ? { ...badgeStats, streakDays: streak } : badgeStats;
  // One creation = the hero already shows it. The gallery earns its place at
  // two, or whenever there is something the hero cannot show (an archived kit).
  const showGallery = items.length > 1 || (!hero && items.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_304px] lg:gap-x-10 lg:gap-y-8">
      <div className="lg:col-span-2">
        <VaultGreeting
          greeting={greeting}
          nixSays={nixSays}
          displayName={displayName}
          mounted={mounted}
          askDismissedInitial={askDismissed}
          itemCount={items.filter((i) => i.kind !== "brand" || !i.archived).length}
          onCreate={() => setChooserOpen(true)}
        />
      </div>

      <MobileStrip mounted={mounted} streak={streak} energy={energy} isPro={isPro} isMax={isMax} onRefill={openRefill} />

      <div className="min-w-0 space-y-10 lg:col-start-1">
        <VaultHero item={hero} />
        {showGallery && <VaultGallery items={items} brands={brands} onToggleArchive={toggleArchive} />}
      </div>

      <aside className="min-w-0 lg:col-start-2 lg:row-start-2" aria-label="Your stats">
        <VaultRail
          plan={plan}
          isPro={isPro}
          isMax={isMax}
          mounted={mounted}
          streak={streak}
          brandCount={brandCount}
          energy={energy}
          onRefill={openRefill}
          idea={idea}
          ideaDismissed={ideaDismissed}
          onDismissIdea={dismissIdea}
          latestBrandId={latestBrandId}
          badgeStats={shelfStats}
        />
      </aside>

      <CreateChooser open={chooserOpen} onClose={closeChooser} brandId={latestBrandId} hasBrand={brandCount > 0} />

      <EnergyRefillModal
        isOpen={showRefill}
        onClose={() => setShowRefill(false)}
        onSuccess={() => {
          setShowRefill(false);
          fetchEnergy();
        }}
        isEmpty={(energy?.totalRemaining ?? 0) <= 0}
      />
    </div>
  );
}
