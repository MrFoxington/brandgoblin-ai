"use client";

import { useState } from "react";
import Image from "next/image";
import type { BrandKit, BrandInput, NameStrengthCheck } from "@/types";
import CopyButton from "./CopyButton";
import BrandNamesSection from "./BrandNamesSection";

type SectionKey =
  | "taglines" | "brandStory" | "brandVoice" | "mascot"
  | "logoPrompt" | "colorPalette" | "websiteCopy" | "socialKit"
  | "marketingIdeas" | "launchPlan";

function SectionCard({
  emoji,
  title,
  badge,
  copyText,
  sectionKey,
  rerollsUsed,
  rerolling,
  onReroll,
  children,
}: {
  emoji: string;
  title: string;
  badge?: string;
  copyText?: string;
  sectionKey?: SectionKey;
  rerollsUsed: Set<string>;
  rerolling: string | null;
  onReroll?: (key: SectionKey) => void;
  children: React.ReactNode;
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
          {copyText && <CopyButton text={copyText} />}
          {sectionKey && onReroll && (
            <button
              data-print-hide
              type="button"
              disabled={used || isRerolling}
              onClick={() => onReroll(sectionKey)}
              className="btn-ghost !text-xs !py-1 !px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRerolling ? "🧌 Remixing…" : used ? "Re-Conjure Used" : "🔄 Re-Conjure"}
            </button>
          )}
        </div>
      </div>
      {isRerolling && (
        <p className="text-xs text-muted italic animate-pulse">
          The goblin is remixing this…
        </p>
      )}
      {children}
    </section>
  );
}

function Chip({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <span className={green ? "badge-green" : "badge-purple"} style={{ fontSize: "0.7rem" }}>
      {children}
    </span>
  );
}

