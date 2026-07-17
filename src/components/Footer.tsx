"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import NixAvatar from "@/components/NixAvatar";

const ECOSYSTEM: { label: string; active: boolean; href?: string }[] = [
  { label: "✨ Creator Pro",      active: true, href: "/dashboard/creator-pro" },
  { label: "🎨 Goblin Studio",    active: true, href: "/dashboard/studio" },
  { label: "🧪 Goblin Labs",      active: false },
  { label: "🌐 Goblin Sites",     active: false },
  { label: "📈 Goblin Growth",    active: false },
  { label: "📹 Goblin Motion",    active: false },
  { label: "🏪 Goblin Bazaar", active: false },
];

export default function Footer() {
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
    <footer className="border-t border-[rgba(45,45,78,0.8)] pt-12 pb-8">
      <div className="mx-auto max-w-6xl px-4 space-y-8">

        {/* Main footer row */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2.5">
              <NixAvatar size="sm" />
              <span className="font-display font-extrabold">
                <span className="text-primary-light">Brand</span>
                <span className="text-secondary">Goblin</span>
                {" "}
                <span className="text-secondary">AI</span>
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wide text-amber-300/90">
              BrandGoblin - Powered by NIX ✨
            </p>
            <p className="text-xs text-faint italic max-w-[220px] text-center sm:text-left">
              Everyone Has An Idea.<br />BrandGoblin Helps Bring It To Life.
            </p>
          </div>

          {/* Links — app links for logged-in users, auth links for visitors */}
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard/creator-pro" className="hover:text-white transition-colors">Creator Pro</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* Ecosystem badges */}
        <div>
          <p className="text-xs text-faint uppercase tracking-widest mb-3 text-center sm:text-left">
            BrandGoblin Ecosystem
          </p>
          <div className="flex flex-wrap gap-2">
            {ECOSYSTEM.map((item) =>
              item.active && item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light transition hover:bg-primary/20 hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className="rounded-full border border-[rgba(45,45,78,0.6)] px-3 py-1 text-xs font-medium text-faint cursor-default transition"
                >
                  {item.label}
                  <span className="ml-1.5 text-[10px] opacity-60">Soon</span>
                </span>
              )
            )}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-center text-xs text-faint border-t border-[rgba(45,45,78,0.4)] pt-6">
          Built with magic (and Claude). © 2026 BrandGoblin AI · Powered by NIX · Nix says hi 🧙
        </p>
      </div>
    </footer>
  );
}
