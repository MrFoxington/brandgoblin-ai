"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BrandKit, BrandInput, NameStrengthCheck } from "@/types";
import CopyButton from "./CopyButton";
import BrandNamesSection from "./BrandNamesSection";
import GoblinFavoritePick from "./GoblinFavoritePick";
import BrandDNA from "./BrandDNA";
import ContinueBuilding from "./ContinueBuilding";
import ShareCard from "./ShareCard";
import UpgradeNudge from "./UpgradeNudge";
import NixPose from "./primitives/NixPose";
import Sparkles from "./primitives/Sparkles";
import { RevealProvider, RevealCard, SkipRevealButton } from "./primitives/Reveal";
import WebsitePreview from "./WebsitePreview";
import { useSoundFx, SoundToggle } from "./primitives/SoundFx";
import { trackEvent } from "@/lib/analytics";
import { createContext, useContext } from "react";

// Context so CopyButton can read brandId without prop-threading every call
const BrandIdContext = createContext<string | undefined>(undefined);
export function useBrandId() { return useContext(BrandIdContext); }

type SectionKey =
  | "taglines" | "brandStory" | "brandVoice" | "mascot"
  | "logoDirection" | "colorPalette" | "websiteCopy" | "socialKit"
  | "marketingIdeas" | "launchPlan";

// Section card wrapper
function SectionCard({
  emoji, title, badge, copyText, sectionKey, rerollsUsed, rerolling, onReroll, children,
}: {
  emoji: string; title: string; badge?: string; copyText?: string;
  sectionKey?: SectionKey; rerollsUsed: Set<string>; rerolling: string | null;
  onReroll?: (key: SectionKey) => void; children: React.ReactNode;
}) {
  const used = sectionKey ? rerollsUsed.has(sectionKey) : false;
  const isRerolling = sectionKey ? rerolling === sectionKey : false;
  return (
    <section className="bg-card flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <span>{emoji}</span> {title}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {badge && <span className="badge-purple text-xs">{badge}</span>}
          {copyText && <CopyButton text={copyText} silent />}
          {sectionKey && onReroll && (
            <button type="button" disabled={used || isRerolling}
              onClick={() => onReroll(sectionKey)}
              className="btn-ghost !text-xs !py-1 !px-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {isRerolling ? "🧌 Remixing…" : used ? "Re-Conjure Used" : "🔄 Re-Conjure"}
            </button>
          )}
        </div>
      </div>
      {isRerolling && <p className="text-xs text-muted italic animate-pulse">The goblin is remixing this…</p>}
      {children}
    </section>
  );
}

