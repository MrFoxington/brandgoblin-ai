"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import NixAvatar from "@/components/NixAvatar";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Examples", href: "/dashboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/#about" },
];

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
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
                Dashboard
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
