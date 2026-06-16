import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="bg-card flex flex-col items-center gap-5 px-6 py-20 text-center">
      <span className="logo-glow text-6xl">🔮</span>
      <h3 className="font-display text-2xl font-bold text-white">No brands summoned yet</h3>
      <p className="section-sub text-sm">
        Type an idea. Summon a brand. Your first AI-generated brand kit is one click away.
      </p>
      <Link href="/generate" className="btn-primary mt-2 px-8 py-3">
        ✦ Generate your first brand →
      </Link>
    </div>
  );
}
