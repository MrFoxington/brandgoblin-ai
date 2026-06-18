import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";

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
    features: ["One complete brand generation", "10 brand names", "Tagline & brand story", "Logo prompts & social bios", "Launch content"],
    cta: "Generate My Brand",
    href: "/signup",
    highlight: false,
    comingSoon: false,
  },
  {
    name: "Creator Pro",
    price: "$19",
    period: "/month",
    desc: "For founders building and growing real brands.",
    features: ["Unlimited content generations", "Social posts, blogs & email campaigns", "Ad copy & product descriptions", "Continuous content engine"],
    cta: "Get Creator Pro",
    href: "/pricing",
    highlight: true,
    comingSoon: false,
  },
  {
    name: "Agency Edition",
    price: "Coming Soon",
    period: "",
    desc: "For freelancers, consultants, and agencies managing multiple brands.",
    features: ["Multi-client workspaces", "White-label reports", "Team collaboration", "Agency dashboard"],
    cta: "Join Waitlist",
    href: "/pricing",
    highlight: false,
    comingSoon: true,
  },
];

export default async function LandingPage() {
  const supabase = createAdminClient();
  const { data: testimonials } = await supabase
    .from("brand_testimonials")
    .select("id, testimonial_text, created_at")
    .order("created_at", { ascending: false })
    .limit(6);
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        {/* Mesh glow */}
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh" />
        {/* Particles */}
        <Particles />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

            {/* ── Left: text ── */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="mb-6 flex justify-center lg:justify-start">
                <span className="badge-purple">
                  <span>✦</span> AI-Powered Brand Creation Engine
                </span>
              </div>

              {/* Headline */}
              <h1 className="section-heading mb-6 text-5xl sm:text-6xl lg:text-7xl">
                Launch Your{" "}
                <span className="gradient-text">Next Brand</span>
                <br />
                In Minutes
              </h1>

              {/* Nix intro line */}
              <p className="mb-2 text-base font-semibold text-secondary">
                Hi! I&rsquo;m Nix. What idea are we bringing to life today?
              </p>

              {/* Subheadline */}
              <p className="section-sub mb-10 text-lg max-w-xl mx-auto lg:mx-0">
                Turn <span className="text-secondary font-semibold">any</span> idea into a complete launch-ready brand powered by AI.
                Names. Logos. Taglines. Mascots. Copy —
                everything in just one click.
              </p>

              {/* CTAs */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
                  ✦ Generate Your First Brand Free →
                </Link>
                <Link href="/pricing" className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
                  See Pricing →
                </Link>
              </div>

              <p className="mt-5 text-sm text-faint text-center lg:text-left">
                No credit card required · 3 free brand kits · Takes ~2 minutes
              </p>
            </div>

            {/* ── Right: Nix happy-waving ── */}
            <div className="flex justify-center lg:flex-none">
              <Image
                src="/nix/happy-waving-nix.png"
                alt="Nix the BrandGoblin wizard waving"
                width={420}
                height={420}
                className="w-64 sm:w-80 lg:w-[420px] drop-shadow-[0_0_40px_rgba(124,58,237,0.4)]"
                priority
              />
            </div>

          </div>{/* end flex row */}
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
              plan.comingSoon ? (
                <div
                  key={plan.name}
                  className="relative flex flex-col p-6 text-left rounded-2xl border-2 border-dashed border-[rgba(139,92,246,0.3)] bg-[rgba(10,10,15,0.6)] opacity-90"
                >
                  <span className="mb-4 self-start rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-0.5 text-xs font-bold text-yellow-400 tracking-widest uppercase">
                    🚧 Coming Soon
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-1 mb-4 text-sm text-muted">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="font-display text-2xl font-black text-faint">{plan.price}</span>
                  </div>
                  <ul className="mb-8 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted/70">
                        <span className="text-primary/50 mt-0.5 shrink-0">✦</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className="w-full rounded-xl border border-primary/30 bg-primary/10 py-3 text-center text-sm font-semibold text-primary-light transition hover:bg-primary/20"
                  >
                    {plan.cta}
                  </Link>
                  <p className="mt-3 text-center text-xs text-faint">🧌 Goblin Labs</p>
                </div>
              ) : (
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
              )
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-20 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <span className="badge-purple mb-4 inline-block">⭐ From the vault</span>
              <h2 className="section-heading mb-3">
                Founders who took the <span className="gradient-text">leap</span>
              </h2>
              <p className="section-sub">Real feedback from real brand builders.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t: { id: string; testimonial_text: string; created_at: string }) => (
                <div
                  key={t.id}
                  className="bg-card flex flex-col gap-4 p-6"
                >
                  <div className="flex gap-0.5 text-yellow-400 text-sm">
                    {"★★★★★"}
                  </div>
                  <p className="text-sm text-muted leading-relaxed flex-1">
                    &ldquo;{t.testimonial_text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-[rgba(45,45,78,0.4)]">
                    <span className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary-light">
                      🧌
                    </span>
                    <span className="text-xs text-faint">BrandGoblin Founder</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
