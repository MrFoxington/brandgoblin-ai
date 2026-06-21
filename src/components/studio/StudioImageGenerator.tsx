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

interface Props {
  brands: Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];
  initialJobs: StudioJobRow[];
}

const IMAGE_TYPES: { key: ImageType; label: string; desc: string }[] = [
  { key: "logo_concept",   label: "Logo Concept",   desc: "Icon mark from your brand direction" },
  { key: "social_graphic", label: "Social Graphic", desc: "Branded post image for social" },
  { key: "product_art",    label: "Product Art",    desc: "Hero imagery for your brand" },
];

// Standard first, Premium last (price anchor — cheap/abundant default)
const MODEL_OPTIONS: { key: StudioModelKey; label: string; desc: string }[] = [
  { key: "flux_schnell", label: "Standard", desc: "Fast & sharp" },
  { key: "seedream_v45", label: "Artistic",  desc: "Creative style variety" },
  { key: "flux_pro_v1",  label: "Premium",  desc: "Highest quality" },
];

const IDEA_SPARKS = [
  { label: "moody hero shot",      imageType: "product_art"  as ImageType, note: "moody, dramatic hero shot with cinematic lighting" },
  { label: "playful mascot scene", imageType: "logo_concept" as ImageType, note: "playful, fun mascot scene with vibrant colors" },
  { label: "minimalist logo card", imageType: "logo_concept" as ImageType, note: "clean minimalist logo on a simple card, lots of white space" },
  { label: "bold product flatlay", imageType: "product_art"  as ImageType, note: "bold product flatlay with colorful props and graphic styling" },
];

const SPARKLES = [
  { x: -110, y: -80,  d: 0    },
  { x:  100, y: -65,  d: 0.08 },
  { x:  -80, y:  55,  d: 0.16 },
  { x:  120, y:  45,  d: 0.12 },
  { x:    0, y: -120, d: 0.2  },
  { x: -140, y:   -5, d: 0.06 },
  { x:  140, y:  -15, d: 0.18 },
];

const POLL_INTERVAL_MS = 3000;

