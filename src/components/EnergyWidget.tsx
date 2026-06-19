"use client";

import { useEffect, useState, useCallback } from "react";
import EnergyRefillModal from "@/components/EnergyRefillModal";

interface EnergyData {
  plan: string;
  totalRemaining: number;
  monthlyAllowance: number;
  percentRemaining: number;
  warningLevel: "low" | "critical" | "empty" | null;
  estimates: string[];
  periodEnd: string | null;
}

export default function EnergyWidget() {
  const [energy, setEnergy]       = useState<EnergyData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchEnergy = useCallback(async () => {
    try {
      const res = await fetch("/api/energy/balance");
      if (res.ok) setEnergy(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnergy(); }, [fetchEnergy]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="h-3 w-full bg-white/10 rounded mb-2" />
        <div className="h-3 w-2/3 bg-white/10 rounded" />
      </div>
    );
  }

  if (!energy || energy.plan === "free") {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center">
        <p className="text-2xl mb-2">⚡</p>
        <p className="text-sm font-semibold text-white mb-1">Creative Energy</p>
        <p className="text-xs text-muted mb-4">Upgrade to Creator Pro to unlock monthly Creative Energy.</p>
        <a href="/pricing" className="btn-primary text-sm px-4 py-2 inline-block">
          Upgrade to Creator Pro
        </a>
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, energy.percentRemaining));
  const barColor =
    energy.warningLevel === "empty"    ? "#ef4444" :
    energy.warningLevel === "critical" ? "#f97316" :
    energy.warningLevel === "low"      ? "#eab308" :
    "#8b5cf6";

  const warningMessages = {
    low:      { icon: "⚡", text: "Creative Energy running low. Nix still has some magic left, but you may want to refill soon." },
    critical: { icon: "⚡", text: "Almost out of Creative Energy. Refill anytime to keep creating." },
    empty:    { icon: "🔋", text: "Nix is out of Creative Energy for now. Refill instantly or wait for your next monthly reset." },
  };

  return (
    <>
      <div className="rounded-2xl border border-primary/20 bg-white/3 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-bold text-white">Creative Energy</span>
          </div>
          <span className="text-xs text-faint">Creator Pro</span>
        </div>

        {/* Warning banner */}
        {energy.warningLevel && (
          <div className={`mb-4 rounded-xl px-3 py-2 text-xs ${
            energy.warningLevel === "empty"
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : energy.warningLevel === "critical"
              ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
          }`}>
            {warningMessages[energy.warningLevel].icon} {warningMessages[energy.warningLevel].text}
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-muted">{pct}% remaining</span>
            <span className="text-xs text-faint">{(energy.totalRemaining ?? 0).toLocaleString()} / {(energy.monthlyAllowance ?? 0).toLocaleString()}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        {/* Capacity estimates */}
        {energy.estimates.length > 0 && (
          <div className="mt-4 rounded-xl bg-white/3 border border-white/8 p-3">
            <p className="text-xs text-faint mb-2">Enough energy for approximately:</p>
            <ul className="space-y-1">
              {energy.estimates.map((est) => (
                <li key={est} className="text-xs text-muted flex items-center gap-2">
                  <span className="text-primary-light">✦</span> {est}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Refill button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 w-full rounded-xl bg-primary/15 border border-primary/30 py-2.5 text-sm font-semibold text-primary-light hover:bg-primary/25 transition-colors"
        >
          ⚡ Refill Energy — $19
        </button>

        {energy.periodEnd && (
          <p className="mt-2 text-center text-xs text-faint">
            Resets {new Date(energy.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
      </div>

      <EnergyRefillModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); fetchEnergy(); }}
        isEmpty={energy.warningLevel === "empty"}
      />
    </>
  );
}
