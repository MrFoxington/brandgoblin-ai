import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try the magic before you commit.",
    features: ["3 brand generations", "Full brand kit per generation", "Save to your vault"],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
    priceId: undefined,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For founders launching real brands.",
    features: [
      "Unlimited brand generations",
      "Unlimited saved brands",
      "Full, premium brand kits",
      "Priority generation speed",
    ],
    cta: "Upgrade to Pro",
    href: "/settings",
    highlighted: true,
    priceId: "STRIPE_PRICE_ID_PRO",
  },
  {
    name: "Agency",
    price: "$49",
    period: "/month",
    description: "For agencies and consultants serving clients.",
    features: [
      "Everything in Pro",
      "Client-ready brand kits",
      "Bulk generation",
      "White-label-ready output",
    ],
    cta: "Upgrade to Agency",
    href: "/settings",
    highlighted: false,
    priceId: "STRIPE_PRICE_ID_AGENCY",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Simple, goblin-fair pricing
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Start free. Upgrade when your brand starts making you money.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
