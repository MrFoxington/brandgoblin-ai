import Link from "next/link";

const EXAMPLES = [
  "A dog treat company for health-conscious pet owners",
  "A coffee brand for gamers",
  "A Shopify store for handmade jewellery",
  "A productivity app for students",
  "A local cleaning service with a premium feel",
  "A creator brand for travel vloggers",
];

export default function EmptyState() {
  return (
    <div className="bg-card flex flex-col items-center gap-6 px-6 py-20 text-center">
      <span className="logo-glow text-6xl">🔮</span>
      <div>
        <h3 className="font-display text-2xl font-bold text-white">Your first brand is waiting.</h3>
        <p className="mt-2 section-sub text-sm max-w-sm mx-auto">
          Start with any idea — big, small, half-baked, or fully formed. BrandGoblin will bring it to life.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <p className="mb-3 text-xs text-faint uppercase tracking-widest">Try one of these ideas</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <Link
              key={ex}
              href={`/generate`}
              className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] px-4 py-3 text-left text-sm text-muted transition hover:border-primary/40 hover:text-white"
            >
              "{ex}"
            </Link>
          ))}
        </div>
      </div>

      <Link href="/generate" className="btn-primary mt-2 px-8 py-3">
        ✦ Bring My Idea To Life →
      </Link>
    </div>
  );
}
