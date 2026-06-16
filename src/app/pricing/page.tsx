import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="badge-green mb-6">✦ Pricing</span>
          <h1 className="section-heading mb-4">
            Simple, <span className="gradient-text">goblin-fair</span> pricing
          </h1>
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
                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-secondary mt-0.5 shrink-0">✓</span>
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
      </main>
      <Footer />
    </div>
  );
}
