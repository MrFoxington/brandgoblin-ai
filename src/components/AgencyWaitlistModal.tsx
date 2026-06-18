"use client";

import { useState } from "react";

export default function AgencyWaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agency/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card w-full max-w-md rounded-2xl border border-primary/20 p-8 shadow-2xl">
        {success ? (
          <div className="text-center">
            <span className="text-5xl block mb-4">🎉</span>
            <h3 className="font-display text-xl font-extrabold text-white mb-2">
              You&rsquo;re on the list!
            </h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              We&rsquo;ll notify you at <span className="text-primary-light font-medium">{email}</span> the moment Agency Edition launches. The goblin appreciates your patience.
            </p>
            <button onClick={onClose} className="btn-primary w-full py-3">
              Got it
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-4xl block mb-3">🚀</span>
              <h3 className="font-display text-xl font-extrabold text-white mb-1">
                BrandGoblin Agency Edition
              </h3>
              <p className="text-xs text-secondary font-semibold tracking-widest uppercase mb-4">
                Coming Soon
              </p>
              <p className="text-sm text-muted leading-relaxed mb-4">
                We&rsquo;re building powerful tools for freelancers, consultants, and agencies.
              </p>
              <ul className="text-left space-y-2 mb-5">
                {[
                  "Multi-client dashboards",
                  "White-label brand kits",
                  "Team collaboration tools",
                  "Shared projects",
                  "Higher usage limits",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <span className="text-secondary shrink-0">✦</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted">
                Enter your email to be notified when Agency Edition launches.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-white placeholder:text-faint focus:border-primary/60 focus:outline-none"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Notify Me"}
              </button>
            </form>

            <button
              onClick={onClose}
              className="mt-3 w-full py-2 text-sm text-muted hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
