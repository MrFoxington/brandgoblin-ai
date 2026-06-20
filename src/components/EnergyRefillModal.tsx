"use client";

import { useState } from "react";

interface RefillPack {
  priceId: string;
  energy: number;
  price: string;
  label: string;
  badge?: string;
}

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  isEmpty?:  boolean;
}

export default function EnergyRefillModal({ isOpen, onClose, onSuccess, isEmpty }: Props) {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<string>(
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENERGY_REFILL ?? "starter"
  );

  if (!isOpen) return null;

  // Pack definitions — priceId sent to checkout, energy for display only
  const packs: RefillPack[] = [
    {
      priceId: "starter",   // resolved server-side to STRIPE_PRICE_ID_ENERGY_REFILL
      energy:  1000,
      price:   "$19",
      label:   "Starter",
    },
    {
      priceId: "value",     // resolved server-side to STRIPE_PRICE_ID_ENERGY_3000
      energy:  3000,
      price:   "$49",
      label:   "Value",
      badge:   "Best Value",
    },
    {
      priceId: "creator",   // resolved server-side to STRIPE_PRICE_ID_ENERGY_7000
      energy:  7000,
      price:   "$99",
      label:   "Creator",
    },
  ];

  // Map pack keys to env price IDs client-side isn't possible (env isn't exposed),
  // so we send a pack key and the server resolves it.
  async function handleRefill() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "energy_refill",
          packKey: selectedPack,          // server resolves this to the env price ID
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Couldn't connect to checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-primary/30 bg-[rgba(12,10,24,0.98)] p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-faint hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 text-3xl mb-3">
            ⚡
          </div>
          <h2 className="font-display text-2xl font-black text-white">
            {isEmpty ? "Nix needs a refill!" : "Top Up Creative Energy"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {isEmpty
              ? "You're out of Creative Energy. Refill instantly and keep the magic going."
              : "More energy means more images, social graphics, and blog posts. Pick your pack."}
          </p>
        </div>

        {/* Pack selector */}
        <div className="mb-6 space-y-2">
          {packs.map((pack) => (
            <button
              key={pack.priceId}
              onClick={() => setSelectedPack(pack.priceId)}
              className={`w-full rounded-2xl border p-4 flex items-center justify-between text-left transition-all ${
                selectedPack === pack.priceId
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/3 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${
                  selectedPack === pack.priceId
                    ? "border-primary bg-primary"
                    : "border-white/20"
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{pack.label}</span>
                    {pack.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold">
                        {pack.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-faint">⚡ {pack.energy.toLocaleString()} energy</span>
                </div>
              </div>
              <span className="font-display text-xl font-black text-white">{pack.price}</span>
            </button>
          ))}
        </div>

        <p className="mb-6 text-center text-xs text-faint">
          One-time purchase · Your Creator Pro subscription stays the same
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleRefill}
          disabled={loading}
          className="w-full btn-primary py-4 text-base font-bold disabled:opacity-60"
        >
          {loading ? "Opening checkout…" : `⚡ Refill — ${packs.find((p) => p.priceId === selectedPack)?.price}`}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-sm text-faint hover:text-muted transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
