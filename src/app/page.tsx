import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import CrystalIcon from "@/components/CrystalIcon";

const FEATURES = [
  { emoji: "🏷️", title: "5 Brand Names", desc: "A Goblin-picked favorite plus 4 strong alternatives, each with strategic reasoning.", badge: "Naming" },
  { emoji: "💬", title: "10 Taglines", desc: "Punchy, on-brand taglines across different tones and angles.", badge: "Copywriting" },
  { emoji: "📖", title: "Brand Story", desc: "An emotional origin story and customer-focused mission statement.", badge: "Storytelling" },
  { emoji: "🎭", title: "Brand Voice", desc: "Personality traits, tone examples, and words to use and avoid.", badge: "Strategy" },
  { emoji: "🐲", title: "Mascot Concept", desc: "Full character brief with appearance, personality, and an AI image prompt.", badge: "Creative" },
  { emoji: "🎨", title: "Color Palette", desc: "5 brand colors with hex codes and usage notes.", badge: "Design" },
  { emoji: "🌐", title: "Website Copy", desc: "Hero headline, subhead, CTA, about section, and feature bullets.", badge: "Copy" },
  { emoji: "📱", title: "Social Media Kit", desc: "Optimized bios for Instagram, X, TikTok plus 5 launch posts.", badge: "Social" },
  { emoji: "🚀", title: "7-Day Launch Plan", desc: "A day-by-day action checklist to go from idea to launch.", badge: "Launch" },
];

const HOW_IT_WORKS = [
  { step: "01", emoji: "💡", title: "Describe your idea", desc: "Tell us your business concept, target audience, and the vibe you're going for. The more specific, the better the magic." },
  { step: "02", emoji: "🪄", title: "AI summons your brand", desc: "Our AI acts as a world-class branding agency — generating names, voice, visuals, copy, and strategy in under 2 minutes." },
  { step: "03", emoji: "🚀", title: "Launch with confidence", desc: "Copy-paste a complete brand kit directly into your website, socials, and ad campaigns. Everything you need, nothing you don't." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try the magic before you commit.",
    features: ["3 brand generations", "Full 12-section brand kit", "Save to your vault", "Copy-to-clipboard"],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For founders launching real brands.",
    features: ["Unlimited brand generations", "Unlimited saved brands", "Premium AI outputs", "Priority generation speed"],
    cta: "Get Pro",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/month",
    desc: "For agencies serving clients.",
    features: ["Everything in Pro", "Client-ready brand kits", "Bulk generation", "White-label-ready output"],
    cta: "Get Agency",
    href: "/signup",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 text-center">
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        {/* Mesh glow */}
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh" />
        {/* Particles */}
        <Particles />

        <div className="relative mx-auto max-w-4xl px-4">
          {/* Crystal + logo */}
          <div className="mb-6 flex flex-col items-center gap-1">
            <CrystalIcon className="h-44 w-auto" />
            <div className="flex items-center gap-2 text-3xl font-extrabold font-display">
              <span className="text-primary-light">Brand</span>
              <span className="text-secondary">Goblin</span>
              <span className="text-secondary">AI</span>
            </div>
          </div>

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="badge-purple">
              <span>✦</span> AI-Powered Brand Creation Engine
            </span>
          </div>

          {/* Headline */}
          <h1 className="section-heading mb-6 text-5xl sm:text-7xl">
            Launch Your{" "}
            <span className="gradient-text">Next Brand</span>
            <br />
            In Minutes
          </h1>

          {/* Subheadline */}
          <p className="section-sub mx-auto mb-10 text-lg">
            Turn <span className="text-secondary font-semibold">any</span> idea into a complete launch-ready brand powered by AI.
            Names. Logos. Taglines. Mascots. Copy —
            everything in just one click.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
              ✦ Generate Your First Brand Free →
            </Link>
            <Link href="/pricing" className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
              See Pricing →
            </Link>
          </div>

          <p className="mt-5 text-sm text-faint">
            No credit card required · 3 free brand kits · Takes ~2 minutes
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-section-alt py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="badge-green mb-6">✦ What's Inside</span>
          <h2 className="section-heading mb-4">
            Everything your launch <span className="gradient-text">needs</span>
          </h2>
          <p className="section-sub mb-16">
            One generation. Twelve deliverables. No designer, copywriter, or agency retainer required.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card bg-card-hover p-6 text-left">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">{f.emoji}</span>
                  <span className="badge-purple text-xs">{f.badge}</span>
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-purple mb-6">✦ How It Works</span>
          <h2 className="section-heading mb-4">
            Three steps to a <span className="gradient-text">complete brand</span>
          </h2>
          <p className="section-sub mb-16">
            From blank page to launch-ready brand kit in under two minutes.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="bg-card bg-card-hover p-8 text-left">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-display text-4xl font-black text-primary/30">{step.step}</span>
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-section-alt py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-green mb-6">✦ Pricing</span>
          <h2 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h2>
          <p className="section-sub mb-16">
            Start free. Upgrade when your brand starts making you money.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card bg-card-hover flex flex-col p-6 text-left ${
                  plan.highlight ? "border-primary/50 shadow-glow" : ""
                }`}
              >
                {plan.highlight && (
                  <span className="badge-purple mb-4 self-start">Most popular</span>
                )}
                <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 mb-4 text-sm text-muted">{plan.desc}</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-faint">{plan.period}</span>
                </div>
                <ul className="mb-8 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-secondary mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={plan.highlight ? "btn-primary" : "btn-secondary"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <div className="bg-card p-12">
            <span className="logo-glow mb-4 block text-6xl">🪄</span>
            <h2 className="section-heading mb-4">
              Your next brand is one <span className="gradient-text">idea away</span>
            </h2>
            <p className="section-sub mb-8">
              Join founders summoning launch-ready brands in minutes, not months.
            </p>
            <Link href="/signup" className="btn-primary mx-auto inline-flex px-10 py-4 text-lg">
              ✦ Generate Your First Brand Free →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
