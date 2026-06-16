import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-goblin-border/60 py-10 text-sm text-zinc-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <p>
          🪄 BrandGoblin AI — built in a cave, powered by magic (and Claude).
        </p>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-zinc-300">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-zinc-300">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-zinc-300">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
