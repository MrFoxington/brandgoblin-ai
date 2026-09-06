import Link from "next/link";
import MarketingShell from "@/components/marketing/MarketingShell";
import HeroInteractive from "@/components/HeroInteractive";
import NixFloat from "@/components/NixFloat";
import IdeaSparkSection from "@/components/IdeaSparkSection";
import ComparisonSection from "@/components/ComparisonSection";
import BrandKitPreview from "@/components/BrandKitPreview";

// Brand Maturity P2 (Aug 2026): seven sections, no decorative emoji, no manipulation
// copy, Nix speaks exactly once. Section rhythm is shared so the vertical spacing
// stays consistent everywhere — see SECTION_PAD.
// Brand Maturity P4 (Sept 2026): the grown-up visual system. Warm paper, ink,
// goblin green as the only action colour, Fraunces headlines, no gradients.
// Purple survives only where Nix himself appears (his aura).
const SECTION_PAD = "py-28 sm:py-40";

const FEATURES = [
  { title: "5 Brand Names", badge: "Naming",      sample: "Solace · Luminary · Drift · Vela · Cairn",            desc: "Nix picks a strategic favourite and tells you exactly why it wins." },
  { title: "10 Taglines",   badge: "Copy",        sample: '"Skin that feels like Sunday morning."',              desc: "Across tones: punchy, emotional, minimalist, bold, and premium." },
  { title: "Color Palette", badge: "Design",      sample: "#F5E6D3 · #C8A882 · #7B6B5A · #E8D5C4 · #3D3028",    desc: "5 colours with hex codes, usage rules, and psychological rationale." },
  { title: "Brand Voice",   badge: "Strategy",    sample: "Warm · Science-backed · Gentle · Words to use & avoid", desc: "Personality, tone, vocabulary, so every post sounds unmistakably you." },
  { title: "Brand Story",   badge: "Storytelling", sample: '"We built Solace because skin should feel like a ritual, not a chore."', desc: "Emotional origin story and customer-focused mission statement." },
  { title: "Mascot Concept", badge: "Creative",   sample: "Full character brief + AI image prompt ready to generate", desc: "Appearance, personality, backstory: your brand's visual identity." },
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
    desc: "Nix obsesses over every detail like it's his own brand, acting as your strategist, copywriter, and creative director all at once. No back-and-forth. No prompting loops.",
    example: "12 deliverables generating in parallel…",
  },
  {
    step: "03",
    title: "Launch with confidence",
    desc: "Your complete brand kit is ready. Copy-paste into your site, socials, and ads. You're ready to go, for real.",
    example: "Average time from prompt to kit: 1 min 52 sec",
  },
];

const PLANS = [
  {
    name: "Creator Max",
    price: "$49",
    period: "/month",
    desc: "Nix at full power.",
    highlight: false,
    badge: "Maximum value",
    subtext: "Four times the energy, strongest model, first access to new tools.",
    cta: "Go Creator Max",
    href: "/pricing",
    features: [
      "4,000 Creative Energy every month",
      "Nix runs on Claude's strongest model",
      "Unused energy rolls over",
      "4 Studio generations at once",
      "Everything in Creator Pro",
    ],
  },
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
      "Generate your brand: names, story, voice, colors, logo direction",
      "Try Goblin Studio free: real logos, social graphics & product art",
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
      "Full content engine: social, blogs, emails, ad copy",
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
    a: "Yes. Anything you finish is yours to download and keep, on every plan, forever. Energy limits how much you create, never what you own.",
  },
  {
    q: "I already have a name. Can I still use this?",
    a: "Yes. Give Nix the name you already have and everything else (voice, colours, story, website copy, launch plan) gets built around it instead of replacing it.",
  },
  {
    q: "Isn't this just a chatbot with a mascot?",
    a: "It runs on Claude, but the difference is the brief, not the model. Twelve deliverables come out of one pass as a single brand, so the palette, the voice, and the copy reference each other. Stitching that together yourself is the six-hour part.",
  },
];

