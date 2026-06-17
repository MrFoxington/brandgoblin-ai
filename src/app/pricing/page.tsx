"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { User } from "@supabase/supabase-js";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try the magic before you commit.",
    features: ["3 brand generations", "Full 12-section brand kit", "Save to your vault", "Copy-to-clipboard"],
    cta: "Start free",
    plan: null,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For founders launching real brands.",
    features: ["Unlimited brand generations", "Unlimited saved brands", "Premium AI outputs", "Priority generation speed"],
    cta: "Get Pro",
    plan: "pro" as const,
    highlight: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/month",
    desc: "For agencies serving clients.",
    features: ["Everything in Pro", "Client-ready brand kits", "Bulk generation", "White-label-ready output"],
    cta: "Get Agency",
    plan: "agency" as const,
    highlight: false,
  },
];

function PlanButton({ plan, cta, highlight }: { plan: string | null; cta: string; highlight: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  if (!plan) {
    return (
      <Link href={user ? "/generate" : "/signup"} className="btn-secondary text-center">
        {user ? "Generate a brand" : cta}
      </Link>
    );
  }

  async function handleCheckout() {
    if (!user) {
      window.location.href = "/signup";
      return;
    }
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
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="badge-green mb-6">✦ Pricing</span>
          <h1 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h1>
          <p className="section-sub mb-16">
            Start free. Upgrade when your brand starts making you money.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`bg-card bg-card-hover flex flex-col p-6 text-left ${
                  p.highlight ? "border-primary/50 shadow-glow" : ""
                }`}
              >
                {p.highlight && (
                  <span className="badge-purple mb-4 self-start">Most popular</span>
                )}
                <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
                <p className="mt-1 mb-4 text-sm text-muted">{p.desc}</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-white">{p.price}</span>
                  <span className="text-sm text-faint">{p.period}</span>
                </div>
                <ul className="mb-8 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-secondary mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <PlanButton plan={p.plan} cta={p.cta} highlight={p.highlight} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
