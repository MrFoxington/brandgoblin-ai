import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import HeroInteractive from "@/components/HeroInteractive";
import NixFloat from "@/components/NixFloat";
import IdeaSparkSection from "@/components/IdeaSparkSection";
import ComparisonSection from "@/components/ComparisonSection";
import BrandKitPreview from "@/components/BrandKitPreview";
import TestimonialsSection from "@/components/TestimonialsSection";

const FEATURES = [
  { emoji: "🏷️", title: "5 Brand Names", badge: "Naming",      sample: "Solace · Luminary · Drift · Vela · Cairn",            desc: "Nix picks a strategic favourite and tells you exactly why it wins." },
  { emoji: "💬", title: "10 Taglines",   badge: "Copy",        sample: '"Skin that feels like Sunday morning."',              desc: "Across tones — punchy, emotional, minimalist, bold, and premium." },
  { emoji: "🎨", title: "Color Palette", badge: "Design",      sample: "#F5E6D3 · #C8A882 · #7B6B5A · #E8D5C4 · #3D3028",    desc: "5 colours with hex codes, usage rules, and psychological rationale." },
  { emoji: "🎭", title: "Brand Voice",   badge: "Strategy",    sample: "Warm · Science-backed · Gentle · Words to use & avoid", desc: "Personality, tone, vocabulary — so every post sounds unmistakably you." },
  { emoji: "📖", title: "Brand Story",   badge: "Storytelling", sample: '"We built Solace because skin should feel like a ritual, not a chore."', desc: "Emotional origin story and customer-focused mission statement." },
  { emoji: "🐲", title: "Mascot Concept", badge: "Creative",   sample: "Full character brief + AI image prompt ready to generate", desc: "Appearance, personality, backstory — your brand's visual identity." },
  { emoji: "🌐", title: "Website Copy",  badge: "Copy",        sample: "Hero · Subhead · CTA · About · Features · Footer",    desc: "Copy-paste directly into your site. No rewriting required." },
  { emoji: "📱", title: "Social Media Kit", badge: "Social",   sample: "Instagram · X · TikTok · LinkedIn bios + 5 launch posts", desc: "Optimised bios and launch content for every major platform." },
  { emoji: "🚀", title: "7-Day Launch Plan", badge: "Launch",  sample: "Day 1: Announce · Day 3: Story · Day 7: Offer",       desc: "A day-by-day checklist from idea to first customer." },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    emoji: "💡",
    title: "Describe your idea",
    desc: "Tell Nix your concept, audience, and vibe. The more specific, the better the magic. Takes 30 seconds.",
    example: '"A calm, science-backed skincare brand for people overwhelmed by harsh chemicals."',
  },
  {
    step: "02",
    emoji: "🧌",
    title: "Nix gets to work",
    desc: "Nix obsesses over every detail like it's his own brand — acting as your strategist, copywriter, and creative director all at once. No back-and-forth. No prompting loops.",
    example: "12 deliverables generating in parallel…",
  },
  {
    step: "03",
    emoji: "🚀",
    title: "Launch with confidence",
    desc: "Your complete brand kit is ready. Copy-paste into your site, socials, and ads. You're ready to go — for real.",
    example: "Average time from prompt to kit: 1 min 52 sec",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Taste the magic. No card needed.",
    highlight: false,
    comingSoon: false,
    badge: null,
    subtext: null,
    cta: "Start free — 7 days of everything",
    href: "/signup",
    features: [
      "7 days of full Creator Pro — free",
      "3 complete brand generations after trial",
      "All 9 core deliverables",
      "Color palette + brand voice",
      "Social media kit + launch plan",
    ],
  },
  {
    name: "Creator Pro",
    price: "$19",
    period: "/month",
    desc: "Your AI Marketing Department.",
    badge: "Most popular",
    subtext: "Never stare at a blank caption again.",
    highlight: true,
    comingSoon: false,
    cta: "Get Creator Pro",
    href: "/pricing",
    features: [
      "Unlimited brand generations",
      "20 content types (posts, blogs, emails, ads)",
      "7 brand voice modes",
      "Content history & regeneration",
      "Creator Pro hub dashboard",
    ],
  },
  {
    name: "Agency Edition",
    price: "Coming Soon",
    period: "",
    desc: "For agencies managing multiple brands.",
    badge: null,
    subtext: null,
    highlight: false,
    comingSoon: true,
    cta: "Join Waitlist",
    href: "/pricing",
    features: [
      "Multi-client workspaces",
      "White-label brand reports",
      "Team collaboration tools",
      "Priority generation queue",
    ],
  },
];

