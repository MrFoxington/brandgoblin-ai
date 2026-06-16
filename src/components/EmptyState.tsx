import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="goblin-card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="text-5xl">🔮</span>
      <h3 className="text-xl font-bold text-white">No brands summoned yet</h3>
      <p className="max-w-sm text-sm text-zinc-400">
        Type an idea. Summon a brand. Your first AI-generated brand kit is one click away.
      </p>
      <Link href="/generate" className="goblin-btn-primary mt-2">
        Generate your first brand ✨
      </Link>
    </div>
  );
}