export default function LandingPage() {
  return (
    <MarketingShell>

      {/* ── 1. Hero — headline, live demo, and the idea starters together ── */}
      <section id="hero" className="relative overflow-hidden pt-16 pb-28 sm:pt-24 sm:pb-40">
        {/* The one allowed tint: a soft warm-to-green wash behind the hero. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 75% 35%, rgba(46,125,91,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 15% 90%, rgba(251,191,36,0.10) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Left — interactive input */}
            <div id="hero-input" className="w-full">
              <HeroInteractive />
            </div>

            {/* Right — Nix floating. Purple lives here and only here: it's his colour. */}
            <div className="relative flex justify-center lg:flex-none shrink-0">
              <div
                className="pointer-events-none absolute inset-0 rounded-full opacity-60"
                style={{ background: "radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 65%)" }}
              />
              <NixFloat
                src="/nix/happy-waving-nix.png"
                alt="Nix the BrandGoblin AI brand strategist"
                width={440}
                height={440}
                className="relative w-56 sm:w-72 lg:w-[380px] drop-shadow-[0_18px_40px_rgba(124,58,237,0.30)]"
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
      <section id="features" className={`${SECTION_PAD} scroll-mt-24 bg-paper-2 border-y border-line`}>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="eyebrow mb-6">What&rsquo;s inside every kit</span>
          <h2 className="section-heading mb-5 text-4xl sm:text-5xl">
            Your whole brand. One prompt. <span className="accent">About two minutes.</span>
          </h2>
          <p className="section-sub mb-3 max-w-2xl mx-auto">
            No designer, no copywriter, no agency. Nix delivers everything you need to look and sound like a real brand, on day one.
          </p>
          <p className="text-sm text-goblin font-semibold mb-14">
            Generate your first brand free. No credit card required.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card bg-card-hover p-6 text-left group">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-ink">{f.title}</h3>
                  <span className="badge-neutral text-[11px] shrink-0">{f.badge}</span>
                </div>
                <p className="mb-4 text-sm text-ink-muted leading-relaxed">{f.desc}</p>
                <div className="rounded-lg bg-paper-2 border border-line px-3 py-2">
                  <p className="text-xs font-mono text-goblin-dark leading-relaxed">{f.sample}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. How it works, in 3 steps ── */}
      <section id="how-it-works" className={`${SECTION_PAD} scroll-mt-24`}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="eyebrow mb-6">How it works</span>
          <h2 className="section-heading mb-5 text-4xl sm:text-5xl">
            From blank page to <span className="accent">launch-ready brand</span>
          </h2>
          <p className="section-sub mb-14">Three steps. Under two minutes. No design skills required.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-card bg-card-hover p-8 text-left">
                <span className="mb-4 block font-display text-4xl font-semibold text-goblin/35">{step.step}</span>
                <h3 className="mb-2 font-display text-2xl font-semibold text-ink">{step.title}</h3>
                <p className="mb-5 text-sm text-ink-muted leading-relaxed">{step.desc}</p>
                <div className="rounded-lg bg-paper-2 border border-line px-3 py-2">
                  <p className="text-xs font-mono text-goblin-dark italic leading-relaxed">{step.example}</p>
                </div>
              </div>
            ))}
          </div>

          {/* The one place Nix speaks on this page. */}
          <blockquote className="mx-auto mt-16 max-w-xl">
            <p className="font-display text-3xl italic text-ink" style={{ fontVariationSettings: '"SOFT" 50' }}>
              &ldquo;I take your idea as seriously as you do.&rdquo;
            </p>
            <footer className="mt-3 text-sm text-ink-faint">Nix, your brand goblin</footer>
          </blockquote>

          {/* Replaces the old "The Loop" section — progress, not compulsion. */}
          <div className="mx-auto mt-20 max-w-2xl">
            <h3 className="font-display text-2xl font-semibold text-ink mb-4">Built for momentum</h3>
            <p className="text-base text-ink-muted leading-relaxed">
              Every generation ends with a next step, so your brand keeps moving: idea, name, logo,
              launch. Milestones mark real progress: first kit, first logo, first product. Earned by
              creating, never bought.
            </p>
          </div>

          <div className="mt-14">
            <Link href="/signup" className="btn-primary px-8 py-4 text-base">
              Start free. No card needed.
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing summary ── */}
      <section className={`${SECTION_PAD} bg-paper-2 border-y border-line`}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="eyebrow mb-6">Pricing</span>
          <h2 className="section-heading mb-5 text-4xl sm:text-5xl">
            Simple pricing. <span className="accent">Serious value.</span>
          </h2>
          <p className="section-sub mb-3">Start creating for free. No card, no catch.</p>
          <p className="text-sm text-goblin font-semibold mb-14">
            Upgrade when you&rsquo;re ready. Cancel any time.
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card bg-card-hover flex flex-col p-7 text-left ${plan.highlight ? "!border-goblin/60 ring-1 ring-goblin/30" : ""} ${
                  plan.name === "Creator Max" ? "lg:order-1" : plan.name === "Creator Pro" ? "lg:order-2" : "lg:order-3"
                }`}
              >
                {plan.badge && (
                  <span className={`mb-4 self-start ${plan.name === "Creator Max" ? "badge-neutral !border-gold/60 !bg-gold-tint !text-gold-dark" : "badge-goblin"}`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1 mb-1 text-sm text-ink-muted">{plan.desc}</p>
                {plan.subtext && <p className="mb-4 text-xs font-semibold text-goblin">{plan.subtext}</p>}
                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-semibold text-ink tracking-tight">{plan.price}</span>
                  <span className="text-sm text-ink-faint">{plan.period}</span>
                </div>
                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-2">
                      <span className="text-goblin mt-0.5 shrink-0 font-bold">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={plan.highlight ? "btn-primary" : "btn-secondary"}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-ink-muted">
            Anything you finish is yours. Every plan, forever.
          </p>
        </div>
      </section>

      {/* ── 7. FAQ + final CTA ── */}
      <section id="faq" className={`${SECTION_PAD} scroll-mt-24`}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <span className="eyebrow mb-6">Questions</span>
            <h2 className="section-heading mb-5 text-4xl sm:text-5xl">
              Everything you&rsquo;re <span className="accent">about to ask</span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-card p-6 text-left">
                <h3 className="mb-2 font-display text-xl font-semibold text-ink">{item.q}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Final CTA — the page closes on ink. Nix keeps his aura; the button is green. */}
          <div className="relative mt-24 overflow-hidden rounded-3xl bg-ink px-6 py-14 sm:px-12 sm:py-16 text-center text-paper">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(46,125,91,0.35) 0%, transparent 60%)" }}
            />
            <div className="relative">
              <div className="relative mx-auto mb-6 w-[160px]">
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 65%)" }}
                />
                <NixFloat
                  src="/nix/happy-waving-nix.png"
                  alt="Nix, your brand goblin"
                  width={160}
                  height={160}
                  className="relative"
                />
              </div>

              <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight mb-5">
                Your brand is one <span className="accent !text-emerald-300">idea away.</span>
              </h2>
              <p className="mb-3 text-lg text-paper/80 max-w-xl mx-auto">
                Names, colors, voice, story, launch plan. Everything. Yours to keep.
              </p>

              <blockquote className="mx-auto mb-10 max-w-lg text-sm text-paper/60 leading-relaxed">
                &ldquo;I built Nix because turning an idea into a brand shouldn&rsquo;t need an agency
                budget or a design degree.&rdquo;
                <footer className="mt-2 text-xs text-paper/45">Fox, founder of BrandGoblin AI</footer>
              </blockquote>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary px-10 py-4 text-lg">
                  Start free. No card needed.
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-[0.875rem] border border-paper/25 px-8 py-4 text-base font-semibold text-paper hover:bg-paper/10 transition-colors"
                >
                  See what&rsquo;s included
                </Link>
              </div>

              <p className="mt-6 text-xs text-paper/45">
                No credit card · No design skills · About two minutes · Cancel any time
              </p>
            </div>
          </div>
        </div>
      </section>

    </MarketingShell>
  );
}
