import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STEPS = [
  {
    emoji: "💡",
    title: "Type your idea",
    desc: "A few words about your business, audience, and vibe is all the goblin needs.",
  },
  {
    emoji: "🪄",
    title: "Summon the brand",
    desc: "Our AI brand strategist conjures names, voice, visuals, and copy in seconds.",
  },
  {
    emoji: "🚀",
    title: "Launch it",
    desc: "Copy-paste a launch-ready brand kit straight into your website, socials, and ads.",
  },
];

const FEATURES = [
  { emoji: "🏷️", title: "10 Brand Names", desc: "Plus a top recommendation with reasoning." },
  { emoji: "💬", title: "10 Taglines", desc: "Catchy, on-brand, ready to use." },
  { emoji: "📖", title: "Brand Story", desc: "An emotional origin story + mission." },
  { emoji: "🎭", title: "Brand Voice", desc: "Tone, words to use, words to avoid." },
  { emoji: "🐲", title: "Mascot Concept", desc: "A full character + AI image prompt." },
  { emoji: "🎨", title: "Color Palette", desc: "5 hex colors with usage notes." },
  { emoji: "🌐", title: "Website Copy", desc: "Hero, subhead, CTA, about, features." },
  { emoji: "📱", title: "Social Media Kit", desc: "Bios + 5 launch posts, ready to ship." },
  { emoji: "🚀", title: "Launch Plan", desc: "A 7-day, day-by-day launch checklist." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center sm:pt-28">
          <div className="mx-auto max-w-3xl">
            <span className="goblin-chip mb-6 inline-block border-goblin-purple/40 text-goblin-purple-light">
              ✨ AI-powered brand kits in under 30 seconds
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              Type an idea.
              <br />
              <span className="bg-gradient-to-r from-goblin-purple-light to-goblin-emerald bg-clip-text text-transparent">
                Summon a brand.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
              BrandGoblin AI turns one business idea into a complete launch-ready brand
              kit — names, taglines, voice, mascot, logo prompts, colors, copy, and a
              7-day launch plan.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="goblin-btn-primary w-full sm:w-auto">
                Summon my brand ✨
              </Link>
              <Link href="/pricing" className="goblin-btn-secondary w-full sm:w-auto">
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              No credit card required · 3 free brand kits
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-goblin-border/60 bg-goblin-panel/40 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-white sm:text-3xl">
              How the magic happens
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="goblin-card p-6 text-center">
                  <span className="text-4xl">{s.emoji}</span>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-goblin-emerald">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl">
              Everything your launch needs
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-center text-zinc-400">
              One generation, twelve deliverables. No designer, no copywriter, no agency
              retainer required.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="goblin-card p-5">
                  <span className="text-2xl">{f.emoji}</span>
                  <h3 className="mt-2 font-bold text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 text-center">
          <div className="goblin-card mx-auto max-w-2xl p-10">
            <span className="text-5xl">🪄</span>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Your next brand is one idea away.
            </h2>
            <p className="mt-3 text-zinc-400">
              Join founders summoning launch-ready brands in seconds, not weeks.
            </p>
            <Link href="/signup" className="goblin-btn-primary mt-6 inline-flex">
              Get started free ✨
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
