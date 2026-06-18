"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgencyWaitlistModal from "@/components/AgencyWaitlistModal";
import type { User } from "@supabase/supabase-js";

const FREE_FEATURES = [
  "One complete brand generation",
  "10 brand names",
  "Tagline",
  "Brand story",
  "Logo prompts",
  "Social bios",
  "Launch content",
];

const PRO_FEATURES = [
  "Unlimited content generations",
  "Additional social media posts",
  "Blog posts",
  "Email campaigns",
  "Ad copy",
  "Product descriptions",
  "Marketing ideas",
  "Continuous content engine",
];

const AGENCY_FEATURES = [
  "Multi-client workspaces",
  "White-label reports",
  "Team collaboration",
  "Exportable brand kits",
  "Higher usage limits",
  "Agency dashboard",
  "Shared client projects",
];

function PlanButton({
  plan,
  cta,
  highlight,
  user,
}: {
  plan: string | null;
  cta: string;
  highlight: boolean;
  user: User | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) {
    return (
      <Link href={user ? "/generate" : "/signup"} className="btn-secondary text-center">
        {user ? "Generate a brand" : cta}
      </Link>
    );
  }

  async function handleCheckout() {
    if (!user) { window.location.href = "/signup"; return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={highlight ? "btn-primary" : "btn-secondary"}
      >
        {loading ? "Redirecting..." : cta}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {showWaitlist && <AgencyWaitlistModal onClose={() => setShowWaitlist(false)} />}

      <main className="flex-1 px-4 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <span className="badge-green mb-6">✦ Pricing</span>
          <h1 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h1>
          <p className="section-sub mb-16">
            Start free. Upgrade when your brand starts making you money.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            {/* ── Free ── */}
            <div className="bg-card bg-card-hover flex flex-col p-6 text-left">
              <h3 className="font-display text-xl font-bold text-white">Free</h3>
              <p className="mt-1 mb-4 text-sm text-muted">Try the magic before you commit.</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-white">$0</span>
                <span className="text-sm text-faint">forever</span>
              </div>
              <ul className="mb-8 flex-1 space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-secondary mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <PlanButton plan={null} cta="Generate My Brand" highlight={false} user={user} />
            </div>

            {/* ── Creator Pro ── */}
            <div className="bg-card bg-card-hover flex flex-col p-6 text-left border-primary/50 shadow-glow">
              <span className="badge-purple mb-4 self-start">Most popular</span>
              <h3 className="font-display text-xl font-bold text-white">Creator Pro</h3>
              <p className="mt-1 mb-4 text-sm text-muted">For founders building and growing real brands.</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black text-white">$19</span>
                <span className="text-sm text-faint">/month</span>
              </div>
              <ul className="mb-8 flex-1 space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-secondary mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <PlanButton plan="pro" cta="Upgrade to Creator Pro" highlight={true} user={user} />
            </div>

            {/* ── Agency Edition (Coming Soon) ── */}
            <div className="relative flex flex-col p-6 text-left rounded-2xl border-2 border-dashed border-[rgba(139,92,246,0.3)] bg-[rgba(10,10,15,0.6)] opacity-90">
              {/* Coming Soon badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-0.5 text-xs font-bold text-yellow-400 tracking-widest uppercase">
                  🚧 Coming Soon
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-xl font-bold text-white">Agency Edition</h3>
              </div>
              <p className="mt-1 mb-4 text-sm text-muted">
                For freelancers, consultants, and agencies managing multiple brands.
              </p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-display text-2xl font-black text-faint">Coming Soon</span>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {AGENCY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted/70">
                    <span className="text-primary/50 mt-0.5 shrink-0">✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowWaitlist(true)}
                className="w-full rounded-xl border border-primary/30 bg-primary/10 py-3 text-sm font-semibold text-primary-light transition hover:bg-primary/20 hover:border-primary/50"
              >
                Join Waitlist
              </button>

              {/* Goblin Labs label */}
              <p className="mt-4 text-center text-xs text-faint">
                🧌 Goblin Labs · Help us shape Agency Edition.{" "}
                <button
                  onClick={() => setShowWaitlist(true)}
                  className="text-primary-light underline-offset-2 hover:underline"
                >
                  Join the waitlist.
                </button>
              </p>
            </div>

          </div>

          {/* FAQ / reassurance line */}
          <p className="mt-12 text-sm text-faint">
            No hidden fees. Cancel Creator Pro anytime. Agency Edition is invite-only at launch.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
