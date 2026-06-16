"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 border-b border-goblin-border/60 bg-goblin-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🪄</span>
          <span className="text-lg font-extrabold text-white">
            Brand<span className="text-goblin-purple-light">Goblin</span>{" "}
            <span className="text-goblin-emerald">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-300 md:flex">
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/generate" className="hover:text-white">
                Generate
              </Link>
              <Link href="/settings" className="hover:text-white">
                Settings
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="goblin-btn-secondary !px-4 !py-2 text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-zinc-300 hover:text-white sm:block"
              >
                Log in
              </Link>
              <Link href="/signup" className="goblin-btn-primary !px-4 !py-2 text-sm">
                Summon a Brand ✨
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
