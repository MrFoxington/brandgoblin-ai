"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RefillSuccessBanner() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      router.replace("/dashboard/creator-pro");
    }, 5000);
    return () => clearTimeout(t);
  }, [router]);

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-300 animate-fade-in">
      <span className="text-xl shrink-0">⚡</span>
      <div>
        <p className="font-semibold text-sm">Creative Energy refilled!</p>
        <p className="text-xs text-green-400/80 mt-0.5">Nix is recharged and ready to create. Keep the magic going.</p>
      </div>
    </div>
  );
}
