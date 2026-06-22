"use client";

import { useState } from "react";

interface AdminJob {
  id: string;
  output_url: string | null;
  image_type: string | null;
  brand_name: string;
  featured: boolean;
}

interface Props {
  jobs: AdminJob[];
}

export default function ShowcaseAdmin({ jobs }: Props) {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(jobs.map((j) => [j.id, j.featured]))
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(id: string) {
    if (busy) return;
    const next = !state[id];
    setState((s) => ({ ...s, [id]: next })); // optimistic
    setBusy(id);
    try {
      const res = await fetch("/api/admin/showcase-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, featured: next }),
      });
      if (!res.ok) setState((s) => ({ ...s, [id]: !next })); // revert
    } catch {
      setState((s) => ({ ...s, [id]: !next })); // revert
    } finally {
      setBusy(null);
    }
  }

  if (!jobs.length) {
    return (
      <p className="text-sm text-muted">
        No completed image creations on your account yet — make a few in Studio, then feature the best here.
      </p>
    );
  }

  const featuredCount = Object.values(state).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <p className="text-xs text-faint">
        {featuredCount} featured · only your own creations can be featured (consent rule).
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {jobs.map((job) => {
          const on = state[job.id];
          return (
            <button
              key={job.id}
              onClick={() => toggle(job.id)}
              disabled={busy === job.id}
              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all disabled:opacity-60 ${
                on ? "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.5)]" : "border-white/10 hover:border-white/30"
              }`}
              title={on ? "Featured — click to remove" : "Click to feature in showcase"}
            >
              {job.output_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.output_url} alt={job.brand_name} className="h-full w-full object-cover" />
              )}
              <span className={`absolute top-1 right-1 text-sm ${on ? "drop-shadow-[0_0_5px_rgba(251,191,36,0.9)]" : "opacity-60"}`}>
                {on ? "⭐" : "☆"}
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white truncate">
                {job.brand_name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
