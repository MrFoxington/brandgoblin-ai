"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES } from "@/lib/energy-config";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import JobCard from "./JobCard";
import NixCooking from "./NixCooking";
import type { BrandGenerationRow } from "@/types";
import type { StudioJobRow } from "@/lib/studio/jobs";
import { useXP } from "@/components/XPSystem";
import { useSoundFx } from "@/components/primitives/SoundFx";
import { shareImage } from "@/lib/studio/share";
import { FAVORITES_LABEL } from "@/lib/studio/favorites";

interface Props {
  brands: Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];
  initialJobs: StudioJobRow[];
  isPro?: boolean;
  /** Deep link from the brand kit CTA (?brand=<id>) — preselects that brand. */
  initialBrandId?: string;
}

const IMAGE_TYPES: { key: ImageType; label: string; desc: string }[] = [
  { key: "logo_concept",   label: "Logo Concept",   desc: "Icon mark from your brand direction" },
  { key: "mascot",         label: "Mascot",         desc: "Your brand's character, brought to life" },
  { key: "social_graphic", label: "Social Graphic", desc: "Branded post image for social" },
  { key: "product_art",    label: "Product Art",    desc: "Hero imagery for your brand" },
];

// Wow Plan Phase 1 (July 16 2026): every asset type has a SPECIALIST engine that
// Studio auto-selects when the user picks what to create. Manual override stays.
const RECOMMENDED_MODEL: Record<ImageType, StudioModelKey> = {
  logo_concept:   "recraft_v3",   // design/brand specialist — receives the exact palette hexes
  social_graphic: "ideogram_v3",  // built for posters + typography
  // July 16 retest (Fox): flux_2_flex at 40 steps + Photoreal chip = "insanely good"
  // product art — Studio is the product default again, with the chip auto-selected.
  product_art:    "flux_2_flex",
  mascot:         "seedream_v45", // character art is its strength
};

// Auto-selected style chip per asset type (user can change or clear it freely)
const AUTO_STYLE_CHIP: Partial<Record<ImageType, string>> = {
  product_art: "Photoreal studio",
};

// Specialists first, Draft last (cheap explicit choice, never the default).
// flux_pro_v1 ("Classic"/old Premium) removed from the picker July 16 — outclassed by
// the specialists and confusing as a 6th option. Still registered: old jobs remix fine.
// gpt_image_2 ("Print Pro") is nameOnOnly: it only appears — and auto-selects — when
// the "Put my brand name on it" box is ticked, because real typography is its whole job.
const MODEL_OPTIONS: { key: StudioModelKey; label: string; desc: string; isAltEngine?: boolean; nameOnOnly?: boolean }[] = [
  { key: "recraft_v3",   label: "Design Pro", desc: "Logos, products & brand design" },
  { key: "ideogram_v3",  label: "Poster Pro", desc: "Social graphics & typography" },
  { key: "gpt_image_2",  label: "Print Pro",  desc: "Writes your brand name perfectly", nameOnOnly: true },
  { key: "seedream_v45", label: "Artistic",   desc: "Different art engine · expect a new look", isAltEngine: true },
  { key: "flux_2_flex",  label: "Studio",     desc: "Realistic photo scenes" },
  { key: "flux_schnell", label: "Quick",      desc: "Test ideas fast · lowest energy" },
];

// Cooker 2.0 style chips (July 16 2026) — one-tap art direction, productizing
// Fox's hand-editing habit for everyone. The note is injected into the prompt cook.
const STYLE_CHIPS: { label: string; emoji: string; note: string }[] = [
  { label: "Retro poster",     emoji: "🖼️", note: "retro vintage poster style, screen-print texture, bold simplified shapes, slightly distressed ink" },
  { label: "Hand-drawn",       emoji: "✏️", note: "hand-drawn illustration style, organic linework, sketchbook charm, subtle paper texture" },
  { label: "Photoreal studio", emoji: "📷", note: "photorealistic studio photography, softbox lighting, crisp focus, premium commercial look" },
  { label: "Neon glow",        emoji: "🌆", note: "dark cinematic scene with vivid neon glow accents and rim lighting" },
  { label: "Minimal flat",     emoji: "◻️", note: "minimal flat design, generous negative space, crisp geometry, restrained detail" },
  { label: "3D clay",          emoji: "🧸", note: "cute 3D clay render style, soft rounded forms, gentle studio lighting" },
  { label: "Vintage badge",    emoji: "🏅", note: "vintage badge and emblem design, classic engraved-style linework, circular composition" },
  { label: "Watercolor",       emoji: "🎨", note: "soft watercolor artwork, gentle pigment blooms, textured paper feel" },
];

const IDEA_SPARKS = [
  { label: "moody hero shot",      imageType: "product_art"  as ImageType, note: "moody, dramatic hero shot with cinematic lighting" },
  { label: "playful mascot scene", imageType: "mascot" as ImageType, note: "playful, fun mascot scene with vibrant colors" },
  { label: "minimalist logo card", imageType: "logo_concept" as ImageType, note: "clean minimalist logo on a simple card, lots of white space" },
  { label: "bold product flatlay", imageType: "product_art"  as ImageType, note: "bold product flatlay with colorful props and graphic styling" },
];

// 7 base sparkles (streak 1) + 11 outer ring (streak 2–6+); count scales with real streak
const SPARKLES = [
  { x: -110, y:  -80, d: 0    },
  { x:  100, y:  -65, d: 0.08 },
  { x:  -80, y:   55, d: 0.16 },
  { x:  120, y:   45, d: 0.12 },
  { x:    0, y: -120, d: 0.2  },
  { x: -140, y:   -5, d: 0.06 },
  { x:  140, y:  -15, d: 0.18 },
  // outer ring — unlocked by streak
  { x:  -60, y: -105, d: 0.04 },
  { x:   60, y: -115, d: 0.14 },
  { x: -165, y:  -40, d: 0.22 },
  { x:  165, y:  -50, d: 0.10 },
  { x:  -50, y:   82, d: 0.18 },
  { x:   72, y:   78, d: 0.26 },
  { x: -130, y:   68, d: 0.08 },
  { x:  130, y:   62, d: 0.20 },
  { x:   10, y:  135, d: 0.12 },
  { x:  -92, y:  -38, d: 0.30 },
  { x:   92, y:  -32, d: 0.24 },
];

