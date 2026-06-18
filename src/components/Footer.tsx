import Link from "next/link";
import NixAvatar from "@/components/NixAvatar";

const ECOSYSTEM = [
  { label: "✨ Creator Pro",      active: true  },
  { label: "🎨 Goblin Studio",    active: false },
  { label: "🧪 Goblin Labs",      active: false },
  { label: "🌐 Goblin Sites",     active: false },
  { label: "📈 Goblin Growth",    active: false },
  { label: "📹 Goblin Motion",    active: false },
  { label: "🏪 Goblin Marketplace", active: false },
];

export default function Footer() {
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
            <p className="text-xs text-faint">Powered by Nix ✨</p>
            <p className="text-xs text-faint italic max-w-[220px] text-center sm:text-left">
              Everyone Has An Idea.<br />BrandGoblin Helps Bring It To Life.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard/creator-pro" className="hover:text-white transition-colors">Creator Pro</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>

        {/* Ecosystem badges */}
        <div>
          <p className="text-xs text-faint uppercase tracking-widest mb-3 text-center sm:text-left">
            BrandGoblin Ecosystem
          </p>
          <div className="flex flex-wrap gap-2">
            {ECOSYSTEM.map((item) => (
              <span
                key={item.label}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  item.active
                    ? "border-primary/40 bg-primary/10 text-primary-light"
                    : "border-[rgba(45,45,78,0.6)] text-faint cursor-default"
                }`}
              >
                {item.label}
                {!item.active && (
                  <span className="ml-1.5 text-[10px] opacity-60">Soon</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-center text-xs text-faint border-t border-[rgba(45,45,78,0.4)] pt-6">
          Built with magic (and Claude). © 2026 BrandGoblin AI · Nix says hi 🧙
        </p>
      </div>
    </footer>
  );
}
