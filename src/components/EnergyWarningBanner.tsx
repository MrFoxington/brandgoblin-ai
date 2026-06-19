"use client";

import { useState } from "react";
import EnergyRefillModal from "@/components/EnergyRefillModal";

interface Props {
  warningLevel: "low" | "critical" | "empty";
  onRefillSuccess?: () => void;
}

const MESSAGES = {
  low: {
    icon: "⚡",
    text: "Creative Energy running low. Nix still has some magic left — refill anytime.",
    bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
    btn: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30",
  },
  critical: {
    icon: "⚡",
    text: "Almost out of Creative Energy. Refill now to keep creating.",
    bg: "bg-orange-500/10 border-orange-500/20 text-orange-300",
    btn: "bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30",
  },
  empty: {
    icon: "🔋",
    text: "Nix is out of Creative Energy. Refill instantly or wait for your next monthly reset.",
    bg: "bg-red-500/10 border-red-500/20 text-red-300",
    btn: "bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30",
  },
};

export default function EnergyWarningBanner({ warningLevel, onRefillSuccess }: Props) {
  const [showModal, setShowModal] = useState(false);
  const msg = MESSAGES[warningLevel];

  return (
    <>
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${msg.bg}`}>
        <span className="text-lg shrink-0">{msg.icon}</span>
        <p className="flex-1">{msg.text}</p>
        <button
          onClick={() => setShowModal(true)}
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${msg.btn}`}
        >
          Refill — $19
        </button>
      </div>

      <EnergyRefillModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          onRefillSuccess?.();
        }}
        isEmpty={warningLevel === "empty"}
      />
    </>
  );
}
