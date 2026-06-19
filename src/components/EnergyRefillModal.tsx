"use client";

import { useState } from "react";

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  isEmpty?:  boolean;
}

export default function EnergyRefillModal({ isOpen, onClose, onSuccess, isEmpty }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleRefill() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "energy_refill" }),
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
            {isEmpty ? "Nix needs a refill!" : "Need More Creative Energy?"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {isEmpty
              ? "Nix is out of Creative Energy for now. Refill instantly and keep the magic going."
              : "You've used most of this month's Creative Energy. Refill instantly and keep creating with Nix."}
          </p>
        </div>

        {/* What you get */}
        <div className="mb-6 rounded-2xl bg-primary/8 border border-primary/20 p-4">
          <p className="text-xs uppercase tracking-widest text-primary-light font-bold mb-3">
            What you get
          </p>
          <ul className="space-y-2">
            {[
              "Another full month of Creator Pro energy",
              "Unlimited tool access while energy lasts",
              "Social posts, blogs, emails, ads & more",
              "Applies to your account instantly",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <span className="text-secondary mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="mb-6 text-center">
          <span className="font-display text-4xl font-black text-white">$19</span>
          <span className="text-sm text-faint ml-2">one-time refill</span>
          <p className="mt-1 text-xs text-faint">
            Your Creator Pro subscription stays the same. This is a one-time refill.
          </p>
        </div>

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
          {loading ? "Opening checkout…" : "⚡ Refill Creative Energy"}
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
