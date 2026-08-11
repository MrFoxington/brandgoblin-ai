import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import HeroInteractive from "@/components/HeroInteractive";
import NixFloat from "@/components/NixFloat";
import IdeaSparkSection from "@/components/IdeaSparkSection";
import ComparisonSection from "@/components/ComparisonSection";
import BrandKitPreview from "@/components/BrandKitPreview";

// Brand Maturity P2 (Aug 2026): seven sections, no decorative emoji, no manipulation
// copy, Nix speaks exactly once. Section rhythm is shared so the vertical spacing
// stays consistent everywhere — see SECTION_PAD.
const SECTION_PAD = "py-32 sm:py-48";

const FEATURES = [
  { title: "5 Brand Names", badge: "Naming",      sample: "Solace · Luminary · Drift · Vela · Cairn",            desc: "Nix picks a strategic favourite and tells you exactly why it wins." },
  { title: "10 Taglines",   badge: "Copy",        sample: '"Skin that feels like Sunday morning."',              desc: "Across tones — punchy, emotional, minimalist, bold, and premium." },
  { title: "Color Palette", badge: "Design",      sample: "#F5E6D3 · #C8A882 · #7B6B5A · #E8D5C4 · #3D3028",    desc: "5 colours with hex codes, usage rules, and psychological rationale." },
  { title: "Brand Voice",   badge: "Strategy",    sample: "Warm · Science-backed · Gentle · Words to use & avoid", desc: "Personality, tone, vocabulary — so every post sounds unmistakably you." },
  { title: "Brand Story",   badge: "Storytelling", sample: '"We built Solace because skin should feel like a ritual, not a chore."', desc: "Emotional origin story and customer-focused mission statement." },
  { title: "Mascot Concept", badge: "Creative",   sample: "Full character brief + AI image prompt ready to generate", desc: "Appearance, personality, backstory — your brand's visual identity." },
  { title: "Website Copy",  badge: "Copy",        sample: "Hero · Subhead · CTA · About · Features · Footer",    desc: "Copy-paste directly into your site. No rewriting required." },
  { title: "Social Media Kit", badge: "Social",   sample: "Instagram · X · TikTok · LinkedIn bios + 5 launch posts", desc: "Optimised bios and launch content for every major platform." },
  { title: "7-Day Launch Plan", badge: "Launch",  sample: "Day 1: Announce · Day 3: Story · Day 7: Offer",       desc: "A day-by-day checklist from idea to first customer." },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe your idea",
    desc: "Tell Nix your concept, audience, and vibe. The more specific, the better the result. Takes 30 seconds.",
    example: '"A calm, science-backed skincare brand for people overwhelmed by harsh chemicals."',
  },
  {
    step: "02",
    title: "Nix gets to work",
    desc: "Nix obsesses over every detail like it's his own brand — acting as your strategist, copywriter, and creative director all at once. No back-and-forth. No prompting loops.",
    example: "12 deliverables generating in parallel…",
  },
  {
    step: "03",
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
    desc: "Create your brand free. No card needed.",
    highlight: false,
    badge: null,
    subtext: null,
    cta: "Start free. No card needed.",
    href: "/signup",
    features: [
      "Generate your brand — names, story, voice, colors, logo direction",
      "Try Goblin Studio free — real logos, social graphics & product art",
      "Creative Energy included to get started",
      "Free Nix stickers & wallpapers",
      "No credit card, ever",
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
    cta: "Upgrade to Creator Pro",
    href: "/pricing",
    features: [
      "Unlimited brand generations",
      "Full content engine — social, blogs, emails, ad copy",
      "Monthly Creative Energy for Goblin Studio",
      "Ongoing marketing ideas",
      "Top up energy anytime",
    ],
  },
];