export default function StudioImageGenerator({ brands, initialJobs }: Props) {
  const { addXP }      = useXP();
  const { playComplete } = useSoundFx();
  const reduce         = useReducedMotion();

  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id ?? "");
  const [imageType, setImageType]   = useState<ImageType>("logo_concept");
  const [modelKey, setModelKey]     = useState<StudioModelKey>("flux_schnell"); // Default: Standard
  const [prompt, setPrompt]         = useState<string>("");
  const [isCooking, setIsCooking]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [jobs, setJobs]             = useState<StudioJobRow[]>(initialJobs);
  const [celebratingJob, setCelebratingJob] = useState<StudioJobRow | null>(null);
  const [streak, setStreak]         = useState(1);

  // Refs — stable across renders, prevent stale closures in timers
  const awardedXPJobs   = useRef<Set<string>>(new Set());
  const cookDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const suppressCookRef = useRef(false);
  const pollTimers      = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const pollJobRef      = useRef<(id: string) => Promise<void>>(() => Promise.resolve());
  const addXPRef        = useRef(addXP);
  const playCompleteRef = useRef(playComplete);

  useEffect(() => { addXPRef.current = addXP; },       [addXP]);
  useEffect(() => { playCompleteRef.current = playComplete; }, [playComplete]);

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

  // ── Polling helpers ────────────────────────────────────────────────────────

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
          playCompleteRef.current();
          setCelebratingJob(updated);
        }
      }
    } catch { /* ignore transient errors */ }
  }, [stopPolling]);

  useEffect(() => { pollJobRef.current = pollJob; }, [pollJob]);

  // Resume polling for in-flight jobs from SSR
  useEffect(() => {
    initialJobs
      .filter((j) => j.status === "running" || j.status === "pending")
      .forEach((j) => startPolling(j.id));
    return () => stopAllPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const pinnedSize    = IMAGE_TYPE_SIZES[imageType];
  const energyCost    = computeStudioEnergyCost(modelKey, { width: pinnedSize.width, height: pinnedSize.height });
  const activeJobs    = jobs.filter((j) => j.status === "running" || j.status === "pending");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs    = jobs.filter((j) => j.status === "failed" || j.status === "moderation_blocked");

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

  async function cookPrompt(type: ImageType, userNote?: string): Promise<string> {
    setIsCooking(true);
    try {
      const res = await fetch("/api/studio/cook-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrandId || undefined,
          imageType: type,
          userNote,
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

  // Auto-cook (debounced) when brand or type changes
  useEffect(() => {
    if (suppressCookRef.current) return;
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    cookDebounceRef.current = setTimeout(async () => {
      if (suppressCookRef.current) return;
      const cooked = await cookPrompt(imageType);
      if (cooked) setPrompt(cooked);
    }, 400);
    return () => {
      if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId, imageType]);

  // ── Job submission ─────────────────────────────────────────────────────────

  async function submitJob(jobPrompt: string, mk: StudioModelKey, it: ImageType) {
    setGenerating(true);
    setError(null);
    const ps   = IMAGE_TYPE_SIZES[it];
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
        }),
      });

      const data = (await res.json()) as {
        jobId?: string;
        provider?: string;
        error?: string;
        requiresRefill?: boolean;
        requiresUpgrade?: boolean;
        totalRemaining?: number;
      };

      if (!res.ok) {
        if (data.requiresRefill) {
          setError(`Not enough Creative Energy (need ⚡${cost}, have ⚡${data.totalRemaining ?? 0}). Refill to keep creating.`);
        } else if (data.requiresUpgrade) {
          setError(data.error ?? "Creator Pro required.");
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
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
        created_at:      new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      };
      setJobs((prev) => [newJob, ...prev]);
      startPolling(data.jobId!);
    } catch {
      setError("Couldn't connect to the generation service. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // ── CTA handlers ───────────────────────────────────────────────────────────

  async function handleGenerate() {
    await submitJob(prompt, modelKey, imageType);
  }

  function handleMakeAnother() {
    setCelebratingJob(null);
    requestAnimationFrame(() => {
      document.getElementById("studio-form")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  async function handleVariation(job: StudioJobRow) {
    setCelebratingJob(null);
    await submitJob(
      job.prompt ?? prompt,
      job.model_key as StudioModelKey,
      job.image_type as ImageType
    );
  }

  async function handleNewStyle(job: StudioJobRow) {
    setCelebratingJob(null);
    suppressCookRef.current = true;
    setImageType(job.image_type as ImageType);
    setModelKey(job.model_key as StudioModelKey);
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    try {
      const cooked = await cookPrompt(
        job.image_type as ImageType,
        "completely different stylistic twist and mood"
      );
      const finalPrompt = cooked || job.prompt || prompt;
      if (cooked) setPrompt(cooked);
      await submitJob(finalPrompt, job.model_key as StudioModelKey, job.image_type as ImageType);
    } finally {
      suppressCookRef.current = false;
    }
  }

  async function handleSpark(spark: (typeof IDEA_SPARKS)[number]) {
    suppressCookRef.current = true;
    setImageType(spark.imageType);
    if (cookDebounceRef.current) clearTimeout(cookDebounceRef.current);
    try {
      const cooked = await cookPrompt(spark.imageType, spark.note);
      if (cooked) setPrompt(cooked);
    } finally {
      suppressCookRef.current = false;
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Celebration overlay (fixed, full-screen) ────────────────────────── */}
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
              {/* Sparkle burst */}
              {!reduce && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {SPARKLES.map((s, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-xl select-none"
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0.4, 1.1, 0.6] }}
                      transition={{ duration: 1.1, delay: 0.3 + s.d, ease: "easeOut" }}
                    >
                      ✦
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Celebrating Nix */}
              <div className="mb-4 flex justify-center">
                <motion.div
                  animate={reduce ? {} : { y: [0, -8, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/nix/celebrating-nix.png"
                    alt="Nix celebrating your creation"
                    width={140}
                    height={140}
                    className="drop-shadow-[0_0_24px_rgba(139,92,246,0.5)]"
                    priority
                  />
                </motion.div>
              </div>

              <h2 className="font-display text-2xl font-black text-white mb-1">Boom — done! ✨</h2>
              <p className="text-sm text-secondary font-semibold mb-4">
                +10 XP · {streak}-day streak 🔥
              </p>

              {/* Thumbnail */}
              {celebratingJob.output_url && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={celebratingJob.output_url}
                    alt="Your creation"
                    className="h-32 w-32 rounded-xl object-cover border border-white/10 shadow-card"
                  />
                </div>
              )}

              {/* Post-reveal CTAs — the loop */}
              <div className="space-y-2.5 mb-4">
                <button
                  onClick={() => handleVariation(celebratingJob)}
                  disabled={generating || activeJobs.length >= 2}
                  className="w-full btn-primary py-3 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  🎨 Try a variation · ⚡{celebratingJobCost}
                </button>
                <button
                  onClick={() => handleNewStyle(celebratingJob)}
                  disabled={generating || activeJobs.length >= 2 || isCooking}
                  className="w-full rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm font-bold text-white hover:bg-secondary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  🪄 New style · ⚡{celebratingJobCost}
                </button>
                <button
                  onClick={handleMakeAnother}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  ✨ Make another
                </button>
              </div>

              <button
                onClick={() => setCelebratingJob(null)}
                className="text-xs text-muted hover:text-white transition-colors"
              >
                Close
              </button>
            </motion.div>
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
          </div>
        )}

        {/* Image type tabs */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
            What to Create
          </label>
          <div className="grid grid-cols-3 gap-2">
            {IMAGE_TYPES.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setImageType(key)}
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
        </div>

        {/* Prompt textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-widest text-primary-light font-bold">
              Prompt
            </label>
            <button
              onClick={async () => {
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
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              isCooking
                ? "✨ Nix is writing your prompt…"
                : "Describe what to create, or let Nix write it for you."
            }
            rows={3}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-faint focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>

        {/* Idea sparks */}
        <p className="text-xs text-muted -mt-2">
          <span className="text-faint font-medium mr-1">Not sure? Try:</span>
          {IDEA_SPARKS.map((spark, i) => (
            <span key={spark.label}>
              <button
                onClick={() => handleSpark(spark)}
                disabled={isCooking}
                className="text-secondary hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
              >
                {spark.label}
              </button>
              {i < IDEA_SPARKS.length - 1 && <span className="mx-1 text-faint">·</span>}
            </span>
          ))}
        </p>

        {/* Quality selector */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-primary-light font-bold mb-2">
            Quality
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MODEL_OPTIONS.map(({ key, label, desc }) => {
              const cost = computeStudioEnergyCost(key, { width: pinnedSize.width, height: pinnedSize.height });
              return (
                <button
                  key={key}
                  onClick={() => setModelKey(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    modelKey === key
                      ? "border-secondary bg-secondary/10 text-white"
                      : "border-white/10 bg-white/3 text-muted hover:border-secondary/40"
                  }`}
                >
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs text-faint mt-0.5">{desc}</div>
                  <div className="text-xs text-secondary mt-1">⚡ {cost} energy</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution badge */}
        <div className="text-xs text-faint">
          Output: {pinnedSize.label} — {pinnedSize.width}×{pinnedSize.height}px
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Conjure button — never blocked by cooking */}
        <button
          onClick={handleGenerate}
          disabled={generating || activeJobs.length >= 2}
          className="w-full btn-primary py-4 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating
            ? "Submitting…"
            : activeJobs.length >= 2
            ? "⏳ Generating… (2 active)"
            : `⚡ Conjure for ${energyCost} energy`}
        </button>
      </div>

      {/* ── Nix performing during active jobs ───────────────────────────────── */}
      {activeJobs.length > 0 && <NixCooking count={activeJobs.length} />}

      {/* ── Completed jobs — trophy case ─────────────────────────────────────  */}
      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-primary-light font-bold mb-3">
            Your Creations ({completedJobs.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* ── Failed jobs ───────────────────────────────────────────────────────  */}
      <AnimatePresence>
        {failedJobs.slice(0, 3).map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3"
          >
            <Image
              src="/nix/sleeping-nix.png"
              alt="Nix sleeping"
              width={48}
              height={48}
              className="object-contain shrink-0"
            />
            <p className="text-sm text-red-400">
              {job.error_message ?? "That one fizzled — your energy's back. ⚡"}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────────────────────────────────────  */}
      {jobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-16">
          <Image
            src="/nix/conjuring-nix.png"
            alt="Nix ready to create"
            width={100}
            height={100}
            className="mx-auto mb-4 object-contain opacity-60"
          />
          <p className="text-sm text-faint">
            Pick an image type above and hit Conjure to create your first Studio image.
          </p>
        </div>
      )}
    </div>
  );
}
