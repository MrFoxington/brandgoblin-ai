import Link from "next/link";
import clsx from "clsx";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  priceId?: string;
}

export default function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={clsx(
        "goblin-card flex flex-col p-6 text-left",
        plan.highlighted && "border-goblin-purple shadow-glow"
      )}
    >
      {plan.highlighted ? (
        <span className="mb-3 inline-block w-fit rounded-full bg-goblin-purple/20 px-3 py-1 text-xs font-semibold text-goblin-purple-light">
          Most popular
        </span>
      ) : null}
      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-white">{plan.price}</span>
        <span className="text-sm text-zinc-400">{plan.period}</span>
      </div>

      <ul className="mt-6 flex-1 space-y-2 text-sm text-zinc-300">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-goblin-emerald">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={clsx(
          "mt-6 w-full",
          plan.highlighted ? "goblin-btn-primary" : "goblin-btn-secondary"
        )}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