const LOOP_STEPS = [
  { emoji: "✨", label: "Surprise reveal" },
  { emoji: "🏆", label: "Pride — your brand!" },
  { emoji: "⬆️", label: "XP + streaks" },
  { emoji: "📤", label: "Share it" },
  { emoji: "🔁", label: "One more…" },
  { emoji: "🌅", label: "Come back tomorrow" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />

      {/* ── 1. Hero ── */}
      <section id="hero" className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh" />
        <Particles />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Left — interactive input */}
            <div id="hero-input" className="w-full">
              <HeroInteractive />
            </div>

            {/* Right — Nix floating */}
            <div className="relative flex justify-center lg:flex-none shrink-0">
              <div
                className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 65%)", animation: "pulse-glow 3s ease-in-out infinite" }}
              />
              <NixFloat
                src="/nix/happy-waving-nix.png"
                alt="Nix the BrandGoblin AI brand strategist"
                width={440}
                height={440}
                className="relative w-56 sm:w-72 lg:w-[380px] drop-shadow-[0_0_50px_rgba(124,58,237,0.45)]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Idea Sparks ── */}
      <IdeaSparkSection />

      {/* ── 3. Comparison ── */}
      <ComparisonSection />

      {/* ── 4. Live Brand Kit Preview ── */}
      <BrandKitPreview />

      {/* ── 5. What You Get ── */}
      <section className="py-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="badge-green mb-6">✦ What's Inside Every Kit</span>
          <h2 className="section-heading mb-4">
            12 deliverables. <span className="gradient-text">One prompt.</span>
          </h2>
          <p className="section-sub mb-4 max-w-2xl mx-auto">
            No designer, no copywriter, no agency. Nix delivers everything you need to look and sound like a real brand — on day one.
          </p>
          <p className="text-sm text-secondary font-semibold mb-16">
            All of it included in your 7-day free trial. No card required.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card bg-card-hover p-6 text-left group">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">{f.emoji}</span>
                  <span className="badge-purple text-xs">{f.badge}</span>
                </div>
                <h3 className="mb-1 font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="mb-3 text-xs text-muted leading-relaxed">{f.desc}</p>
                <div className="rounded-lg bg-primary/8 border border-primary/15 px-3 py-2">
                  <p className="text-xs font-mono text-secondary leading-relaxed">{f.sample}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. How It Works ── */}
      <section className="bg-section-alt py-28">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-purple mb-6">✦ How It Works</span>
          <h2 className="section-heading mb-4">
            From blank page to <span className="gradient-text">launch-ready brand</span>
          </h2>
          <p className="section-sub mb-16">Three steps. Under two minutes. No design skills required.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-card bg-card-hover p-8 text-left">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-display text-4xl font-black text-primary/30">{step.step}</span>
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="mb-4 text-sm text-muted leading-relaxed">{step.desc}</p>
                <div className="rounded-lg bg-primary/8 border border-primary/15 px-3 py-2">
                  <p className="text-xs font-mono text-secondary italic leading-relaxed">{step.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Dopamine Loop ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-green mb-6">✦ The Loop</span>
          <h2 className="section-heading mb-4">
            Once you start, <span className="gradient-text">you won't want to stop.</span>
          </h2>
          <p className="section-sub mb-12 max-w-xl mx-auto">
            Nix rewards every step. XP, streaks, daily ideas, share cards — the app is designed to
            make building feel addictive in the best possible way.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-0">
            {LOOP_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center px-4 py-3">
                  <span className="text-2xl mb-1">{s.emoji}</span>
                  <span className="text-xs text-muted whitespace-nowrap">{s.label}</span>
                </div>
                {i < LOOP_STEPS.length - 1 && (
                  <span className="text-primary/40 text-lg hidden sm:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Pricing ── */}
      <section className="py-28 bg-section-alt">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-green mb-6">✦ Pricing</span>
          <h2 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h2>
          <p className="section-sub mb-4">Start with 7 days of everything — free. No card. No catch.</p>
          <p className="text-sm text-secondary font-semibold mb-16">
            Upgrade when you're ready. Cancel any time.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map((plan) =>
              plan.comingSoon ? (
                <div
                  key={plan.name}
                  className="relative flex flex-col p-6 text-left rounded-2xl border-2 border-dashed border-[rgba(139,92,246,0.3)] bg-[rgba(10,10,15,0.6)]"
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
                        <span className="text-primary/50 mt-0.5 shrink-0">✦</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="w-full rounded-xl border border-primary/30 bg-primary/10 py-3 text-center text-sm font-semibold text-primary-light transition hover:bg-primary/20">
                    {plan.cta}
                  </Link>
                </div>
              ) : (
                <div
                  key={plan.name}
                  className={`bg-card bg-card-hover flex flex-col p-6 text-left ${plan.highlight ? "border-primary/50 shadow-glow" : ""}`}
                >
                  {plan.badge && <span className="badge-purple mb-4 self-start">{plan.badge}</span>}
                  <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-1 mb-1 text-sm text-muted">{plan.desc}</p>
                  {plan.subtext && <p className="mb-4 text-xs font-semibold text-secondary">{plan.subtext}</p>}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-sm text-faint">{plan.period}</span>
                  </div>
                  <ul className="mb-8 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted">
                        <span className="text-secondary mt-0.5 shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={plan.highlight ? "btn-primary" : "btn-secondary"}>
                    {plan.cta}
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── 9. Founder Note + Trust ── */}
      <TestimonialsSection />

      {/* ── 10. Final CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-12 text-center">
            <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-40" />
            <div className="relative">
              <NixFloat
                src="/nix/conjuring-nix.png"
                alt="Nix conjuring your brand"
                width={160}
                height={160}
                className="mx-auto mb-6 drop-shadow-[0_0_30px_rgba(124,58,237,0.6)]"
              />

              <div className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-2">
                <span className="text-sm font-medium text-secondary">🧌 Nix has a message for you</span>
              </div>

              <h2 className="section-heading mb-4 text-4xl sm:text-5xl">
                Your brand is one <span className="gradient-text">idea away.</span>
              </h2>
              <p className="section-sub mb-3 text-lg max-w-xl mx-auto">
                7 days of unlimited creating with Nix — free. No card, no catch.
              </p>
              <p className="text-sm text-faint mb-10">
                Names, colors, voice, story, launch plan. Everything. Yours to keep.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary px-10 py-4 text-lg">
                  ✦ Start free — 7 days of everything →
                </Link>
                <Link href="/pricing" className="btn-secondary px-8 py-4 text-base">
                  See what's included
                </Link>
              </div>

              <p className="mt-6 text-xs text-faint">
                No credit card · No design skills · ~2 minutes · Cancel any time
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
