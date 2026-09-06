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

// Creator Max ($49/mo, Sept 2026). Every line is REAL today (Agency Edition
// lesson: never list what isn't built). Labs video joins this list the day it ships.
const MAX_FEATURES = [
  "4,000 Creative Energy every month (4x Pro)",
  "Nix runs on Claude's strongest model for your kits and content",
  "Unused monthly energy rolls over to next month",
  "Up to 4 Studio generations running at once",
  "+30% bonus energy on every top-up pack",
  "Everything in Creator Pro",
  "First access to every new tool as it launches",
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
  variant,
}: {
  plan: "pro" | "max" | null;
  cta: string;
  highlight: boolean;
  user: User | null;
  /** Visual variant: "primary" (green), "secondary" (outline), "ink" (dark card). */
  variant?: "primary" | "secondary" | "ink";
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
        className={
          variant === "ink"
            ? "inline-flex items-center justify-center rounded-[0.875rem] bg-paper px-8 py-4 text-base font-bold text-ink hover:bg-white transition-colors disabled:opacity-60"
            : (variant === "primary" || highlight) ? "btn-primary" : "btn-secondary"
        }
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
        <div className="mx-auto max-w-5xl text-center">
          <span className="eyebrow mb-6">Pricing</span>
          <h1 className="section-heading mb-5 text-4xl sm:text-5xl">
            Simple pricing. <span className="accent">Serious value.</span>
          </h1>
          <p className="section-sub mb-14">
            Start free. Upgrade when your brand starts making you money.
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ── Creator Max (the anchor: most expensive first) ── */}
            <div className="relative flex flex-col rounded-[1.25rem] bg-ink p-7 text-left text-paper shadow-[0_24px_48px_-24px_rgba(20,21,24,0.6)] lg:order-1">
              <div
                className="pointer-events-none absolute inset-0 rounded-[1.25rem]"
                style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(46,125,91,0.35) 0%, transparent 60%)" }}
              />
              <div className="relative flex flex-1 flex-col">
                <span className="mb-4 self-start rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-bold tracking-wide text-gold">
                  Maximum value
                </span>
                <h3 className="font-display text-2xl font-semibold">Creator Max</h3>
                <p className="mt-0.5 mb-0.5 text-xs font-semibold text-emerald-300">For people who ship every week</p>
                <p className="mt-1 mb-5 text-sm text-paper/70">Four times the energy, Nix at full power, and first access to everything new.</p>
                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-semibold tracking-tight">$49</span>
                  <span className="text-sm text-paper/55">/month</span>
                </div>
                <ul className="mb-8 flex-1 space-y-2.5">
                  {MAX_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-paper/85">
                      <span className="mt-0.5 shrink-0 font-bold text-emerald-300">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <PlanButton plan="max" cta="Go Creator Max" highlight={false} user={user} variant="ink" />
              </div>
            </div>

            {/* ── Free ── */}
            <div className="bg-card bg-card-hover flex flex-col p-7 text-left lg:order-3">
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
            <div className="bg-card bg-card-hover flex flex-col p-7 text-left !border-goblin/60 ring-1 ring-goblin/30 lg:order-2">
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
            Free to start, no credit card. Cancel Pro or Max anytime; top up energy whenever you like.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
