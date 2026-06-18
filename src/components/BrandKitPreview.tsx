"use client";

import { useEffect, useRef, useState } from "react";

const BRAND = {
  name: "Solace Skincare",
  taglines: [
    "Skin that feels like Sunday morning.",
    "Less noise. More glow.",
    "Science you can feel. Calm you can see.",
  ],
  colors: [
    { hex: "#F5E6D3", name: "Warm Ivory", role: "Primary Background" },
    { hex: "#C8A882", name: "Golden Sand", role: "Accent" },
    { hex: "#7B6B5A", name: "Warm Earth", role: "Body Text" },
    { hex: "#E8D5C4", name: "Blush Mist", role: "Secondary BG" },
    { hex: "#3D3028", name: "Deep Cocoa", role: "Headlines" },
  ],
  voice: {
    traits: ["Warm", "Science-backed", "Gentle", "Trustworthy"],
    use: ["\"nourish\"", "\"ritual\"", "\"restore\"", "\"calm\""],
    avoid: ["\"anti-aging\"", "\"fix\"", "\"perfect\""],
  },
  names: ["Solace", "Luminary", "Drift", "Vela", "Cairn"],
  post: "Your skin isn't broken. It's just waiting for the right ritual. ✨ Introducing Solace — skincare that meets you where you are, not where beauty standards say you should be. Link in bio to try your first ritual free. #SolaceSkin #CleanBeauty #SkincareRitual",
  heroHeadline: "Skin that feels like Sunday morning.",
  heroSub: "Clean, science-backed formulas for skin that glows from within. No harsh chemicals. No empty promises. Just calm, nourished skin — every day.",
};

function AnimatedNumber({ target, visible }: { target: number; visible: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [visible, target]);
  return <>{count}</>;
}

