"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CARDS = [
  { icon: "🚀", label: "Social Media", desc: "Posts, captions & hashtags", href: "/dashboard/creator-pro", color: "hover:border-purple-500/40 hover:bg-purple-500/8" },
  { icon: "🌐", label: "Website Copy", desc: "Headlines, about & CTAs", href: "/dashboard/creator-pro", color: "hover:border-blue-500/40 hover:bg-blue-500/8" },
  { icon: "📧", label: "Email Campaigns", desc: "Welcome, nurture & promos", href: "/dashboard/creator-pro", color: "hover:border-green-500/40 hover:bg-green-500/8" },
  { icon: "📰", label: "Blog Posts", desc: "SEO-ready long-form content", href: "/dashboard/creator-pro", color: "hover:border-yellow-500/40 hover:bg-yellow-500/8" },
  { icon: "📈", label: "Ad Copy", desc: "Facebook, Instagram & Google", href: "/dashboard/creator-pro", color: "hover:border-orange-500/40 hover:bg-orange-500/8" },
  { icon: "📦", label: "Product Descriptions", desc: "Convert browsers to buyers", href: "/dashboard/creator-pro", color: "hover:border-pink-500/40 hover:bg-pink-500/8" },
  { icon: "🎙", label: "Podcast", desc: "Show names, intros & episodes", href: "/dashboard/creator-pro", color: "hover:border-red-500/40 hover:bg-red-500/8" },
  { icon: "🎁", label: "Merchandise", desc: "Product ideas & descriptions", href: "/dashboard/creator-pro", color: "hover:border-teal-500/40 hover:bg-teal-500/8" },
];

export default function ContinueBuilding({ brandId }: { brandId?: string }) {
  const base = brandId ? `/dashboard/creator-pro?brandId=${brandId}` : "/dashboard/creator-pro";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-bold tracking-[0.3em] uppercase text-primary-light"
        >
          ✦ Keep the magic going ✦
        </motion.p>
        <h2 className="font-display text-2xl font-black text-white">Continue Building</h2>
        <p className="text-sm text-muted">Your brand is alive — now let&apos;s give it a voice.</p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
          >
            <Link
              href={base}
              className={`flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/3 p-4 text-center transition-all duration-200 ${card.color} hover:scale-105 group`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {card.icon}
              </span>
              <span className="text-sm font-bold text-white">{card.label}</span>
              <span className="text-xs text-faint leading-snug">{card.desc}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <Link href={base} className="btn-primary px-8 py-3 inline-block">
          ✨ Open Creator Pro Studio
        </Link>
        <p className="text-xs text-faint mt-2">Never run out of content ideas again.</p>
      </motion.div>
    </motion.div>
  );
}
