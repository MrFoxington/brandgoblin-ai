"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  // Was "/#about" — that anchor died with the old founder-note section (Brand
  // Maturity P2). The FAQ section is the honest replacement.
  { label: "FAQ", href: "/#faq" },
];

// Creator Studio Phase A (Sept 6 2026): the QUIET nav. The four glowing pills
// (Studio / Nix / Labs / Generate) are now plain links with a small colour dot
// (gold = Studio, purple = Nix, emerald = Labs) plus ONE spark button: Create.
type AppLink = { label: string; href: string; dot?: string; adminOnly?: boolean };
const APP_LINKS: AppLink[] = [
  { label: "Vault", href: "/dashboard" },
  { label: "Studio", href: "/dashboard/studio", dot: "bg-gold" },
  { label: "Nix", href: "/dashboard/nix", dot: "bg-nix" },
  { label: "Creator Pro", href: "/dashboard/creator-pro" },
  // Labs rides the admin gate until video ships (July 18 2026) — then drop adminOnly.
  { label: "Labs", href: "/dashboard/labs", dot: "bg-secondary", adminOnly: true },
  { label: "Pricing", href: "/pricing" },
];

// Convenience link only — the real gate is server-side in /admin (redirects non-admins).
// Matches the server's ADMIN_EMAIL fallback.
// July 10 2026: fixed typo "joepro" → "jopro" (Fox's real email) — the Admin link
// never showed because of the extra 'e'.
const ADMIN_EMAIL = "jopro@hotmail.com";

// Brand Maturity P4 (Sept 2026): the navbar follows the PAGE it sits on.
// "light" = marketing pages inside `.theme-marketing` (paper + ink + goblin green);
// "dark" = the in-app studio look. Default dark.
export type NavTone = "light" | "dark";

export default function Navbar({ tone = "dark" }: { tone?: NavTone } = {}) {
  const light = tone === "light";
  const pathname = usePathname();
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

  const isAdmin = !!user && user.email === ADMIN_EMAIL;
  const appLinks = APP_LINKS.filter((l) => !l.adminOnly || isAdmin);
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href.split("#")[0]) && href !== "/";

  // Text colours per tone
  const linkBase = light ? "text-ink-muted hover:text-ink" : "text-paper/60 hover:text-paper";
  const linkActive = light ? "text-ink" : "text-paper";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? light
            ? "border-b border-line bg-paper/90 backdrop-blur-md"
            : "border-b border-paper/8 bg-bg/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">

        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <NixAvatar size="lg" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-sm font-bold">
              <span className={light ? "text-ink" : "text-paper"}>Brand</span>
              <span className={light ? "text-goblin" : "text-primary-light"}>Goblin</span>
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${light ? "text-gold-dark" : "text-gold/90"}`}>
              Powered by NIX
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {user
            ? appLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative inline-flex items-center gap-1.5 py-1 transition-colors ${active ? linkActive : linkBase}`}
                  >
                    {link.dot && <span className={`h-1.5 w-1.5 rounded-full ${link.dot}`} aria-hidden />}
                    {link.label}
                    {active && (
                      <span
                        aria-hidden
                        className={`absolute -bottom-1 left-0 right-0 h-px ${light ? "bg-goblin" : "bg-primary-light"}`}
                      />
                    )}
                  </Link>
                );
              })
            : VISITOR_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className={`transition-colors ${linkBase}`}>
                  {link.label}
                </Link>
              ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <SoundToggle className={light ? "!border-line-2 !bg-white hover:!bg-paper-2" : "!border-paper/12 !bg-surface hover:!bg-raised"} />
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`hidden sm:inline-flex items-center text-xs font-medium transition-colors ${light ? "text-ink-faint hover:text-ink" : "text-paper/45 hover:text-paper"}`}
                  title="Admin dashboard"
                >
                  Admin
                </Link>
              )}
              {/* THE SPARK — the one orange button in the nav. */}
              <Link href="/generate" className="btn-primary !py-2.5 !px-5 text-sm">
                Create
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`hidden text-sm font-medium transition-colors sm:block ${linkBase}`}
              >
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary !py-2.5 !px-5 text-sm">
                Start free. No card needed.
              </Link>
            </>
          )}

          {/* Hamburger — phones/tablets only (desktop links are hidden there) */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`lg:hidden rounded-xl border px-3 py-2 text-base leading-none transition-colors ${
              light
                ? "border-line-2 bg-white text-ink hover:bg-paper-2"
                : "border-paper/12 bg-surface text-paper hover:bg-raised"
            }`}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — on phones this is the ONLY way around the app
          (Fox's July 16 catch), so every app destination is here. */}
      {menuOpen && (
        <nav className={`lg:hidden border-t px-5 pb-2 backdrop-blur-md ${
          light ? "border-line bg-paper/95" : "border-paper/8 bg-bg/95"
        }`}>
          {(user ? appLinks : (VISITOR_LINKS as AppLink[])).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 border-b py-3.5 text-sm font-medium transition-colors last:border-0 ${
                light ? "border-line text-ink-2 hover:text-goblin" : "border-paper/8 text-paper/75 hover:text-paper"
              }`}
            >
              {link.dot && <span className={`h-1.5 w-1.5 rounded-full ${link.dot}`} aria-hidden />}
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className={`block py-3.5 text-sm font-medium transition-colors ${
                light ? "text-ink-faint hover:text-ink" : "text-paper/45 hover:text-paper"
              }`}
            >
              Admin
            </Link>
          )}
          {!user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className={`block py-3.5 text-sm font-medium transition-colors ${
                light ? "text-ink-2 hover:text-goblin" : "text-paper/75 hover:text-paper"
              }`}
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