export default function BrandKitPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"names" | "colors" | "voice" | "copy" | "post">("names");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const TABS = [
    { id: "names", label: "🏷️ Brand Names" },
    { id: "colors", label: "🎨 Color Palette" },
    { id: "voice", label: "🎭 Brand Voice" },
    { id: "copy", label: "🌐 Website Copy" },
    { id: "post", label: "📱 Social Post" },
  ] as const;

  return (
    <section ref={ref} className="py-28">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="badge-green mb-6">✦ See It In Action</span>
          <h2 className="section-heading mb-4">
            This is what Nix builds — <span className="gradient-text">in 2 minutes</span>
          </h2>
          <p className="section-sub max-w-2xl mx-auto">
            Real output. One prompt: <em className="text-white not-italic">"A calm, science-backed skincare brand for people who are done with harsh chemicals."</em>
          </p>
        </div>

        {/* Main preview card */}
        <div
          className={`rounded-3xl border border-primary/20 bg-[rgba(12,10,24,0.95)] overflow-hidden transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/2 px-6 py-4">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <div className="ml-4 flex-1 rounded-full bg-white/5 px-4 py-1 text-xs text-faint">
              brandgoblin.ai/dashboard/brand-kit
            </div>
            <div className="rounded-full bg-secondary/20 border border-secondary/30 px-3 py-1 text-xs text-secondary font-medium">
              ✓ Generated
            </div>
          </div>

          {/* Brand header */}
          <div className="border-b border-white/5 px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs uppercase tracking-widest text-faint">Brand Name</span>
                  <span className="rounded-full bg-secondary/15 border border-secondary/25 px-2 py-0.5 text-xs text-secondary">Nix Pick ✦</span>
                </div>
                <h3 className="font-display text-3xl font-black text-white">{BRAND.name}</h3>
                <p className="text-base text-muted mt-1 italic">&ldquo;{BRAND.taglines[0]}&rdquo;</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2">
                <span className="text-2xl">🧌</span>
                <div>
                  <p className="text-xs text-faint">Generation time</p>
                  <p className="text-sm font-bold text-white">1 min 52 sec</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex overflow-x-auto gap-1 border-b border-white/5 px-6 pt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary-light border-t border-x border-primary/30"
                    : "text-muted hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-8 min-h-[280px]">
            {activeTab === "names" && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {BRAND.names.map((name, i) => (
                  <div
                    key={name}
                    className={`rounded-2xl p-4 text-center transition-all duration-300 ${
                      i === 0
                        ? "bg-gradient-to-b from-primary/30 to-primary/10 border-2 border-primary/40"
                        : "bg-white/3 border border-white/8 hover:border-primary/30"
                    }`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    {i === 0 && <div className="text-[10px] uppercase tracking-wider text-secondary mb-1 font-bold">Nix Pick</div>}
                    <p className="font-display text-lg font-bold text-white">{name}</p>
                    {i === 0 && <p className="text-[10px] text-muted mt-1">Strategic favorite</p>}
                  </div>
                ))}
                <div className="col-span-2 sm:col-span-5 rounded-xl bg-white/3 border border-white/8 p-4 mt-2">
                  <p className="text-xs text-faint mb-1 uppercase tracking-wide font-medium">Why &ldquo;Solace&rdquo;?</p>
                  <p className="text-sm text-muted leading-relaxed">Evokes calm and relief — exactly what your customer wants when they&rsquo;re overwhelmed by harsh skincare. Memorable, one word, available as a .com, and works globally without translation issues.</p>
                </div>
              </div>
            )}

            {activeTab === "colors" && (
              <div className="space-y-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {BRAND.colors.map((c, i) => (
                    <div
                      key={c.hex}
                      className={`shrink-0 rounded-2xl overflow-hidden border border-white/10 transition-all duration-400 ${
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      <div className="h-20 w-28" style={{ backgroundColor: c.hex }} />
                      <div className="p-3 bg-white/4">
                        <p className="text-xs font-mono text-white font-bold">{c.hex}</p>
                        <p className="text-xs text-white font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-white/3 border border-white/8 p-4">
                  <p className="text-xs text-faint uppercase tracking-wide mb-2 font-medium">Usage Rule from Nix</p>
                  <p className="text-sm text-muted">Use Warm Ivory as your page background, Deep Cocoa for headlines, Golden Sand for buttons and CTAs. Blush Mist for section breaks. Never put two warm tones side by side without a neutral spacer.</p>
                </div>
              </div>
            )}

            {activeTab === "voice" && (
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-secondary/10 border border-secondary/20 p-5">
                  <p className="text-xs uppercase tracking-widest text-secondary font-bold mb-3">Personality Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {BRAND.voice.traits.map((t) => (
                      <span key={t} className="rounded-full bg-secondary/15 border border-secondary/25 px-3 py-1 text-sm text-secondary font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
                  <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-3">✓ Words to Use</p>
                  <div className="space-y-1">
                    {BRAND.voice.use.map((w) => (
                      <p key={w} className="text-sm text-white font-mono">{w}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
                  <p className="text-xs uppercase tracking-widest text-red-400 font-bold mb-3">✕ Words to Avoid</p>
                  <div className="space-y-1">
                    {BRAND.voice.avoid.map((w) => (
                      <p key={w} className="text-sm text-muted font-mono line-through">{w}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "copy" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/3 border border-white/8 p-6">
                  <p className="text-xs uppercase tracking-widest text-faint font-medium mb-3">Hero Headline</p>
                  <p className="font-display text-2xl font-black text-white leading-tight">{BRAND.heroHeadline}</p>
                </div>
                <div className="rounded-2xl bg-white/3 border border-white/8 p-6">
                  <p className="text-xs uppercase tracking-widest text-faint font-medium mb-3">Hero Subheadline</p>
                  <p className="text-base text-muted leading-relaxed">{BRAND.heroSub}</p>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-muted">
                  <span className="text-primary-light font-semibold">+ 8 more copy blocks included:</span>{" "}
                  About section · Features · CTA · Footer tagline · Email subject lines · Product descriptions · FAQ intro · Press bio
                </div>
              </div>
            )}

            {activeTab === "post" && (
              <div className="max-w-lg mx-auto">
                <div className="rounded-2xl bg-white/3 border border-white/8 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                    <div>
                      <p className="text-sm font-bold text-white">solaceskincare</p>
                      <p className="text-xs text-muted">Instagram · Launch post</p>
                    </div>
                    <div className="ml-auto rounded-full bg-secondary/15 border border-secondary/25 px-2 py-0.5 text-xs text-secondary">Ready to post</div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{BRAND.post}</p>
                  <div className="mt-4 flex gap-2">
                    {["❤️ 0", "💬 0", "↗️ Share"].map((a) => (
                      <span key={a} className="text-xs text-faint">{a}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-faint text-center mt-4">+ 4 more launch posts included (X/Twitter, TikTok caption, LinkedIn, Pinterest)</p>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="border-t border-white/5 bg-white/2 px-8 py-4 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Deliverables", val: 12 },
              { label: "Sec to generate", val: 112 },
              { label: "Agency equivalent ($)", val: 4800 },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="font-display text-2xl font-black text-white">
                  {label === "Agency equivalent ($)" ? "$" : ""}
                  <AnimatedNumber target={val} visible={visible} />
                  {label === "Agency equivalent ($)" ? "+" : ""}
                </p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted text-sm">This is a <span className="text-white font-medium">real output</span> from BrandGoblin AI. Your brand. Your idea. Same quality.</p>
        </div>
      </div>
    </section>
  );
}