export default function BrandKitView({
  kit: initialKit,
  brandInput,
  brandGenerationId,
  initialRerollsUsed = [],
}: {
  kit: BrandKit;
  brandInput?: BrandInput;
  brandGenerationId?: string;
  initialRerollsUsed?: string[];
}) {
  const [kit, setKit] = useState<BrandKit>(initialKit);
  const [rerollsUsed, setRerollsUsed] = useState<Set<string>>(new Set(initialRerollsUsed));
  const [rerolling, setRerolling] = useState<string | null>(null);
  const [rerollErrors, setRerollErrors] = useState<Record<string, string>>({});

  async function handleReroll(sectionKey: SectionKey) {
    if (!brandInput || rerollsUsed.has(sectionKey) || rerolling) return;
    setRerolling(sectionKey);
    setRerollErrors((prev) => ({ ...prev, [sectionKey]: "" }));

    try {
      const res = await fetch("/api/generate/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: sectionKey,
          brandName: kit.recommendedName,
          input: brandInput,
          kit,
          brandGenerationId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed.");

      setKit((prev) => ({ ...prev, ...json.data }));
      setRerollsUsed((prev) => new Set(prev).add(sectionKey));
    } catch (err) {
      setRerollErrors((prev) => ({
        ...prev,
        [sectionKey]: err instanceof Error ? err.message : "The goblin tripped over a scroll. Try again.",
      }));
    } finally {
      setRerolling(null);
    }
  }

  const sectionProps = (key: SectionKey) => ({
    sectionKey: key,
    rerollsUsed,
    rerolling,
    onReroll: brandInput ? handleReroll : undefined,
  });

  // Shared empty props for sections without reroll (names, nameStrengthCheck)
  const noReroll = { rerollsUsed, rerolling };

  function RerollError({ sectionKey }: { sectionKey: SectionKey }) {
    const msg = rerollErrors[sectionKey];
    if (!msg) return null;
    return <p className="text-xs text-red-400">{msg}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

      {/* Success banner */}
      <div className="lg:col-span-2 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-6 py-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6 text-center sm:text-left">
        <Image
          src="/nix/celebrating-nix.png"
          alt="Nix celebrating"
          width={100}
          height={100}
          className="shrink-0 drop-shadow-[0_0_16px_rgba(124,58,237,0.5)]"
        />
        <div>
          <p className="font-display text-xl font-extrabold text-white">🎉 Your brand has been conjured!</p>
          <p className="text-sm text-muted mt-1">Nix worked his magic. Your complete brand kit is ready below.</p>
        </div>
      </div>

      {/* 1. Brand Names — spans full width */}
      <div className="lg:col-span-2">
        <SectionCard emoji="🏆" title="Brand Names" badge="Naming" {...noReroll}>
          <BrandNamesSection
            favoriteName={kit.favoriteName}
            alternativeNames={kit.alternativeNames}
            brandNames={kit.brandNames}
            topThreeReasoning={kit.topThreeReasoning}
            recommendedName={kit.recommendedName}
            brandInput={brandInput}
          />
        </SectionCard>
      </div>

      {/* 2. Name Strength Check (existing-name mode only) */}
      {kit.nameStrengthCheck && (
        <div className="lg:col-span-2">
          <SectionCard emoji="🔍" title="Name Strength Check" badge="Analysis" {...noReroll}>
            <NameStrengthCheckView nsc={kit.nameStrengthCheck} />
          </SectionCard>
        </div>
      )}

      {/* 3. Taglines */}
      <SectionCard emoji="💬" title="Taglines" badge="Copywriting" copyText={kit.taglines.join("\n")} {...sectionProps("taglines")}>
        <RerollError sectionKey="taglines" />
        <ul className="space-y-2">
          {kit.taglines.map((t, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] px-3 py-2 text-sm text-white"
            >
              <span>"{t}"</span>
              <CopyButton text={t} label="" />
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 4. Brand Story */}
      <SectionCard
        emoji="📖"
        title="Brand Story"
        badge="Storytelling"
        copyText={`${kit.brandStory.originStory}\n\n${kit.brandStory.mission}`}
        {...sectionProps("brandStory")}
      >
        <RerollError sectionKey="brandStory" />
        <p className="text-sm text-muted leading-relaxed">{kit.brandStory.originStory}</p>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary-light leading-relaxed">
            {kit.brandStory.mission}
          </p>
        </div>
      </SectionCard>

      {/* 5. Brand Voice */}
      <SectionCard emoji="🎭" title="Brand Voice" badge="Strategy" {...sectionProps("brandVoice")}>
        <RerollError sectionKey="brandVoice" />
        <div className="space-y-4 text-sm">
          <div>
            <p className="label mb-2">Personality traits</p>
            <div className="flex flex-wrap gap-2">
              {kit.brandVoice.personalityTraits.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-2">Tone examples</p>
            <ul className="space-y-1 text-muted">
              {kit.brandVoice.toneExamples.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-light mt-0.5">→</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label mb-2 text-secondary">✓ Use</p>
              <div className="flex flex-wrap gap-1.5">
                {kit.brandVoice.wordsToUse.map((w) => (
                  <Chip key={w} green>{w}</Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-2 text-red-400">✗ Avoid</p>
              <div className="flex flex-wrap gap-1.5">
                {kit.brandVoice.wordsToAvoid.map((w) => (
                  <span key={w} className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-400">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 6. Mascot */}
      <SectionCard emoji="🐲" title="Mascot Concept" badge="Creative" copyText={kit.mascot.imagePrompt} {...sectionProps("mascot")}>
        <RerollError sectionKey="mascot" />
        <p className="font-display text-xl font-bold text-white">{kit.mascot.name}</p>
        <p className="text-sm text-muted leading-relaxed">{kit.mascot.appearance}</p>
        <p className="text-sm text-muted leading-relaxed">{kit.mascot.personality}</p>
        <p className="text-sm italic text-faint leading-relaxed">{kit.mascot.visualDescription}</p>
        <div className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-light">
            AI Image Prompt
          </p>
          <p className="text-xs text-muted leading-relaxed">{kit.mascot.imagePrompt}</p>
        </div>
      </SectionCard>

      {/* 7. Logo Prompt */}
      <SectionCard emoji="🖼️" title="Logo Prompt" badge="Design" copyText={kit.logoPrompt} {...sectionProps("logoPrompt")}>
        <RerollError sectionKey="logoPrompt" />
        <div className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-4">
          <p className="text-sm text-muted leading-relaxed">{kit.logoPrompt}</p>
        </div>
      </SectionCard>

      {/* 8. Color Palette */}
      <SectionCard
        emoji="🎨"
        title="Color Palette"
        badge="Design"
        copyText={kit.colorPalette.map((c) => `${c.name}: ${c.hex}`).join("\n")}
        {...sectionProps("colorPalette")}
      >
        <RerollError sectionKey="colorPalette" />
        <div className="space-y-2">
          {kit.colorPalette.map((c) => (
            <div
              key={c.hex}
              className="flex items-center gap-3 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3"
            >
              <span
                className="h-10 w-10 shrink-0 rounded-lg border border-white/10 shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{c.name}</p>
                <p className="text-xs text-faint font-mono">{c.hex}</p>
                <p className="text-xs text-muted truncate">{c.usage}</p>
              </div>
              <CopyButton text={c.hex} label="" />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 9. Website Copy */}
      <SectionCard
        emoji="🌐"
        title="Website Copy"
        badge="Copy"
        copyText={`${kit.websiteCopy.heroHeadline}\n${kit.websiteCopy.subheadline}\n\nCTA: ${kit.websiteCopy.ctaText}\n\n${kit.websiteCopy.aboutSection}\n\n${kit.websiteCopy.featureBullets.join("\n")}`}
        {...sectionProps("websiteCopy")}
      >
        <RerollError sectionKey="websiteCopy" />
        <div className="space-y-4">
          <div>
            <p className="label mb-1">Hero headline</p>
            <p className="font-display text-xl font-extrabold text-white">{kit.websiteCopy.heroHeadline}</p>
          </div>
          <div>
            <p className="label mb-1">Subheadline</p>
            <p className="text-sm text-muted">{kit.websiteCopy.subheadline}</p>
          </div>
          <div>
            <p className="label mb-1">CTA button</p>
            <span className="btn-primary inline-flex !py-2 !px-4 text-sm !animate-none">{kit.websiteCopy.ctaText}</span>
          </div>
          <div>
            <p className="label mb-1">About section</p>
            <p className="text-sm text-muted leading-relaxed">{kit.websiteCopy.aboutSection}</p>
          </div>
          <div>
            <p className="label mb-2">Feature bullets</p>
            <ul className="space-y-1.5">
              {kit.websiteCopy.featureBullets.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-secondary mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* 10. Social Kit */}
      <SectionCard
        emoji="📱"
        title="Social Media Kit"
        badge="Social"
        copyText={`Instagram: ${kit.socialKit.instagramBio}\nX/Twitter: ${kit.socialKit.twitterBio}\nTikTok: ${kit.socialKit.tiktokBio}\n\n${kit.socialKit.launchPosts.join("\n\n")}`}
        {...sectionProps("socialKit")}
      >
        <RerollError sectionKey="socialKit" />
        <div className="space-y-3">
          {[
            { platform: "Instagram", bio: kit.socialKit.instagramBio },
            { platform: "X / Twitter", bio: kit.socialKit.twitterBio },
            { platform: "TikTok", bio: kit.socialKit.tiktokBio },
          ].map(({ platform, bio }) => (
            <div key={platform} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold text-primary-light">{platform}</p>
                <CopyButton text={bio} label="" />
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
      </SectionCard>

      {/* 11. Marketing Ideas */}
      <SectionCard emoji="🚀" title="Marketing & Meme Ideas" badge="Growth" {...sectionProps("marketingIdeas")}>
        <RerollError sectionKey="marketingIdeas" />
        <div className="space-y-5 text-sm">
          <div>
            <p className="label mb-2">Viral content ideas</p>
            <ul className="space-y-1.5">
              {kit.marketingIdeas.viralContentIdeas.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 text-muted">
                  <span className="text-primary-light mt-0.5 shrink-0">→</span>{idea}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-2">Meme ideas</p>
            <ul className="space-y-1.5">
              {kit.marketingIdeas.memeIdeas.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 text-muted">
                  <span className="text-secondary mt-0.5 shrink-0">→</span>{idea}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-2">Ad angles</p>
            <ul className="space-y-1.5">
              {kit.marketingIdeas.adAngles.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 text-muted">
                  <span className="text-primary-light mt-0.5 shrink-0">→</span>{idea}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* 12. Launch Plan */}
      <SectionCard
        emoji="📅"
        title="7-Day Launch Plan"
        badge="Launch"
        copyText={kit.launchPlan.join("\n")}
        {...sectionProps("launchPlan")}
      >
        <RerollError sectionKey="launchPlan" />
        <ol className="space-y-2">
          {kit.launchPlan.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-black text-secondary">
                {i + 1}
              </span>
              <span className="text-sm text-muted leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

    </div>
  );
}

function NameStrengthCheckView({ nsc }: { nsc: NameStrengthCheck }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">What Works</p>
        <p className="text-sm text-muted leading-relaxed">{nsc.whatWorks}</p>
      </div>
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">Potential Concerns</p>
        <p className="text-sm text-muted leading-relaxed">{nsc.potentialConcerns}</p>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-light mb-2">Suggested Refinement</p>
        <p className="text-sm text-muted leading-relaxed">{nsc.suggestedRefinement}</p>
      </div>
      <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Best Positioning Angle</p>
        <p className="text-sm text-muted leading-relaxed">{nsc.bestPositioningAngle}</p>
      </div>
    </div>
  );
}