function Chip({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return <span className={green ? "badge-green" : "badge-purple"} style={{ fontSize: "0.7rem" }}>{children}</span>;
}

// "Copy whole section" text for Website Copy — includes any of the new optional fields that exist.
function websiteCopyText(kit: BrandKit): string {
  const w = kit.websiteCopy;
  const parts: string[] = [w.heroHeadline, w.subheadline, "", `CTA: ${w.ctaText}`];
  if (w.secondaryCtaText) parts.push(`Secondary CTA: ${w.secondaryCtaText}`);
  parts.push("", w.aboutSection);
  if (w.features && w.features.length > 0) {
    parts.push("", "Features:", ...w.features.map((f) => `- ${f.title}: ${f.description}`));
  } else {
    parts.push("", "Features:", ...w.featureBullets.map((b) => `- ${b}`));
  }
  if (w.faqs && w.faqs.length > 0) {
    parts.push("", "FAQ:", ...w.faqs.map((q) => `Q: ${q.question}\nA: ${q.answer}`));
  }
  if (w.seoTitle) parts.push("", `SEO Title: ${w.seoTitle}`);
  if (w.metaDescription) parts.push(`Meta Description: ${w.metaDescription}`);
  if (w.emailCaptureHeadline) parts.push("", `Email capture: ${w.emailCaptureHeadline}`);
  if (w.footerTagline) parts.push(`Footer: ${w.footerTagline}`);
  return parts.join("\n");
}

function NameStrengthCheckView({ nsc }: { nsc: NameStrengthCheck }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[
        { color: "green", label: "What Works", text: nsc.whatWorks },
        { color: "yellow", label: "Potential Concerns", text: nsc.potentialConcerns },
        { color: "primary", label: "Suggested Refinement", text: nsc.suggestedRefinement },
        { color: "secondary", label: "Best Positioning Angle", text: nsc.bestPositioningAngle },
      ].map(({ color, label, text }) => (
        <div key={label} className={`rounded-xl border border-${color}-500/20 bg-${color}-500/5 p-4`}>
          <p className={`text-xs font-bold uppercase tracking-widest text-${color}-400 mb-2`}>{label}</p>
          <p className="text-sm text-muted leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  );
}

// ── The "kit is complete" closure moment ─────────────────────────────────────
function CompleteMoment({ onDone }: { onDone: () => void }) {
  const { playComplete } = useSoundFx();
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    playComplete();
    const t = setTimeout(onDone, shouldReduce ? 0 : 2800);
    return () => clearTimeout(t);
  }, [onDone, playComplete, shouldReduce]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center gap-5 py-12 text-center overflow-hidden"
    >
      <Sparkles count={14} />
      <NixPose pose="celebrating" size={130} glow priority />
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-green-400">✅ Brand Kit Complete</p>
        <h2 className="font-display text-3xl font-black text-white">Your brand is ready.</h2>
        <p className="text-sm text-muted">Every deliverable. Every word. All yours.</p>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BrandKitView({
  kit: initialKit, brandInput, brandGenerationId, initialRerollsUsed = [], userPlan = "free",
}: {
  kit: BrandKit; brandInput?: BrandInput; brandGenerationId?: string; initialRerollsUsed?: string[]; userPlan?: "free" | "pro" | "agency";
}) {
  const [kit, setKit] = useState<BrandKit>(initialKit);
  const [rerollsUsed, setRerollsUsed] = useState<Set<string>>(new Set(initialRerollsUsed));
  const [rerolling, setRerolling] = useState<string | null>(null);
  const [rerollErrors, setRerollErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"reveal" | "complete" | "done">("reveal");
  const [showWebPreview, setShowWebPreview] = useState(false); // 🌐 Website Preview modal
  const { playReveal } = useSoundFx();
  const shouldReduce = useReducedMotion();

  // Play reveal sound + track kit view on mount
  useEffect(() => {
    playReveal();
    trackEvent("brand_kit_viewed", { brandId: brandGenerationId });
  }, [playReveal, brandGenerationId]);

  async function handleReroll(sectionKey: SectionKey) {
    if (!brandInput || rerollsUsed.has(sectionKey) || rerolling) return;
    setRerolling(sectionKey);
    setRerollErrors((p) => ({ ...p, [sectionKey]: "" }));
    try {
      const res = await fetch("/api/generate/section", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey === "logoDirection" ? "logoPrompt" : sectionKey, brandName: kit.recommendedName, input: brandInput, kit, brandGenerationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed.");
      setKit((p) => ({ ...p, ...json.data }));
      setRerollsUsed((p) => new Set(p).add(sectionKey));
    } catch (err) {
      setRerollErrors((p) => ({ ...p, [sectionKey]: err instanceof Error ? err.message : "The goblin tripped." }));
    } finally { setRerolling(null); }
  }

  const sp = (key: SectionKey) => ({ sectionKey: key, rerollsUsed, rerolling, onReroll: brandInput ? handleReroll : undefined });
  const noReroll = { rerollsUsed, rerolling };

  function RerollError({ sectionKey }: { sectionKey: SectionKey }) {
    const msg = rerollErrors[sectionKey];
    return msg ? <p className="text-xs text-red-400">{msg}</p> : null;
  }

  // Sections in reveal order — each gets an index for stagger timing
  const sections = [
    // 0: Goblin's Favorite Pick
    <GoblinFavoritePick key="pick"
      favoriteName={kit.favoriteName} alternativeNames={kit.alternativeNames}
      recommendedName={kit.recommendedName} brandNames={kit.brandNames} />,

    // 1: Brand DNA (model-scored; renders nothing for old brands without brandDna)
    <BrandDNA key="dna" kit={kit} />,

    // 2: All Names
    <SectionCard key="names" emoji="🏆" title="All Brand Names" badge="Naming" {...noReroll}>
      <BrandNamesSection favoriteName={kit.favoriteName} alternativeNames={kit.alternativeNames}
        brandNames={kit.brandNames} topThreeReasoning={kit.topThreeReasoning}
        recommendedName={kit.recommendedName} brandInput={brandInput} />
    </SectionCard>,

    // 3: Name Strength (conditional)
    ...(kit.nameStrengthCheck ? [
      <SectionCard key="nsc" emoji="🔍" title="Name Strength Check" badge="Analysis" {...noReroll}>
        <NameStrengthCheckView nsc={kit.nameStrengthCheck} />
      </SectionCard>
    ] : []),

    // 4: Taglines
    <SectionCard key="taglines" emoji="💬" title="Taglines" badge="Copywriting" copyText={kit.taglines.join("\n")} {...sp("taglines")}>
      <RerollError sectionKey="taglines" />
      <ul className="space-y-2">
        {kit.taglines.map((t, i) => (
          <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] px-3 py-2 text-sm text-white">
            <span>&ldquo;{t}&rdquo;</span><CopyButton text={t} label="" />
          </li>
        ))}
      </ul>
    </SectionCard>,

    // 5: Brand Story
    <SectionCard key="story" emoji="📖" title="Brand Story" badge="Storytelling"
      copyText={`${kit.brandStory.originStory}\n\n${kit.brandStory.mission}`} {...sp("brandStory")}>
      <RerollError sectionKey="brandStory" />
      <p className="text-sm text-muted leading-relaxed">{kit.brandStory.originStory}</p>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary-light leading-relaxed">{kit.brandStory.mission}</p>
      </div>
    </SectionCard>,

    // 6: Color Palette
    <SectionCard key="colors" emoji="🎨" title="Color Palette" badge="Design"
      copyText={kit.colorPalette.map((c) => `${c.name}: ${c.hex}`).join("\n")} {...sp("colorPalette")}>
      <RerollError sectionKey="colorPalette" />
      <div className="space-y-2">
        {kit.colorPalette.map((c) => (
          <div key={c.hex} className="flex items-center gap-3 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <span className="h-10 w-10 shrink-0 rounded-lg border border-white/10" style={{ backgroundColor: c.hex }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{c.name}</p>
              <p className="text-xs text-faint font-mono">{c.hex}</p>
              <p className="text-xs text-muted truncate">{c.usage}</p>
            </div>
            <CopyButton text={c.hex} label="" />
          </div>
        ))}
      </div>
    </SectionCard>,

    // 7: Brand Voice
    <SectionCard key="voice" emoji="🎭" title="Brand Voice" badge="Strategy" {...sp("brandVoice")}>
      <RerollError sectionKey="brandVoice" />
      <div className="space-y-4 text-sm">
        <div>
          <p className="label mb-2">Personality traits</p>
          <div className="flex flex-wrap gap-2">{kit.brandVoice.personalityTraits.map((t) => <Chip key={t}>{t}</Chip>)}</div>
        </div>
        <div>
          <p className="label mb-2">Tone examples</p>
          <ul className="space-y-1 text-muted">
            {kit.brandVoice.toneExamples.map((t, i) => (
              <li key={i} className="flex items-start gap-2"><span className="text-primary-light mt-0.5">→</span>{t}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="label mb-2 text-secondary">✓ Use</p>
            <div className="flex flex-wrap gap-1.5">{kit.brandVoice.wordsToUse.map((w) => <Chip key={w} green>{w}</Chip>)}</div>
          </div>
          <div>
            <p className="label mb-2 text-red-400">✗ Avoid</p>
            <div className="flex flex-wrap gap-1.5">
              {kit.brandVoice.wordsToAvoid.map((w) => (
                <span key={w} className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-400">{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>,

    // 8: Logo Direction (renamed from "Logo Prompt")
    <SectionCard key="logo" emoji="🖼️" title="Logo Direction" badge="Design" copyText={kit.logoPrompt} {...sp("logoDirection")}>
      <RerollError sectionKey="logoDirection" />
      <div className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-4 space-y-3">
        <p className="text-sm text-muted leading-relaxed">{kit.logoPrompt}</p>
        <div className="pt-2 border-t border-white/8">
          <p className="text-xs text-primary-light font-semibold">🎨 Generate this logo →</p>
          <p className="text-xs text-faint mt-0.5">Coming soon: Goblin Studio will bring this to life.</p>
        </div>
      </div>
    </SectionCard>,

    // 9: Mascot
    <SectionCard key="mascot" emoji="🐲" title="Mascot Concept" badge="Creative" copyText={kit.mascot.imagePrompt} {...sp("mascot")}>
      <RerollError sectionKey="mascot" />
      <p className="font-display text-xl font-bold text-white">{kit.mascot.name}</p>
      <p className="text-sm text-muted leading-relaxed">{kit.mascot.appearance}</p>
      <p className="text-sm text-muted leading-relaxed">{kit.mascot.personality}</p>
      <p className="text-sm italic text-faint leading-relaxed">{kit.mascot.visualDescription}</p>
      <div className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-light">AI Image Prompt</p>
        <p className="text-xs text-muted leading-relaxed">{kit.mascot.imagePrompt}</p>
      </div>
    </SectionCard>,

    // 10: Website Copy
    <SectionCard key="web" emoji="🌐" title="Website Copy" badge="Copy"
      copyText={websiteCopyText(kit)}
      {...sp("websiteCopy")}>
      <RerollError sectionKey="websiteCopy" />
      {brandGenerationId && (
        <a
          href={`/brand/${brandGenerationId}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex items-center gap-1.5 !py-1.5 !px-3 text-xs self-start"
        >
          👁 Preview as Webpage
        </a>
      )}
      <div className="space-y-4">
        <div><p className="label mb-1">Hero headline</p><p className="font-display text-xl font-extrabold text-white">{kit.websiteCopy.heroHeadline}</p></div>
        <div><p className="label mb-1">Subheadline</p><p className="text-sm text-muted">{kit.websiteCopy.subheadline}</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div><p className="label mb-1">CTA button</p><span className="btn-primary inline-flex !py-2 !px-4 text-sm !animate-none">{kit.websiteCopy.ctaText}</span></div>
          {kit.websiteCopy.secondaryCtaText && (
            <div><p className="label mb-1">Secondary CTA</p><span className="btn-secondary inline-flex !py-2 !px-4 text-sm">{kit.websiteCopy.secondaryCtaText}</span></div>
          )}
        </div>
        <div><p className="label mb-1">About section</p><p className="text-sm text-muted leading-relaxed">{kit.websiteCopy.aboutSection}</p></div>

        {/* Features — rich rows if present, else bullets */}
        {kit.websiteCopy.features && kit.websiteCopy.features.length > 0 ? (
          <div>
            <p className="label mb-2">Features</p>
            <div className="space-y-2">
              {kit.websiteCopy.features.map((f, i) => (
                <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-muted mt-0.5 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="label mb-2">Feature bullets</p>
            <ul className="space-y-1.5">
              {kit.websiteCopy.featureBullets.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted"><span className="text-secondary mt-0.5">✓</span>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* FAQs */}
        {kit.websiteCopy.faqs && kit.websiteCopy.faqs.length > 0 && (
          <div>
            <p className="label mb-2">FAQs</p>
            <div className="space-y-2">
              {kit.websiteCopy.faqs.map((q, i) => (
                <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
                  <p className="text-sm font-semibold text-white">{q.question}</p>
                  <p className="text-sm text-muted mt-0.5 leading-relaxed">{q.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO */}
        {(kit.websiteCopy.seoTitle || kit.websiteCopy.metaDescription) && (
          <div>
            <p className="label mb-2">SEO</p>
            <div className="space-y-2">
              {kit.websiteCopy.seoTitle && (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
                  <div><p className="text-xs text-faint">Title tag</p><p className="text-sm text-white">{kit.websiteCopy.seoTitle}</p></div>
                  <CopyButton text={kit.websiteCopy.seoTitle} label="" className="shrink-0" />
                </div>
              )}
              {kit.websiteCopy.metaDescription && (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
                  <div><p className="text-xs text-faint">Meta description</p><p className="text-sm text-muted">{kit.websiteCopy.metaDescription}</p></div>
                  <CopyButton text={kit.websiteCopy.metaDescription} label="" className="shrink-0" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer + email capture */}
        {(kit.websiteCopy.footerTagline || kit.websiteCopy.emailCaptureHeadline) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {kit.websiteCopy.footerTagline && (
              <div><p className="label mb-1">Footer tagline</p><p className="text-sm text-muted">{kit.websiteCopy.footerTagline}</p></div>
            )}
            {kit.websiteCopy.emailCaptureHeadline && (
              <div><p className="label mb-1">Email capture headline</p><p className="text-sm text-muted">{kit.websiteCopy.emailCaptureHeadline}</p></div>
            )}
          </div>
        )}

        {/* 🌐 Website Preview — see the copy as a real homepage (zero energy) */}
        <button
          type="button"
          onClick={() => { setShowWebPreview(true); trackEvent("website_preview_opened", {}); }}
          className="w-full rounded-xl border border-primary/40 bg-primary/10 px-4 py-3.5 text-sm font-bold text-primary-light transition-colors hover:bg-primary/20 hover:text-white"
        >
          🌐 See it live — preview your website
        </button>

        {/* Where to launch this — close the loop between copy and a live site */}
        <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-4 space-y-1.5">
          <p className="text-xs font-bold tracking-widest uppercase text-secondary">🚀 Where to launch this</p>
          <p className="text-sm text-muted leading-relaxed">
            Paste this copy into a free{" "}
            <a
              href="https://carrd.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline decoration-secondary/50 underline-offset-2 hover:decoration-secondary"
            >
              Carrd
            </a>{" "}
            one-page site and your brand can be LIVE in about 20 minutes — no account needed to start building.
          </p>
          <p className="text-xs text-faint leading-relaxed">
            Ready for a full website? Nix recommends{" "}
            <a
              href="https://www.godaddy.com/airo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-muted underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              GoDaddy Airo
            </a>{" "}
            — brandgoblinai.com was built with Airo, powered by Nix. Seeing your idea live changes everything. 🧌
          </p>
        </div>
      </div>
    </SectionCard>,

    // 11: Social Kit
    <SectionCard key="social" emoji="📱" title="Social Media Kit" badge="Social"
      copyText={`Instagram: ${kit.socialKit.instagramBio}\nX: ${kit.socialKit.twitterBio}\nTikTok: ${kit.socialKit.tiktokBio}`}
      {...sp("socialKit")}>
      <RerollError sectionKey="socialKit" />
      <div className="space-y-3">
        {[{ platform: "Instagram", bio: kit.socialKit.instagramBio }, { platform: "X / Twitter", bio: kit.socialKit.twitterBio }, { platform: "TikTok", bio: kit.socialKit.tiktokBio }].map(({ platform, bio }) => (
          <div key={platform} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-bold text-primary-light">{platform}</p><CopyButton text={bio} label="" />
            </div>
            <p className="text-sm text-muted">{bio}</p>
          </div>
        ))}
        <div>
          <p className="label mb-2">Launch posts</p>
          <div className="space-y-2">
            {kit.socialKit.launchPosts.map((p, i) => (
              <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white leading-relaxed">{p}</p>
                  <CopyButton text={p} label="" className="shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>,

    // 12: Marketing Ideas
    <SectionCard key="mktg" emoji="🚀" title="Marketing & Meme Ideas" badge="Growth" {...sp("marketingIdeas")}>
      <RerollError sectionKey="marketingIdeas" />
      <div className="space-y-5 text-sm">
        {[
          { label: "Viral content ideas", items: kit.marketingIdeas.viralContentIdeas, color: "text-primary-light" },
          { label: "Meme ideas", items: kit.marketingIdeas.memeIdeas, color: "text-secondary" },
          { label: "Ad angles", items: kit.marketingIdeas.adAngles, color: "text-primary-light" },
        ].map(({ label, items, color }) => (
          <div key={label}>
            <p className="label mb-2">{label}</p>
            <ul className="space-y-1.5">
              {items.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 text-muted"><span className={`${color} mt-0.5 shrink-0`}>→</span>{idea}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionCard>,

    // 13: Launch Plan
    <SectionCard key="launch" emoji="📅" title="7-Day Launch Plan" badge="Launch" copyText={kit.launchPlan.join("\n")} {...sp("launchPlan")}>
      <RerollError sectionKey="launchPlan" />
      <ol className="space-y-2">
        {kit.launchPlan.map((step, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-black text-secondary">{i + 1}</span>
            <span className="text-sm text-muted leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </SectionCard>,
  ];

  return (
    <BrandIdContext.Provider value={brandGenerationId}>
    <RevealProvider flagKey={`brand_${brandGenerationId ?? "kit"}`} brandId={brandGenerationId}>
      {/* Sound toggle */}
      <div className="flex justify-end mb-2">
        <SoundToggle />
      </div>

      {/* Reveal Header */}
      <RevealCard index={0}>
        <div className="relative text-center py-10 overflow-hidden">
          <Sparkles count={12} />
          <motion.div
            className="relative z-10 space-y-4"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 65%)" }}
          >
            <NixPose pose="celebrating" size={110} glow priority />
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary-light">✦ Welcome to your new brand ✦</p>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white">{kit.recommendedName}</h1>
              <p className="text-sm text-muted">Nix built this just for you. Every piece. Every word. Every detail.</p>
            </div>
          </motion.div>
        </div>
      </RevealCard>

      {/* Skip button */}
      <SkipRevealButton />

      {/* Staggered sections */}
      <div className="space-y-5 mt-4">
        {sections.map((section, i) => (
          <RevealCard key={i} index={i + 1} staggerMs={65} fastStaggerMs={28}>
            {section}
          </RevealCard>
        ))}
      </div>

      {/* Closure moment → Continue Building */}
      <RevealCard index={sections.length + 1}>
        {phase === "reveal" && (
          <CompleteMoment onDone={() => setPhase("done")} />
        )}
        {phase === "done" && (
          <div className="space-y-8 mt-8">
            {/* Nix micro-delight */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5"
            >
              <NixPose pose="waving" size={56} float={false} glow={false} animated={false} />
              <div>
                <p className="font-display font-black text-white">
                  &ldquo;{["Magic complete!", "I&apos;d buy from this brand.", "This makes me smile.", "I can see customers loving this.", "I&apos;ve got a good feeling about this."][Math.floor(Math.random() * 5)]}&rdquo;
                </p>
                <p className="text-xs text-muted mt-0.5">— Nix, your brand goblin</p>
              </div>
            </motion.div>

            {/* Share card — always visible */}
            <ShareCard kit={kit} />

            {/* Upgrade nudge — free users only, shown in-context before ContinueBuilding */}
            {userPlan === "free" && <UpgradeNudge />}

            <ContinueBuilding brandId={brandGenerationId} userPlan={userPlan} brandInput={brandInput} />
          </div>
        )}
      </RevealCard>

      {/* 🌐 Website Preview modal — the kit's copy + palette as a live homepage */}
      <WebsitePreview kit={kit} isOpen={showWebPreview} onClose={() => setShowWebPreview(false)} />
    </RevealProvider>
    </BrandIdContext.Provider>
  );
}