const POLL_INTERVAL_MS = 3000;

// Nix's encouraging lines after a real share — warm, proud, a little cheeky
const SHARE_MESSAGES = [
  "Congrats — it looks amazing! 🎉",
  "You just put your brand into the world. Let's keep building.",
  "Looking good! What do you want to create next?",
  "That's how brands grow — one share at a time. 🚀",
];

// Random seed in [0, 2^31-1] — safe for all fal models
function generateSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}

export default function StudioImageGenerator({ brands, initialJobs, isPro = false, initialBrandId }: Props) {
  const { addXP } = useXP();
  const {
    playComplete,
    playButtonPress,
    playConjureStart,
    stopAnticipation,
    playStreak,
    playNudge,
    playShare,
  } = useSoundFx();
  const reduce = useReducedMotion();

  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId ?? brands[0]?.id ?? "");
  const [imageType, setImageType]   = useState<ImageType>("logo_concept");
  const [modelKey, setModelKey]     = useState<StudioModelKey>(RECOMMENDED_MODEL.logo_concept);
  const [prompt, setPrompt]         = useState<string>("");
  const [isCooking, setIsCooking]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [jobs, setJobs]             = useState<StudioJobRow[]>(initialJobs);
  const [celebratingJob, setCelebratingJob] = useState<StudioJobRow | null>(null);
  const [streak, setStreak]         = useState(1);
  const [shareCelebrating, setShareCelebrating] = useState(false);
  const [shareMsgIndex, setShareMsgIndex]       = useState(0);
  // Gallery tab: All (visible) / Favorites (visible favs) / Hidden (archived, restorable)
  const [galleryTab, setGalleryTab] = useState<"all" | "favorites" | "hidden">("all");
  // Product Art focus — the user names the exact product ("coffee bag", "hoodie"…)
  const [productFocus, setProductFocus] = useState("");
  const [styleChip, setStyleChip]       = useState<string | null>(null);
  const [conjureTwo, setConjureTwo]     = useState(false);
  // Per-creation opt-out for the official-logo stamp (default ON = stamp).
  const [stampLogo, setStampLogo] = useState(true);
  // Paint the brand name INTO the art (July 11 2026) — OPT-IN, default OFF.
  // Forced names made every product look like a mockup with a fake wordmark;
  // clean art + the official-logo stamp is the better default.
  const [showBrandName, setShowBrandName] = useState(false);
  // Bring-your-own-logo upload (Pro perk)
  const [uploadBusy, setUploadBusy]       = useState(false);
  const [uploadRights, setUploadRights]   = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Seed ref — changes on ANY creative-intent change; stays fixed on quality-only change
  const seedRef         = useRef<number>(generateSeed());
  // Hidden file input for the bring-your-own-logo upload
  const fileInputRef    = useRef<HTMLInputElement>(null);
  // Stable refs — prevent stale closures in timers
  const awardedXPJobs        = useRef<Set<string>>(new Set());
  const cookDebounceRef      = useRef<ReturnType<typeof setTimeout>>();
  const suppressCookRef      = useRef(false);
  const pollTimers           = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const pollJobRef           = useRef<(id: string) => Promise<void>>(() => Promise.resolve());
  const addXPRef             = useRef(addXP);
  const playCompleteRef      = useRef(playComplete);
  const stopAnticipationRef  = useRef(stopAnticipation);
  const playStreakRef        = useRef(playStreak);
  const streakRef            = useRef(1);

  useEffect(() => { addXPRef.current = addXP; }, [addXP]);
  useEffect(() => { playCompleteRef.current = playComplete; }, [playComplete]);
  useEffect(() => { stopAnticipationRef.current = stopAnticipation; }, [stopAnticipation]);
  useEffect(() => { playStreakRef.current = playStreak; }, [playStreak]);
  useEffect(() => { streakRef.current = streak; }, [streak]);

  // Nudge — fires once when post-reveal CTAs first appear; never on hover/re-render
  useEffect(() => {
    if (celebratingJob) playNudge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebratingJob]);

  // Share celebration: rotate Nix's line (3s) + auto-dismiss after 8s (no pressure)
  useEffect(() => {
    if (!shareCelebrating) return;
    const rotate = reduce
      ? undefined
      : setInterval(() => setShareMsgIndex((i) => (i + 1) % SHARE_MESSAGES.length), 3000);
    const dismiss = setTimeout(() => setShareCelebrating(false), 8000);
    return () => {
      if (rotate) clearInterval(rotate);
      clearTimeout(dismiss);
    };
  }, [shareCelebrating, reduce]);

  // Fired by JobCard ONLY on a genuine successful share (sound already played there)
  function handleShareSuccess() {
    setShareMsgIndex(0);
    setShareCelebrating(true);
  }

  function handleShareKeepBuilding() {
    setShareCelebrating(false);
    requestAnimationFrame(() => {
      document.getElementById("studio-form")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth", block: "start",
      });
    });
  }

  // Optimistic archive (hide/restore) toggle — reverts on API failure.
  async function handleToggleArchive(job: StudioJobRow, next: boolean): Promise<boolean> {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, archived: next } : j)));
    try {
      const res = await fetch("/api/studio/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, archived: next }),
      });
      if (!res.ok) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, archived: !next } : j)));
        return false;
      }
      return true;
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, archived: !next } : j)));
      return false;
    }
  }

  // Optimistic favorite toggle — reverts on API failure. Returns success to JobCard.
  async function handleToggleFavorite(job: StudioJobRow, next: boolean): Promise<boolean> {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, favorite: next } : j)));
    try {
      const res = await fetch("/api/studio/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, favorite: next }),
      });
      if (!res.ok) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, favorite: !next } : j)));
        return false;
      }
      return true;
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, favorite: !next } : j)));
      return false;
    }
  }

  // Set / unset this logo as the brand's official logo. Optimistic: setting one
  // clears any other official logo for the same brand. Reverts on failure.
  async function handleSetOfficialLogo(job: StudioJobRow, next: boolean): Promise<boolean> {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) return { ...j, official_logo: next };
        // Setting a new official logo unsets the brand's previous one.
        if (next && j.image_type === "logo_concept" && j.brand_id === job.brand_id) {
          return { ...j, official_logo: false };
        }
        return j;
      })
    );
    try {
      const res = await fetch("/api/studio/official-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, official: next }),
      });
      if (!res.ok) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, official_logo: !next } : j)));
        return false;
      }
      return true;
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, official_logo: !next } : j)));
      return false;
    }
  }

  // Share from the reveal — same real-share-only flow as the card.
  async function handleRevealShare(job: StudioJobRow) {
    if (!job.output_url) return;
    const result = await shareImage(job.output_url);
    if (result === "shared" || result === "copied") {
      playShare();
      setCelebratingJob(null);   // close the reveal so the share toast is the focus
      handleShareSuccess();      // fire the Share Celebration
    }
    // cancelled / failed → do nothing
  }

  // Streak from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("brandgoblin_streak_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        const count =
          typeof parsed === "number"
            ? parsed
            : ((parsed as Record<string, number>)?.count ??
               (parsed as Record<string, number>)?.streak ??
               1);
        setStreak(Math.max(1, count));
      }
    } catch { /* ignore */ }
  }, []);

  // ── Polling ────────────────────────────────────────────────────────────────

  const stopPolling = useCallback((jobId: string) => {
    const t = pollTimers.current.get(jobId);
    if (t) { clearInterval(t); pollTimers.current.delete(jobId); }
  }, []);

  const stopAllPolling = useCallback(() => {
    pollTimers.current.forEach((t) => clearInterval(t));
    pollTimers.current.clear();
  }, []);

  const startPolling = useCallback((jobId: string) => {
    if (pollTimers.current.has(jobId)) return;
    const timer = setInterval(() => pollJobRef.current(jobId), POLL_INTERVAL_MS);
    pollTimers.current.set(jobId, timer);
  }, []);

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/studio/jobs/${jobId}`);
      if (!res.ok) return;
      const updated: StudioJobRow = await res.json();
      setJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));

      const isTerminal = ["completed", "failed", "cancelled", "moderation_blocked"].includes(updated.status);
      if (isTerminal) {
        stopPolling(jobId);
        if (updated.status === "completed" && !awardedXPJobs.current.has(jobId)) {
          awardedXPJobs.current.add(jobId);
          addXPRef.current(10);
          stopAnticipationRef.current();   // fade out the loop before the reveal lands
          playCompleteRef.current();       // reveal.mp3 — sparkle burst + warm chord
          playStreakRef.current(streakRef.current); // streak chime, pitch-scaled by real streak
          setCelebratingJob(updated);
        }
      }
    } catch { /* ignore transient errors */ }
  }, [stopPolling]);

  useEffect(() => { pollJobRef.current = pollJob; }, [pollJob]);

  useEffect(() => {
    initialJobs
      .filter((j) => j.status === "running" || j.status === "pending")
      .forEach((j) => startPolling(j.id));
    return () => stopAllPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const pinnedSize = IMAGE_TYPE_SIZES[imageType];
  const energyCost = computeStudioEnergyCost(modelKey, { width: pinnedSize.width, height: pinnedSize.height });
  const activeJobs = jobs.filter((j) => j.status === "running" || j.status === "pending");

  // Brand-scoped gallery: show only jobs matching the selected brand
  const filterByBrand = (j: StudioJobRow) =>
    selectedBrandId ? j.brand_id === selectedBrandId : !j.brand_id;
  // Brand-scoped completed jobs (drives the section + tab counts)
  const brandCompletedJobs = jobs.filter((j) => j.status === "completed" && filterByBrand(j));
  const favoriteCount = brandCompletedJobs.filter((j) => j.favorite && !j.archived).length;
  const hiddenCount   = brandCompletedJobs.filter((j) => j.archived).length;
  // Tab filter composes with the brand filter; archived stays out of All + Favorites
  const completedJobs =
    galleryTab === "favorites"
      ? brandCompletedJobs.filter((j) => j.favorite && !j.archived)
      : galleryTab === "hidden"
      ? brandCompletedJobs.filter((j) => j.archived)
      : brandCompletedJobs.filter((j) => !j.archived);
  const failedJobs    = jobs.filter((j) => (j.status === "failed" || j.status === "moderation_blocked") && filterByBrand(j));

  const selectedBrandName = selectedBrandId
    ? ((brands.find((b) => b.id === selectedBrandId)?.output_data as { recommendedName?: string })?.recommendedName ?? "Brand")
    : "Freeform";

  // Does the selected brand have an official logo? (drives the stamp toggle)
  const brandHasOfficialLogo = !!selectedBrandId && jobs.some(
    (j) => j.brand_id === selectedBrandId && j.official_logo && j.status === "completed"
  );
  const stampToggleVisible =
    brandHasOfficialLogo && (imageType === "product_art" || imageType === "social_graphic");

  const celebratingJobCost = celebratingJob
    ? computeStudioEnergyCost(
        celebratingJob.model_key as StudioModelKey,
        {
          width:  IMAGE_TYPE_SIZES[celebratingJob.image_type as ImageType]?.width  ?? pinnedSize.width,
          height: IMAGE_TYPE_SIZES[celebratingJob.image_type as ImageType]?.height ?? pinnedSize.height,
        }
      )
    : energyCost;

  // ── Prompt cooking ─────────────────────────────────────────────────────────

  async function cookPrompt(type: ImageType, userNote?: string, modelForCook?: StudioModelKey): Promise<string> {
    setIsCooking(true);
    try {
      // July 11 2026: the user can name the exact product for Product Art
      // ("coffee bag", "skateboard deck"…) — hand it to Nix as a hard
      // instruction so the prompt is built AROUND their product, not a guess.
      const productNote =
        type === "product_art" && productFocus.trim()
          ? `The product MUST be: ${productFocus.trim()}.`
          : "";
      // Style chips (Cooker 2.0) — one-tap art direction
      const chipNote = styleChip
        ? `Overall art style direction: ${STYLE_CHIPS.find((c) => c.label === styleChip)?.note ?? ""}.`
        : "";
      const note = [productNote, chipNote, userNote].filter(Boolean).join(" ") || undefined;
      const res = await fetch("/api/studio/cook-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrandId || undefined,
          imageType: type,
          userNote: note,
          showBrandName,
          modelKey: modelForCook ?? modelKey, // engine-aware prompt coaching
        }),
      });
      if (!res.ok) return "";
      const data = (await res.json()) as { prompt?: string };
      return data.prompt ?? "";
    } catch {
      return "";
    } finally {
      setIsCooking(false);
    }
  }

  // Auto-cook (debounced, 400ms) on brand/type change — also generates fresh seed
  useEffect(() => {
    if (suppressCookRef.current) return;
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    cookDebounceRef.current = setTimeout(async () => {
      if (suppressCookRef.current) return;
      seedRef.current = generateSeed(); // new creative intent
      const cooked = await cookPrompt(imageType);
      if (cooked) setPrompt(cooked);
    }, 400);
    return () => { if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId, imageType]);

  // Name-ON path (Wow Plan Phase 4): GPT Image 2 ("Print Pro") renders real
  // typography — auto-select it when the brand-name box is ticked on branded
  // art, and hand back to the type's specialist when it's unticked.
  useEffect(() => {
    const brandedArt = imageType === "product_art" || imageType === "social_graphic";
    if (brandedArt && showBrandName) {
      setModelKey("gpt_image_2");
    } else if (modelKey === "gpt_image_2") {
      setModelKey(RECOMMENDED_MODEL[imageType]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBrandName, imageType]);

  // Auto re-cook when the style chip changes — new art direction, fresh seed
  useEffect(() => {
    if (suppressCookRef.current) return;
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    cookDebounceRef.current = setTimeout(async () => {
      if (suppressCookRef.current) return;
      seedRef.current = generateSeed(); // new creative intent
      const cooked = await cookPrompt(imageType);
      if (cooked) setPrompt(cooked);
    }, 400);
    return () => { if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleChip]);

  // Auto re-cook when the product focus changes (longer debounce — user is typing)
  useEffect(() => {
    if (imageType !== "product_art") return;
    if (suppressCookRef.current) return;
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    cookDebounceRef.current = setTimeout(async () => {
      if (suppressCookRef.current) return;
      seedRef.current = generateSeed(); // new creative intent
      const cooked = await cookPrompt("product_art");
      if (cooked) setPrompt(cooked);
    }, 800);
    return () => { if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFocus]);

  // Auto re-cook when the brand-name toggle flips (only affects branded art)
  useEffect(() => {
    if (imageType !== "product_art" && imageType !== "social_graphic") return;
    if (suppressCookRef.current) return;
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    cookDebounceRef.current = setTimeout(async () => {
      if (suppressCookRef.current) return;
      seedRef.current = generateSeed(); // new creative intent
      const cooked = await cookPrompt(imageType);
      if (cooked) setPrompt(cooked);
    }, 400);
    return () => { if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBrandName]);

  // ── Job submission ─────────────────────────────────────────────────────────

  async function submitJob(jobPrompt: string, mk: StudioModelKey, it: ImageType): Promise<boolean> {
    setGenerating(true);
    setError(null);
    // Fire conjure-start synchronously (before first await) — still in gesture context,
    // so AudioContext is running and the anticipation loop that follows will be unblocked.
    playConjureStart();
    const ps = IMAGE_TYPE_SIZES[it];
    const cost = computeStudioEnergyCost(mk, { width: ps.width, height: ps.height });

    try {
      const res = await fetch("/api/studio/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelKey: mk,
          imageType: it,
          brandId: selectedBrandId || undefined,
          prompt: jobPrompt,
          seed: seedRef.current,
          stampLogo,
          showBrandName,
        }),
      });

      // Burn the seed the moment it's spent (July 11 2026): same prompt + same
      // seed = the model paints the IDENTICAL image, so re-hitting Conjure was
      // charging full energy for a pixel-perfect duplicate. Every submission
      // now rolls fresh dice for the next one.
      seedRef.current = generateSeed();

      const data = (await res.json()) as {
        jobId?: string; provider?: string; error?: string;
        requiresRefill?: boolean; requiresUpgrade?: boolean; totalRemaining?: number;
      };

      if (!res.ok) {
        if (data.requiresRefill) {
          setError(`Not enough Creative Energy (need ⚡${cost}, have ⚡${data.totalRemaining ?? 0}). Refill to keep creating.`);
        } else if (data.requiresUpgrade) {
          setError(data.error ?? "Creator Pro required.");
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        return false;
      }

      const newJob: StudioJobRow = {
        id:              data.jobId!,
        user_id:         "",
        brand_id:        selectedBrandId || null,
        job_type:        "image",
        model_key:       mk,
        image_type:      it,
        image_size:      ps.falSize,
        energy_reserved: cost,
        status:          "running",
        provider:        data.provider ?? "fal",
        provider_job_id: null,
        prompt:          jobPrompt,
        output_url:      null,
        storage_path:    null,
        error_message:   null,
        reservation_tx_id: null,
        favorite:        false,
        featured:        false,
        featured_order:  null,
        featured_at:     null,
        official_logo:   false,
        stamp_logo:      stampLogo,
        archived:        false,
        created_at:      new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      };
      setJobs((prev) => [newJob, ...prev]);
      startPolling(data.jobId!);
      return true;
    } catch {
      setError("Couldn't connect to the generation service. Please try again.");
      return false;
    } finally {
      setGenerating(false);
    }
  }

  // ── Gallery action handlers ────────────────────────────────────────────────

  async function handleProcess(sourceJob: StudioJobRow, operation: "bg_removal" | "clarity_upscaler") {
    setError(null);
    try {
      const res = await fetch("/api/studio/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: sourceJob.id, operation }),
      });
      const data = (await res.json()) as { job?: StudioJobRow; error?: string; requiresRefill?: boolean };
      if (!res.ok) {
        setError(data.error ?? "Processing failed. Your energy has been returned.");
        return;
      }
      if (data.job) setJobs((prev) => [data.job!, ...prev]);
    } catch {
      setError("Connection error during processing. Please try again.");
    }
  }

  // Bring your own logo (Pro): validate → POST multipart → new job lands in the
  // gallery already set as the brand's official logo (previous official cleared).
  async function handleUploadLogo(file: File) {
    if (!selectedBrandId || uploadBusy) return;
    setUploadMessage(null);

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadMessage("Only PNG, JPG, or WebP images, please.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("Logo must be 5MB or smaller.");
      return;
    }

    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("brandId", selectedBrandId);
      fd.append("rights", "true");

      const res  = await fetch("/api/studio/upload-logo", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { job?: StudioJobRow; error?: string };

      if (!res.ok || !data.job) {
        setUploadMessage(data.error ?? "Upload failed. Please try again.");
        return;
      }

      const newJob = data.job;
      setJobs((prev) => [
        newJob,
        ...prev.map((j) =>
          newJob.official_logo &&
          j.image_type === "logo_concept" &&
          j.brand_id === newJob.brand_id
            ? { ...j, official_logo: false }
            : j
        ),
      ]);
      setUploadRights(false);
      setUploadMessage("✓ Logo uploaded and set as your official logo!");
      playComplete();
    } catch {
      setUploadMessage("Connection error during upload. Please try again.");
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleMoreLikeThis(job: StudioJobRow) {
    seedRef.current = generateSeed();
    // Derived jobs (bg_removal / clarity_upscaler) carry a processing model_key,
    // not an art engine — fall back to the currently selected engine for those.
    const engine =
      job.model_key === "bg_removal" || job.model_key === "clarity_upscaler"
        ? modelKey
        : (job.model_key as StudioModelKey);
    const jobType = (job.image_type ?? imageType) as ImageType;
    // July 11 2026: reusing the exact prompt with only a new seed produced
    // near-clones. Cook a REAL variation — same concept and brand style, new
    // composition. Free (text op); falls back to the original prompt if the
    // cook fails.
    let variedPrompt = "";
    if (job.prompt) {
      variedPrompt = await cookPrompt(
        jobType,
        `a fresh variation of this exact concept — keep the same subject and brand style but change the composition, angle, or setting: "${job.prompt.slice(0, 300)}"`
      );
    }
    await submitJob(
      variedPrompt || job.prompt || prompt,
      engine,
      jobType
    );
  }

  // ── CTA handlers ───────────────────────────────────────────────────────────

  async function handleGenerate() {
    playButtonPress(); // in gesture context — primes audio unlock chain for the loop
    const ok = await submitJob(prompt, modelKey, imageType);
    // Conjure ×2 (Wow Plan Phase 3): second variant rides a fresh seed —
    // submitJob burns the seed after every submission, so this is a new roll.
    if (ok && conjureTwo) {
      await submitJob(prompt, modelKey, imageType);
    }
  }

  function handleMakeAnother() {
    playButtonPress();
    seedRef.current = generateSeed();
    setCelebratingJob(null);
    requestAnimationFrame(() => {
      document.getElementById("studio-form")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth", block: "start",
      });
    });
  }

  async function handleVariation(job: StudioJobRow) {
    playButtonPress();
    seedRef.current = generateSeed();
    setCelebratingJob(null);
    await submitJob(
      job.prompt ?? prompt,
      job.model_key as StudioModelKey,
      job.image_type as ImageType
    );
  }

  async function handleNewStyle(job: StudioJobRow) {
    playButtonPress();
    seedRef.current = generateSeed();
    setCelebratingJob(null);
    suppressCookRef.current = true;
    setImageType(job.image_type as ImageType);
    setModelKey(job.model_key as StudioModelKey);
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    try {
      const cooked = await cookPrompt(job.image_type as ImageType, "completely different stylistic twist and mood");
      const finalPrompt = cooked || job.prompt || prompt;
      if (cooked) setPrompt(cooked);
      await submitJob(finalPrompt, job.model_key as StudioModelKey, job.image_type as ImageType);
    } finally {
      suppressCookRef.current = false;
    }
  }

  async function handleSpark(spark: (typeof IDEA_SPARKS)[number]) {
    playButtonPress();
    seedRef.current = generateSeed();
    suppressCookRef.current = true;
    setImageType(spark.imageType);
    setModelKey(RECOMMENDED_MODEL[spark.imageType]); // sparks ride the specialist engine too
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    try {
      const cooked = await cookPrompt(spark.imageType, spark.note, RECOMMENDED_MODEL[spark.imageType]);
      if (cooked) setPrompt(cooked);
    } finally {
      suppressCookRef.current = false;
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Celebration overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {celebratingJob && (
          <motion.div
            key="studio-celebrate"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4 py-10"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
              className="relative w-full max-w-lg rounded-3xl border border-primary/30 bg-card/95 px-8 py-10 text-center shadow-glow overflow-hidden"
            >
              {!reduce && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {/* Sparkle count scales with real streak: 7 base → up to 18 at streak 6+ */}
                  {SPARKLES.slice(0, Math.min(7 + Math.max(0, streak - 1) * 2, SPARKLES.length)).map((s, i) => (
                    <motion.span key={i} className="absolute text-xl select-none"
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0.4, 1.1, 0.6] }}
                      transition={{ duration: 1.1, delay: 0.3 + s.d, ease: "easeOut" }}
                    >✦</motion.span>
                  ))}
                </div>
              )}

              <div className="mb-4 flex justify-center">
                <motion.div
                  animate={reduce ? {} : { y: [0, -8, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image src="/nix/celebrating-nix.png" alt="Nix celebrating"
                    width={140} height={140}
                    className="drop-shadow-[0_0_24px_rgba(139,92,246,0.5)]" priority
                  />
                </motion.div>
              </div>

              <h2 className="font-display text-2xl font-black text-white mb-1">Boom — done! ✨</h2>
              <p className="text-sm font-semibold mb-4" style={{ color: "#10b981" }}>
                +10 XP · {streak}-day streak 🔥
              </p>

              {celebratingJob.output_url && (
                <div className="mb-6 flex justify-center">
                  <img src={celebratingJob.output_url} alt="Your creation"
                    className="h-32 w-32 rounded-xl object-cover border border-white/10 shadow-card"
                  />
                </div>
              )}

              {/* Nix invite — share at peak intent */}
              <p className="text-xs text-muted mb-2.5">Love it? Show the world 🌍.</p>

              {/* Two glowing paths at peak emotion: Share (orange) + Make another (green) */}
              <div className="space-y-2.5 mb-4">
                <button
                  onClick={() => handleRevealShare(celebratingJob)}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_16px_rgba(255,107,53,0.45)] motion-safe:animate-conjure-pulse transition-opacity hover:opacity-90"
                >
                  📣 Share it
                </button>
                <button
                  onClick={handleMakeAnother}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white bg-secondary hover:bg-secondary/85 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-colors"
                >
                  ✨ Make another
                </button>

                {/* Secondary create paths — quieter so the two bold actions stay magnetic */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVariation(celebratingJob)}
                    disabled={generating || activeJobs.length >= 2}
                    className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-xs font-semibold text-muted hover:text-white hover:border-white/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    🎨 Variation · ⚡{celebratingJobCost}
                  </button>
                  <button
                    onClick={() => handleNewStyle(celebratingJob)}
                    disabled={generating || activeJobs.length >= 2 || isCooking}
                    className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-xs font-semibold text-muted hover:text-white hover:border-white/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    🪄 New style · ⚡{celebratingJobCost}
                  </button>
                </div>
              </div>

              <button onClick={() => setCelebratingJob(null)} className="text-xs text-muted hover:text-white transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Share celebration toast ───────────────────────────────────────────── */}
      <AnimatePresence>
        {shareCelebrating && (
          <motion.div
            key="share-celebrate"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
            className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-sm z-50"
          >
            <div className="relative rounded-2xl border border-[#FF8C42]/40 bg-card/95 backdrop-blur px-5 py-4 shadow-glow overflow-hidden">
              {/* Sparkle burst — skipped under reduced motion */}
              {!reduce && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {SPARKLES.slice(0, 6).map((s, i) => (
                    <motion.span key={i} className="absolute text-sm select-none"
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0], x: s.x * 0.5, y: s.y * 0.5, scale: [0.4, 1, 0.5] }}
                      transition={{ duration: 1, delay: 0.1 + s.d, ease: "easeOut" }}
                    >✦</motion.span>
                  ))}
                </div>
              )}

              <div className="relative flex items-start gap-3">
                <motion.div
                  className="shrink-0"
                  animate={reduce ? {} : { y: [0, -5, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image src="/nix/celebrating-nix.png" alt="Nix celebrating"
                    width={56} height={56}
                    className="drop-shadow-[0_0_14px_rgba(255,140,66,0.45)]"
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white leading-snug mb-2.5">
                    {SHARE_MESSAGES[shareMsgIndex]}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareKeepBuilding}
                      className="rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_12px_rgba(255,107,53,0.4)] motion-safe:animate-conjure-pulse hover:opacity-90 transition-opacity"
                    >
                      ✨ Create something new
                    </button>
                    <button
                      onClick={() => setShareCelebrating(false)}
                      className="text-xs text-muted hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generation panel ────────────────────────────────────────────────── */}
      <div id="studio-form" className="rounded-2xl border border-primary/20 bg-card p-6 space-y-6">

        {/* Brand selector */}
        {brands.length > 0 && (
          <div>
            <label className="block text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
              Brand Kit
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">No brand (free-form)</option>
              {brands.map((b) => {
                const name =
                  (b.output_data as { recommendedName?: string })?.recommendedName ??
                  (b.input_data as { businessIdea?: string })?.businessIdea ??
                  "Brand";
                return <option key={b.id} value={b.id}>{name}</option>;
              })}
            </select>

            {/* Bring your own logo — GOLD Pro perk. Uploads become the brand's
                official logo and stamp onto product art / social graphics. */}
            {selectedBrandId && (
              <div className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3">
                {isPro ? (
                  <>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#E9C75A]">⭐ Bring your own logo</p>
                        <p className="text-[11px] text-faint mt-0.5">
                          Already have a logo? Upload it and Nix stamps it on every product art & social graphic.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadBusy || !uploadRights}
                        title={uploadRights ? "Upload your logo (PNG, JPG, or WebP, up to 5MB)" : "Confirm you own the rights first"}
                        className="shrink-0 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] font-bold text-[#E9C75A] hover:bg-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploadBusy ? "Uploading…" : "⤴ Upload logo"}
                      </button>
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-[11px] text-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={uploadRights}
                        onChange={(e) => setUploadRights(e.target.checked)}
                        className="accent-[#D4AF37]"
                      />
                      I own the rights to this image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadLogo(f);
                        e.target.value = "";
                      }}
                    />
                    {uploadMessage && (
                      <p className={`mt-2 text-[11px] ${uploadMessage.startsWith("✓") ? "text-secondary" : "text-red-400"}`}>
                        {uploadMessage}
                      </p>
                    )}
                  </>
                ) : (
                  <a href="/pricing" className="flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#E9C75A]">⭐ Bring your own logo</p>
                      <p className="text-[11px] text-faint mt-0.5">
                        Upload your real logo and stamp it on everything you create.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-[#D4AF37]/50 px-2.5 py-1.5 text-[11px] font-bold text-[#E9C75A] group-hover:bg-[#D4AF37]/15 transition-colors">
                      🔒 Creator Pro
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image type tabs */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
            What to Create
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {IMAGE_TYPES.map(({ key, label, desc }) => (
              <button key={key} onClick={() => {
                setImageType(key);
                setModelKey(RECOMMENDED_MODEL[key]);
                // Auto style chip: set the type's default; clear a previous auto-chip
                // when leaving its type (manual picks for other types are respected)
                setStyleChip((prev) => AUTO_STYLE_CHIP[key] ?? (prev && Object.values(AUTO_STYLE_CHIP).includes(prev) ? null : prev));
              }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  imageType === key
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 bg-white/3 text-muted hover:border-primary/40"
                }`}
              >
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-faint mt-0.5">{desc}</div>
              </button>
            ))}
          </div>

          {/* Product focus — only for Product Art: name the exact product and
              Nix cooks the prompt around it instead of guessing. */}
          {imageType === "product_art" && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/3 p-3.5 space-y-2.5">
              <label className="block text-xs uppercase tracking-widest text-primary-light font-bold">
                What&rsquo;s the product? <span className="normal-case font-normal text-faint tracking-normal">(optional — Nix improvises if blank)</span>
              </label>
              <input
                type="text"
                value={productFocus}
                onChange={(e) => setProductFocus(e.target.value)}
                maxLength={80}
                placeholder="e.g. coffee bag, skateboard deck, hoodie, supplement jar…"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-faint focus:outline-none focus:border-primary/50"
              />
              <div className="flex flex-wrap gap-1.5">
                {["T-shirt", "Hoodie", "Coffee bag", "Bottle", "Packaging box", "Poster", "Sticker", "Phone case"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => { playButtonPress(); setProductFocus(chip.toLowerCase()); }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      productFocus.toLowerCase() === chip.toLowerCase()
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/5 text-muted hover:border-primary/40 hover:text-white"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brand name in the art — OPT-IN (July 11 2026). Default OFF: the
              model paints garbled fake wordmarks; clean art + logo stamp wins. */}
          {selectedBrandId && (imageType === "product_art" || imageType === "social_graphic") && (
            <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-white/10 bg-white/3 px-4 py-2.5">
              <input
                type="checkbox"
                checked={showBrandName}
                onChange={(e) => { playButtonPress(); setShowBrandName(e.target.checked); }}
                className="h-4 w-4 accent-[#8B5CF6]"
              />
              <span className="text-xs text-muted">
                <span className="font-semibold text-primary-light">✍️ Put my brand name on it</span>
                {" "}— AI-drawn text can look off; leave this off for clean art and use the logo stamp instead
              </span>
            </label>
          )}

          {/* Official-logo stamp toggle — only when the brand has an official
              logo and this creation type would get stamped. */}
          {stampToggleVisible && (
            <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-2.5">
              <input
                type="checkbox"
                checked={stampLogo}
                onChange={(e) => setStampLogo(e.target.checked)}
                className="h-4 w-4 accent-[#D4AF37]"
              />
              <span className="text-xs text-muted">
                <span className="font-semibold text-[#E9C75A]">⭐ Stamp my official logo</span>
                {" "}on this creation (bottom-right watermark)
              </span>
            </label>
          )}
        </div>

        {/* Prompt textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-widest text-primary-light font-bold">Prompt</label>
            <button
              onClick={async () => {
                playButtonPress();
                seedRef.current = generateSeed();
                const cooked = await cookPrompt(imageType);
                if (cooked) setPrompt(cooked);
              }}
              disabled={isCooking}
              className="text-xs text-secondary hover:text-white transition-colors disabled:opacity-50"
            >
              {isCooking ? "✨ Nix is cooking…" : "✨ Re-cook"}
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => {
              seedRef.current = generateSeed(); // manual edit = new creative intent
              setPrompt(e.target.value);
            }}
            placeholder={isCooking ? "✨ Nix is writing your prompt…" : "Describe what to create, or let Nix write it for you."}
            rows={3}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-faint focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>

        {/* Idea sparks */}
        <p className="text-xs text-muted -mt-2">
          <span className="text-faint font-medium mr-1">Not sure? Try:</span>
          {IDEA_SPARKS.map((spark, i) => (
            <span key={spark.label}>
              <button onClick={() => handleSpark(spark)} disabled={isCooking}
                className="text-secondary hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
              >{spark.label}</button>
              {i < IDEA_SPARKS.length - 1 && <span className="mx-1 text-faint">·</span>}
            </span>
          ))}
        </p>

        {/* Style chips — Cooker 2.0: one-tap art direction, re-cooks the prompt */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
            Style <span className="normal-case tracking-normal font-normal text-faint">· optional, tap to toggle</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLE_CHIPS.map((chip) => {
              const selected = styleChip === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => { playButtonPress(); setStyleChip(selected ? null : chip.label); }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "border-secondary bg-secondary/15 text-secondary shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                      : "border-white/10 bg-white/3 text-muted hover:border-secondary/40 hover:text-white"
                  }`}
                >
                  {chip.emoji} {chip.label}{selected ? " ✓" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Engine selector — the specialist for the chosen asset type is
            auto-picked and badged; every engine stays available as an override */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
            Engine
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MODEL_OPTIONS.filter(({ nameOnOnly }) =>
              !nameOnOnly || (showBrandName && (imageType === "product_art" || imageType === "social_graphic"))
            ).map(({ key, label, desc, isAltEngine }) => {
              const cost = computeStudioEnergyCost(key, { width: pinnedSize.width, height: pinnedSize.height });
              const isRecommended =
                key === RECOMMENDED_MODEL[imageType] ||
                (key === "gpt_image_2" && showBrandName); // name ON = Print Pro is the pick
              return (
                <button key={key} onClick={() => setModelKey(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    modelKey === key
                      ? isAltEngine
                        ? "border-amber-400/50 bg-amber-400/10 text-white"
                        : "border-secondary bg-secondary/10 text-white"
                      : "border-white/10 bg-white/3 text-muted hover:border-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold">{label}</span>
                    {isRecommended && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-secondary border border-secondary/40 rounded px-1 leading-4">
                        ✨ Best for this
                      </span>
                    )}
                    {isAltEngine && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 border border-amber-400/40 rounded px-1 leading-4">
                        ALT
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-faint mt-0.5">{desc}</div>
                  <div className="text-xs text-secondary mt-1">⚡ {cost} energy</div>
                </button>
              );
            })}
          </div>
          {modelKey === "seedream_v45" && (
            <p className="mt-2 text-xs text-amber-400/80">
              ⚠ Artistic uses a different AI engine — it will reimagine your prompt with a painterly style, not just improve quality.
            </p>
          )}
          {modelKey === "recraft_v3" && selectedBrandId && (
            <p className="mt-2 text-xs text-secondary/80">
              🎨 Design Pro receives your brand&apos;s exact palette colors — expect the closest color match of any engine.
            </p>
          )}
        </div>

        {/* Resolution badge */}
        <div className="text-xs text-faint">
          Output: {pinnedSize.label} — {pinnedSize.width}×{pinnedSize.height}px
        </div>

        {/* Conjure ×2 — two seeds, pick the winner (Wow Plan Phase 3) */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-muted">
          <input
            type="checkbox"
            checked={conjureTwo}
            onChange={(e) => setConjureTwo(e.target.checked)}
            className="h-4 w-4 accent-[#7c3aed]"
          />
          <span>
            🎲 Conjure <span className="font-bold text-white">2 variants</span> — pick your favorite{" "}
            <span className="text-secondary font-semibold">⚡ {energyCost * 2} energy</span>
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Conjure button — orange, magnetic, the most visible thing on the page */}
        <button
          onClick={handleGenerate}
          disabled={generating || isCooking || activeJobs.length + (conjureTwo ? 2 : 1) > 2}
          className="w-full rounded-2xl py-4 text-base font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_20px_rgba(255,107,53,0.45),0_0_40px_rgba(255,107,53,0.2)] motion-safe:animate-conjure-pulse disabled:opacity-60 disabled:cursor-not-allowed transition-opacity hover:opacity-90 active:opacity-80"
        >
          {generating
            ? "Submitting…"
            : isCooking
            ? "✨ Nix is writing your prompt…"
            : activeJobs.length >= 2
            ? "⏳ Generating… (2 active)"
            : `⚡ Conjure for ${energyCost} energy`}
        </button>
      </div>

      {/* ── Nix performing ────────────────────────────────────────────────────── */}
      {activeJobs.length > 0 && <NixCooking count={activeJobs.length} />}

      {/* ── Completed jobs — brand-scoped trophy case ─────────────────────────  */}
      {brandCompletedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h2 className="text-xs uppercase tracking-widest text-primary-light font-bold">
              {selectedBrandId ? `${selectedBrandName} Creations` : "Freeform Creations"} ({brandCompletedJobs.length})
            </h2>
            {/* All / Favorites / Hidden filter tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={() => setGalleryTab("all")}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  galleryTab === "all" ? "bg-white/10 text-white" : "text-muted hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGalleryTab("favorites")}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  galleryTab === "favorites" ? "bg-amber-400/15 text-amber-300" : "text-muted hover:text-white"
                }`}
              >
                {FAVORITES_LABEL} ({favoriteCount})
              </button>
              {hiddenCount > 0 && (
                <button
                  onClick={() => setGalleryTab("hidden")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    galleryTab === "hidden" ? "bg-white/10 text-white/70" : "text-faint hover:text-white"
                  }`}
                  title="Creations you've hidden — restore any time"
                >
                  Hidden ({hiddenCount})
                </button>
              )}
            </div>
          </div>

          {completedJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onMoreLikeThis={handleMoreLikeThis}
                  onProcess={handleProcess}
                  onShareSuccess={handleShareSuccess}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleArchive={handleToggleArchive}
                  onSetOfficialLogo={handleSetOfficialLogo}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-faint py-6 text-center">
              {galleryTab === "hidden"
                ? "Nothing hidden — tap the ✕ on any creation to tuck it away here."
                : `No favorites yet — tap the ☆ on any creation to add it to ${FAVORITES_LABEL}.`}
            </p>
          )}
        </div>
      )}

      {/* ── Failed jobs ───────────────────────────────────────────────────────  */}
      <AnimatePresence>
        {failedJobs.slice(0, 3).map((job) => (
          <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3"
          >
            <Image src="/nix/sleeping-nix.png" alt="Nix sleeping" width={48} height={48} className="object-contain shrink-0" />
            <p className="text-sm text-red-400">
              {job.error_message ?? "That one fizzled — your energy's back. ⚡"}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────────────────────────────────────  */}
      {jobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-16">
          <Image src="/nix/conjuring-nix.png" alt="Nix ready to create"
            width={100} height={100} className="mx-auto mb-4 object-contain opacity-60"
          />
          <p className="text-sm text-faint">
            Pick an image type above and hit Conjure to create your first Studio image.
          </p>
        </div>
      )}
    </div>
  );
}
