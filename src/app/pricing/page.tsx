"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import MarketingShell from "@/components/marketing/MarketingShell";
import type { User } from "@supabase/supabase-js";

const FREE_FEATURES = [
  "Generate your brand: names, story, voice, colors, logo direction",
  "Try Goblin Studio free: logos, social graphics & product art",
  "Creative Energy included to get started",
  "Free Nix stickers & wallpapers",
  "No credit card, ever",
];

const PRO_FEATURES = [
  "Unlimited brand generations",
  "Full content engine: social, blogs, emails & ads",
  "Monthly Creative Energy for Goblin Studio",
  "Bring your own logo, stamped on every product art & social graphic",
  "Product descriptions, headlines & campaign ideas",
  "Content calendars & brand voice tools",
  "Top up energy anytime, packs from $19",
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
      {error && <p className="text-xs text-red-700 text-center">{error}</p>}
    </div>
  );
}

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  return (
    <MarketingShell>
      <main className="flex-1 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow mb-6">Pricing</span>
          <h1 className="section-heading mb-5 text-4xl sm:text-5xl">
            Simple pricing. <span className="accent">Serious value.</span>
          </h1>
          <p className="section-sub mb-14">
            Start free. Upgrade when your brand starts making you money.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* ── Free ── */}
            <div className="bg-card bg-card-hover flex flex-col p-7 text-left">
              <h3 className="font-display text-2xl font-semibold text-ink">Free</h3>
              <p className="mt-1 mb-5 text-sm text-ink-muted">Create your brand and taste Goblin Studio. Free.</p>
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-ink tracking-tight">$0</span>
                <span className="text-sm text-ink-faint">forever</span>
              </div>
              <ul className="mb-8 flex-1 space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <span className="text-goblin mt-0.5 shrink-0 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <PlanButton plan={null} cta="Start free. No card needed." highlight={false} user={user} />
            </div>

            {/* ── Creator Pro ── */}
            <div className="bg-card bg-card-hover flex flex-col p-7 text-left !border-goblin/60 ring-1 ring-goblin/30">
              <span className="badge-goblin mb-4 self-start">Most popular</span>
              <h3 className="font-display text-2xl font-semibold text-ink">Creator Pro</h3>
              <p className="mt-0.5 mb-0.5 text-xs font-semibold text-goblin">Your AI Marketing Department</p>
              <p className="mt-1 mb-5 text-sm text-ink-muted">Monthly Creative Energy included. Your AI copywriter, social manager, and content strategist, all in one.</p>
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-ink tracking-tight">$19</span>
                <span className="text-sm text-ink-faint">/month</span>
              </div>
              <ul className="mb-8 flex-1 space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <span className="text-goblin mt-0.5 shrink-0 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <PlanButton plan="pro" cta="Upgrade to Creator Pro" highlight={true} user={user} />
            </div>

          </div>

          {/* The possession promise (the CapCut rule, in public). */}
          <p className="mt-12 font-display text-xl text-ink">
            Anything you finish is yours. <span className="accent">Every plan, forever.</span>
          </p>
          <p className="mt-3 text-sm text-ink-faint">
            Free to start, no credit card. Cancel Creator Pro anytime; top up energy whenever you like.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
