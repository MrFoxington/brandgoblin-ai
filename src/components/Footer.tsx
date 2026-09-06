"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import NixAvatar from "@/components/NixAvatar";

const ECOSYSTEM: { label: string; active: boolean; href?: string }[] = [
  { label: "Creator Pro",    active: true, href: "/dashboard/creator-pro" },
  { label: "Goblin Studio",  active: true, href: "/dashboard/studio" },
  { label: "Goblin Labs",    active: false },
  { label: "Goblin Sites",   active: false },
  { label: "Goblin Growth",  active: false },
  { label: "Goblin Motion",  active: false },
  { label: "Goblin Bazaar",  active: false },
];

// Brand Maturity P4 (Sept 2026): tone follows the page (see Navbar).
export default function Footer({ tone = "dark" }: { tone?: "light" | "dark" } = {}) {
  const light = tone === "light";
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <footer className={`border-t pt-14 pb-10 ${light ? "border-line bg-paper-2" : "border-[rgba(250,247,242,0.12)]"}`}>
      <div className="mx-auto max-w-6xl px-4 space-y-8">

        {/* Main footer row */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2.5">
              <NixAvatar size="sm" />
              <span className="font-display font-extrabold">
                <span className={light ? "text-ink" : "text-primary-light"}>Brand</span>
                <span className={light ? "text-goblin" : "text-secondary"}>Goblin</span>
                {" "}
                <span className={light ? "text-goblin" : "text-secondary"}>AI</span>
              </span>
            </div>
            <p className={`text-xs font-semibold tracking-wide ${light ? "text-gold-dark" : "text-amber-300/90"}`}>
              BrandGoblin. Powered by NIX
            </p>
            <p className={`text-xs italic max-w-[220px] text-center sm:text-left ${light ? "text-ink-faint" : "text-faint"}`}>
              Everyone Has An Idea.<br />BrandGoblin Helps Bring It To Life.
            </p>
          </div>

          {/* Links — app links for logged-in users, auth links for visitors */}
          <div className={`flex gap-6 text-sm ${light ? "text-ink-muted" : "text-muted"}`}>
            <Link href="/pricing" className={`transition-colors ${light ? "hover:text-goblin" : "hover:text-white"}`}>Pricing</Link>
            <Link href="/dashboard/creator-pro" className={`transition-colors ${light ? "hover:text-goblin" : "hover:text-white"}`}>Creator Pro</Link>
            {user ? (
              <>
                <Link href="/dashboard" className={`transition-colors ${light ? "hover:text-goblin" : "hover:text-white"}`}>Dashboard</Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`transition-colors ${light ? "hover:text-goblin" : "hover:text-white"}`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`transition-colors ${light ? "hover:text-goblin" : "hover:text-white"}`}>Sign In</Link>
                <Link href="/signup" className={`transition-colors ${light ? "hover:text-goblin" : "hover:text-white"}`}>Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* Ecosystem badges */}
        <div>
          <p className={`text-xs uppercase tracking-widest mb-3 text-center sm:text-left ${light ? "text-ink-faint" : "text-faint"}`}>
            BrandGoblin Ecosystem
          </p>
          <div className="flex flex-wrap gap-2">
            {ECOSYSTEM.map((item) =>
              item.active && item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={
                    light
                      ? "rounded-full border border-goblin/40 bg-goblin-tint px-3 py-1 text-xs font-semibold text-goblin-dark transition hover:bg-goblin-light"
                      : "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light transition hover:bg-primary/20 hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className={`rounded-full border px-3 py-1 text-xs font-medium cursor-default transition ${
                    light ? "border-line-2 text-ink-faint" : "border-[rgba(250,247,242,0.10)] text-faint"
                  }`}
                >
                  {item.label}
                  <span className="ml-1.5 text-[10px] opacity-60">Soon</span>
                </span>
              )
            )}
          </div>
        </div>

        {/* Bottom */}
        <p className={`text-center text-xs border-t pt-6 ${light ? "text-ink-faint border-line" : "text-faint border-[rgba(250,247,242,0.08)]"}`}>
          Powered by Claude. © 2026 BrandGoblin AI
        </p>
      </div>
    </footer>
  );
}
