import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(45,45,78,0.8)] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="logo-glow text-xl">🪄</span>
            <span className="font-display font-extrabold">
              <span className="text-primary-light">Brand</span>
              <span className="text-secondary">Goblin</span>
              {" "}
              <span className="text-secondary">AI</span>
            </span>
          </div>
          <p className="text-sm text-faint">
            Built in a cave, powered by magic (and Claude). © 2026 BrandGoblin AI
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