const FAQS = [
  {
    q: "What do I actually get?",
    a: "Five brand names with a strategic pick and the reasoning behind it, ten taglines, a five-colour palette with hex codes and usage rules, brand voice, origin story, mascot concept, logo direction, website copy, social bios, launch posts, a 7-day launch plan, and a Brand DNA score. Twelve deliverables, generated together so they agree with each other.",
  },
  {
    q: "How long does it take?",
    a: "About two minutes end to end. Your name arrives in the first fifteen seconds and the rest lands section by section while you watch, so you are reading your brand while it is still being written.",
  },
  {
    q: "Do I need a credit card?",
    a: "No. The free plan is genuinely free and includes enough Creative Energy to generate a brand and try Goblin Studio. Upgrade only when you want more.",
  },
  {
    q: "Do I keep what I make?",
    a: "Yes. Anything you finish is yours to download and keep, on every plan, forever. Energy limits how much you create — never what you own.",
  },
  {
    q: "I already have a name. Can I still use this?",
    a: "Yes. Give Nix the name you already have and everything else — voice, colours, story, website copy, launch plan — gets built around it instead of replacing it.",
  },
  {
    q: "Isn't this just a chatbot with a mascot?",
    a: "It runs on Claude, but the difference is the brief, not the model. Twelve deliverables come out of one pass as a single brand, so the palette, the voice, and the copy reference each other. Stitching that together yourself is the six-hour part.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />

      {/* ── 1. Hero — headline, live demo, and the idea starters together ── */}
      <section id="hero" className="relative overflow-hidden pt-20 pb-32 sm:pt-28 sm:pb-48">
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

          {/* Idea starters — merged into the hero, they feed the input above */}
          <IdeaSparkSection />
        </div>
      </section>

      {/* ── 2. DIY vs Nix comparison ── */}
      <ComparisonSection />

      {/* ── 3. Real output demo + live wall of real creations ── */}
      <BrandKitPreview />

      {/* ── 4. The 12 deliverables ── */}
      <section id="features" className={`${SECTION_PAD} scroll-mt-24`}>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="badge-green mb-6">What&rsquo;s Inside Every Kit</span>
          <h2 className="section-heading mb-4">
            Your whole brand. One prompt. <span className="gradient-text">About two minutes.</span>
          </h2>
          <p className="section-sub mb-4 max-w-2xl mx-auto">
            No designer, no copywriter, no agency. Nix delivers everything you need to look and sound like a real brand — on day one.
          </p>
          <p className="text-sm text-secondary font-semibold mb-16">
            Generate your first brand free. No credit card required.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card bg-card-hover p-6 text-left group">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-white">{f.title}</h3>
                  <span className="badge-purple text-xs shrink-0">{f.badge}</span>
                </div>
                <p className="mb-3 text-xs text-muted leading-relaxed">{f.desc}</p>
                <div className="rounded-lg bg-primary/8 border border-primary/15 px-3 py-2">
                  <p className="text-xs font-mono text-secondary leading-relaxed">{f.sample}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. How it works, in 3 steps ── */}
      <section id="how-it-works" className={`bg-section-alt ${SECTION_PAD} scroll-mt-24`}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-purple mb-6">How It Works</span>
          <h2 className="section-heading mb-4">
            From blank page to <span className="gradient-text">launch-ready brand</span>
          </h2>
          <p className="section-sub mb-16">Three steps. Under two minutes. No design skills required.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-card bg-card-hover p-8 text-left">
                <span className="mb-4 block font-display text-4xl font-black text-primary/30">{step.step}</span>
                <h3 className="mb-2 font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="mb-4 text-sm text-muted leading-relaxed">{step.desc}</p>
                <div className="rounded-lg bg-primary/8 border border-primary/15 px-3 py-2">
                  <p className="text-xs font-mono text-secondary italic leading-relaxed">{step.example}</p>
                </div>
              </div>
            ))}
          </div>

          {/* The one place Nix speaks on this page. */}
          <blockquote className="mx-auto mt-16 max-w-xl">
            <p className="font-display text-2xl text-white/90">
              &ldquo;I take your idea as seriously as you do.&rdquo;
            </p>
            <footer className="mt-3 text-sm text-faint">Nix, your brand goblin</footer>
          </blockquote>

          {/* Replaces the old "The Loop" section — progress, not compulsion. */}
          <div className="mx-auto mt-20 max-w-2xl">
            <h3 className="font-display text-2xl font-bold text-white mb-4">Built for momentum</h3>
            <p className="text-base text-muted leading-relaxed">
              Every generation ends with a next step, so your brand keeps moving: idea, name, logo,
              launch. Milestones mark real progress: first kit, first logo, first product. Earned by
              creating, never bought.
            </p>
          </div>

          <div className="mt-16">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] shadow-[0_0_24px_rgba(255,107,53,0.5)] hover:opacity-90 transition-opacity"
            >
              Start free. No card needed.
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing summary ── */}
      <section className={SECTION_PAD}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge-green mb-6">Pricing</span>
          <h2 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h2>
          <p className="section-sub mb-4">Start creating for free — no card, no catch.</p>
          <p className="text-sm text-secondary font-semibold mb-16">
            Upgrade when you&rsquo;re ready. Cancel any time.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {PLANS.map((plan) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ + final CTA ── */}
      <section id="faq" className={`bg-section-alt ${SECTION_PAD} scroll-mt-24`}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <span className="badge-purple mb-6">Questions</span>
            <h2 className="section-heading mb-4">
              Everything you&rsquo;re <span className="gradient-text">about to ask</span>
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-card p-6 text-left">
                <h3 className="mb-2 font-display text-lg font-bold text-white">{item.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="relative mt-24 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-12 text-center">
            <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-40" />
            <div className="relative">
              <NixFloat
                src="/nix/happy-waving-nix.png"
                alt="Nix, your brand goblin"
                width={160}
                height={160}
                className="mx-auto mb-6 drop-shadow-[0_0_30px_rgba(124,58,237,0.6)]"
              />

              <h2 className="section-heading mb-4 text-4xl sm:text-5xl">
                Your brand is one <span className="gradient-text">idea away.</span>
              </h2>
              <p className="section-sub mb-3 text-lg max-w-xl mx-auto">
                Names, colors, voice, story, launch plan. Everything. Yours to keep.
              </p>

              <blockquote className="mx-auto mb-10 max-w-lg text-sm text-muted leading-relaxed">
                &ldquo;I built Nix because turning an idea into a brand shouldn&rsquo;t need an agency
                budget or a design degree.&rdquo;
                <footer className="mt-2 text-xs text-faint">Fox, founder of BrandGoblin AI</footer>
              </blockquote>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary px-10 py-4 text-lg">
                  Start free. No card needed.
                </Link>
                <Link href="/pricing" className="btn-secondary px-8 py-4 text-base">
                  See what&rsquo;s included
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
