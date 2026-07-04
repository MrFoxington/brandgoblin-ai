"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { User } from "@supabase/supabase-js";

const FREE_FEATURES = [
  "Generate your brand — names, story, voice, colors, logo direction",
  "Try Goblin Studio free — logos, social graphics & product art",
  "Creative Energy included to get started",
  "Free Nix stickers & wallpapers",
  "No credit card, ever",
];

const PRO_FEATURES = [
  "Unlimited brand generations",
  "Full content engine — social, blogs, emails & ads",
  "Monthly Creative Energy for Goblin Studio",
  "Bring your own logo — stamped on every product art & social graphic",
  "Product descriptions, headlines & campaign ideas",
  "Content calendars & brand voice tools",
  "Top up energy anytime for $19",
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
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge-green mb-6">✦ Pricing</span>
          <h1 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h1>
          <p className="section-sub mb-16">
            Start free. Upgrade when your brand starts making you money.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* ── Free ── */}
            <div className="bg-card bg-card-hover flex flex-col p-6 text-left">
              <h3 className="font-display text-xl font-bold text-white">Free</h3>
              <p className="mt-1 mb-4 text-sm text-muted">Create your brand and taste Goblin Studio — free.</p>
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
              <PlanButton plan={null} cta="Start Creating — Free" highlight={false} user={user} />
            </div>

            {/* ── Creator Pro ── */}
            <div className="bg-card bg-card-hover flex flex-col p-6 text-left border-primary/50 shadow-glow">
              <span className="badge-purple mb-4 self-start">Most popular</span>
              <h3 className="font-display text-xl font-bold text-white">Creator Pro</h3>
              <p className="mt-0.5 mb-0.5 text-xs font-semibold text-secondary">Your AI Marketing Department</p>
              <p className="mt-1 mb-4 text-sm text-muted">Monthly Creative Energy included. Your AI copywriter, social manager, and content strategist — all in one.</p>
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

          </div>

          {/* Reassurance line */}
          <p className="mt-12 text-sm text-faint">
            Genuinely free to start — no credit card. Cancel Creator Pro anytime; top up energy whenever you like.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
