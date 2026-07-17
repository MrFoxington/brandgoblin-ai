"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import NixAvatar from "@/components/NixAvatar";
import { SoundToggle } from "@/components/primitives/SoundFx";

// Marketing links sell the product to visitors. Logged-in users are already
// sold — they get app navigation instead (audit fix, July 10 2026).
const VISITOR_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Examples", href: "/dashboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/#about" },
];

const APP_LINKS = [
  { label: "Brand Vault", href: "/dashboard" },
  { label: "Creator Pro", href: "/dashboard/creator-pro" },
  { label: "Pricing", href: "/pricing" },
];

// Mobile menu (hamburger) — on phones every desktop link is hidden, so this
// is the ONLY way back to the dashboard on a vertical phone (Fox's July 16 catch).
const MOBILE_APP_LINKS = [
  { label: "🏠 Dashboard", href: "/dashboard" },
  { label: "🎨 Goblin Studio", href: "/dashboard/studio" },
  { label: "✨ Nix", href: "/dashboard/nix" },
  { label: "👑 Creator Pro", href: "/dashboard/creator-pro" },
  { label: "💰 Pricing", href: "/pricing" },
];

// Convenience link only — the real gate is server-side in /admin (redirects non-admins).
// Matches the server's ADMIN_EMAIL fallback.
// July 10 2026: fixed typo "joepro" → "jopro" (Fox's real email) — the Admin link
// never showed because of the extra 'e'.
const ADMIN_EMAIL = "jopro@hotmail.com";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
        <Link href="/" className="flex items-center gap-2.5 group">
          <NixAvatar size="lg" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-sm font-extrabold">
              <span className="text-primary-light">Brand</span>
              <span className="text-secondary">Goblin</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/90">
              Powered by NIX ✨
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted lg:flex">
          {(user ? APP_LINKS : VISITOR_LINKS).map((link) => (
            <Link
              key={link.label}
              href={link.href}
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
                <>
                  {/* Founder preview (July 17 2026): Labs link rides the admin
                      gate until experiments pass the quality bar, then moves
                      into APP_LINKS/MOBILE_APP_LINKS for everyone. */}
                  <Link
                    href="/dashboard/labs"
                    className="hidden sm:inline-flex items-center text-xs font-medium text-faint hover:text-white transition-colors"
                    title="Goblin Labs (founder preview)"
                  >
                    🧪 Labs
                  </Link>
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center text-xs font-medium text-faint hover:text-white transition-colors"
                    title="Admin dashboard"
                  >
                    🧌 Admin
                  </Link>
                </>
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
              <Link href="/generate" className="btn-primary !py-2.5 !px-5 text-sm !animate-none !shadow-[0_0_20px_rgba(255,107,53,0.5)]">
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

          {/* Hamburger — phones/tablets only (desktop links are hidden there) */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-base leading-none text-white hover:bg-white/10 transition-colors"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.97)] backdrop-blur-md px-5 pb-2">
          {(user ? MOBILE_APP_LINKS : VISITOR_LINKS).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/5 py-3.5 text-sm font-medium text-muted transition-colors hover:text-white last:border-0"
            >
              {link.label}
            </Link>
          ))}
          {user && user.email === ADMIN_EMAIL && (
            <>
              <Link
                href="/dashboard/labs"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/5 py-3.5 text-sm font-medium text-faint transition-colors hover:text-white"
              >
                🧪 Goblin Labs
              </Link>
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block py-3.5 text-sm font-medium text-faint transition-colors hover:text-white"
              >
                🧌 Admin
              </Link>
            </>
          )}
          {!user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block py-3.5 text-sm font-medium text-muted transition-colors hover:text-white"
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
