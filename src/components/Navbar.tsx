"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import NixAvatar from "@/components/NixAvatar";
import { SoundToggle } from "@/components/primitives/SoundFx";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Examples", href: "/dashboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/#about" },
];

// Convenience link only — the real gate is server-side in /admin (redirects non-admins).
// Matches the server's ADMIN_EMAIL fallback.
const ADMIN_EMAIL = "joepro@hotmail.com";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, [supabase]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.95)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <NixAvatar size="lg" />
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={user && link.label === "Examples" ? "/dashboard" : link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <SoundToggle />
          {user ? (
            <>
              {user.email === ADMIN_EMAIL && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center text-xs font-medium text-faint hover:text-white transition-colors"
                  title="Admin dashboard"
                >
                  🧌 Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
                Dashboard
              </Link>
              <Link
                href="/dashboard/studio"
                className="relative hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300 hover:text-amber-100 hover:bg-amber-400/15 shadow-studio-glow motion-safe:animate-studio-glow transition-colors"
              >
                🎨 Studio
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-400 px-1 text-[9px] font-bold leading-4 text-black">
                  NEW
                </span>
              </Link>
              <Link
                href="/dashboard/nix"
                className="relative hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-light hover:text-white hover:bg-primary/20 shadow-glow transition-colors"
              >
                ✨ Nix
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-white">
                  FREE
                </span>
              </Link>
              <Link href="/generate" className="btn-primary !py-2.5 !px-5 text-sm !animate-none !shadow-glow">
                ✦ Generate
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted transition-colors hover:text-white sm:block"
              >
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary !py-2.5 !px-5 text-sm">
                ✦ Start Creating Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
