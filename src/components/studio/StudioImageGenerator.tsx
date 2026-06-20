"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { computeStudioEnergyCost, IMAGE_TYPE_SIZES, STUDIO_MODELS } from "@/lib/energy-config";
import type { StudioModelKey, ImageType } from "@/lib/energy-config";
import JobCard from "./JobCard";
import type { BrandGenerationRow } from "@/types";
import type { StudioJobRow } from "@/lib/studio/jobs";

interface Props {
  brands: Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];
  initialJobs: StudioJobRow[];
}

const IMAGE_TYPES: { key: ImageType; label: string; desc: string }[] = [
  { key: "logo_concept",   label: "Logo Concept",   desc: "Icon mark from your brand direction" },
  { key: "social_graphic", label: "Social Graphic", desc: "Branded post image for social" },
  { key: "product_art",    label: "Product Art",    desc: "Hero imagery for your brand" },
];

// Only the models enabled for Phase 1 image generation
const MODEL_OPTIONS: { key: StudioModelKey; label: string; desc: string }[] = [
  { key: "flux_schnell", label: "Standard",  desc: "Fast & sharp" },
  { key: "flux_pro_v1",  label: "Premium",   desc: "Highest quality" },
  { key: "seedream_v45", label: "Artistic",  desc: "Creative style variety" },
];

const POLL_INTERVAL_MS = 3000;

export default function StudioImageGenerator({ brands, initialJobs }: Props) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id ?? "");
  const [imageType, setImageType]   = useState<ImageType>("logo_concept");
  const [modelKey, setModelKey]     = useState<StudioModelKey>("flux_schnell");
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [jobs, setJobs]             = useState<StudioJobRow[]>(initialJobs);
  const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Energy cost derived from registry — never hardcoded
  const pinnedSize = IMAGE_TYPE_SIZES[imageType];
  const energyCost = computeStudioEnergyCost(modelKey, {
    width:  pinnedSize.width,
    height: pinnedSize.height,
  });

  // On mount: resume polling for any active jobs passed from the server
  useEffect(() => {
    initialJobs
      .filter((j) => j.status === "running" || j.status === "pending")
      .forEach((j) => startPolling(j.id));
    return () => stopAllPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPolling = useCallback((jobId: string) => {
    if (pollTimers.current.has(jobId)) return;
    const timer = setInterval(() => pollJob(jobId), POLL_INTERVAL_MS);
    pollTimers.current.set(jobId, timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopPolling = useCallback((jobId: string) => {
    const t = pollTimers.current.get(jobId);
    if (t) { clearInterval(t); pollTimers.current.delete(jobId); }
  }, []);

  const stopAllPolling = useCallback(() => {
    pollTimers.current.forEach((t) => clearInterval(t));
    pollTimers.current.clear();
  }, []);

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/studio/jobs/${jobId}`);
      if (!res.ok) return;
      const updated: StudioJobRow = await res.json();
      setJobs((prev) => prev.map((j) => j.id === jobId ? updated : j));

      const isTerminal = ["completed", "failed", "cancelled", "moderation_blocked"].includes(updated.status);
      if (isTerminal) stopPolling(jobId);
    } catch {
      // Ignore transient network errors — keep polling
    }
  }, [stopPolling]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/studio/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelKey,
          imageType,
          brandId: selectedBrandId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresRefill) {
          setError(`Not enough Creative Energy (need ⚡${energyCost}, have ⚡${data.totalRemaining ?? 0}). Refill to keep creating.`);
        } else if (data.requiresUpgrade) {
          setError(data.error);
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      // Add the new job and start polling it
      const newJob: StudioJobRow = {
        id: data.jobId,
        user_id: "",
        brand_id: selectedBrandId || null,
        job_type: "image",
        model_key: modelKey,
        image_type: imageType,
        image_size: pinnedSize.falSize,
        energy_reserved: energyCost,
        status: "running",
        provider: data.provider ?? "fal",
        provider_job_id: null,
        prompt: null,
        output_url: null,
        storage_path: null,
        error_message: null,
        reservation_tx_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setJobs((prev) => [newJob, ...prev]);
      startPolling(data.jobId);
    } catch {
      setError("Couldn't connect to the generation service. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const activeJobs = jobs.filter((j) => j.status === "running" || j.status === "pending");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed" || j.status === "moderation_blocked");

  return (
    <div className="space-y-8">

      {/* ── Generation panel ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-primary/20 bg-card p-6 space-y-6">

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
                const name = (b.output_data as { recommendedName?: string })?.recommendedName
                  ?? (b.input_data as { businessIdea?: string })?.businessIdea
                  ?? "Brand";
                return (
                  <option key={b.id} value={b.id}>{name}</option>
                );
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

        {/* Model selector */}
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

        {/* Generate button */}
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

        {activeJobs.length > 0 && (
          <p className="text-xs text-center text-muted">
            {activeJobs.length} generation{activeJobs.length > 1 ? "s" : ""} running — Nix is on it ✦
          </p>
        )}
      </div>

      {/* ── Active jobs ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeJobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-primary/20 bg-card p-6 flex items-center gap-4"
          >
            <div className="shrink-0">
              <Image
                src="/nix/thinking-nix.png"
                alt="Nix thinking"
                width={64}
                height={64}
                className="object-contain animate-pulse"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Nix is conjuring your image…</p>
              <p className="text-xs text-muted mt-1">
                {IMAGE_TYPES.find((t) => t.key === job.image_type)?.label ?? job.image_type}
                {" · "}
                {MODEL_OPTIONS.find((m) => m.key === job.model_key)?.label ?? job.model_key}
                {" · "}
                ⚡ {job.energy_reserved} reserved
              </p>
            </div>
            <div className="ml-auto">
              <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Completed jobs ───────────────────────────────────────────────── */}
      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-primary-light font-bold mb-3">
            Your Creations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* ── Failed jobs ──────────────────────────────────────────────────── */}
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

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {jobs.length === 0 && (
        <div className="text-center py-16">
          <Image
            src="/nix/artist-nix.png"
            alt="Nix the artist"
            width={100}
            height={100}
            className="mx-auto mb-4 object-contain opacity-60"
            onError={(e) => {
              // artist-nix.png hasn't been uploaded yet — fall back to conjuring
              (e.target as HTMLImageElement).src = "/nix/conjuring-nix.png";
            }}
          />
          <p className="text-sm text-faint">
            Pick an image type above and hit Conjure to create your first Studio image.
          </p>
        </div>
      )}
    </div>
  );
}
