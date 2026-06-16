import type { BrandKit } from "@/types";
import CopyButton from "./CopyButton";

function SectionCard({
  emoji,
  title,
  copyText,
  children,
}: {
  emoji: string;
  title: string;
  copyText?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="goblin-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="goblin-section-title">
          <span>{emoji}</span> {title}
        </h2>
        {copyText ? <CopyButton text={copyText} /> : null}
      </div>
      {children}
    </section>
  );
}

export default function BrandKitView({ kit }: { kit: BrandKit }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1 & 2. Brand Names + Recommendation */}
      <SectionCard
        emoji="🏷️"
        title="Brand Name Options"
        copyText={kit.brandNames.map((n) => n.name).join("\n")}
      >
        <ul className="space-y-2">
          {kit.brandNames.map((n, i) => (
            <li
              key={n.name + i}
              className="flex items-start justify-between gap-3 rounded-lg border border-goblin-border bg-goblin-bg/40 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-white">{n.name}</p>
                {n.reasoning ? (
                  <p className="mt-0.5 text-xs text-zinc-400">{n.reasoning}</p>
                ) : null}
              </div>
              <CopyButton text={n.name} label="" className="shrink-0" />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-zinc-400">{kit.topThreeReasoning}</p>
      </SectionCard>

      <SectionCard emoji="👑" title="Recommended Name" copyText={kit.recommendedName}>
        <p className="mb-2 text-3xl font-extrabold text-goblin-emerald">
          {kit.recommendedName}
        </p>
        <p className="text-sm text-zinc-300">{kit.recommendedNameReasoning}</p>
      </SectionCard>

      {/* 3. Taglines */}
      <SectionCard emoji="💬" title="Taglines" copyText={kit.taglines.join("\n")}>
        <ul className="space-y-2">
          {kit.taglines.map((t, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-goblin-border bg-goblin-bg/40 px-3 py-2 text-sm text-zinc-200"
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
        copyText={`${kit.brandStory.originStory}\n\n${kit.brandStory.mission}`}
      >
        <p className="mb-3 text-sm text-zinc-300">{kit.brandStory.originStory}</p>
        <p className="rounded-lg border border-goblin-purple/30 bg-goblin-purple/10 p-3 text-sm font-medium text-goblin-purple-light">
          {kit.brandStory.mission}
        </p>
      </SectionCard>

      {/* 5. Brand Voice */}
      <SectionCard emoji="🎭" title="Brand Voice">
        <div className="space-y-3 text-sm">
          <div>
            <p className="goblin-label">Personality traits</p>
            <div className="flex flex-wrap gap-2">
              {kit.brandVoice.personalityTraits.map((t) => (
                <span key={t} className="goblin-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="goblin-label">Tone examples</p>
            <ul className="list-inside list-disc space-y-1 text-zinc-300">
              {kit.brandVoice.toneExamples.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="goblin-label text-goblin-emerald">Use</p>
              <div className="flex flex-wrap gap-1">
                {kit.brandVoice.wordsToUse.map((w) => (
                  <span key={w} className="goblin-chip border-goblin-emerald/30">
                    {w}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="goblin-label text-rose-400">Avoid</p>
              <div className="flex flex-wrap gap-1">
                {kit.brandVoice.wordsToAvoid.map((w) => (
                  <span key={w} className="goblin-chip border-rose-500/30">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 6. Mascot */}
      <SectionCard emoji="🐲" title="Mascot Concept" copyText={kit.mascot.imagePrompt}>
        <p className="mb-1 text-lg font-bold text-white">{kit.mascot.name}</p>
        <p className="mb-2 text-sm text-zinc-300">{kit.mascot.appearance}</p>
        <p className="mb-2 text-sm text-zinc-300">{kit.mascot.personality}</p>
        <p className="mb-3 text-sm italic text-zinc-400">{kit.mascot.visualDescription}</p>
        <div className="rounded-lg border border-goblin-border bg-goblin-bg/60 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-goblin-purple-light">
            AI Image Prompt
          </p>
          <p className="text-xs text-zinc-300">{kit.mascot.imagePrompt}</p>
        </div>
      </SectionCard>

      {/* 7. Logo Prompt */}
      <SectionCard emoji="🖼️" title="Logo Prompt" copyText={kit.logoPrompt}>
        <p className="text-sm text-zinc-300">{kit.logoPrompt}</p>
      </SectionCard>

      {/* 8. Color Palette */}
      <SectionCard
        emoji="🎨"
        title="Color Palette"
        copyText={kit.colorPalette.map((c) => `${c.name} ${c.hex}`).join("\n")}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {kit.colorPalette.map((c) => (
            <div
              key={c.hex}
              className="flex items-center gap-3 rounded-lg border border-goblin-border bg-goblin-bg/40 p-2"
            >
              <span
                className="h-10 w-10 shrink-0 rounded-lg border border-white/10"
                style={{ backgroundColor: c.hex }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                <p className="text-xs text-zinc-400">{c.hex}</p>
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
        copyText={`${kit.websiteCopy.heroHeadline}\n${kit.websiteCopy.subheadline}\n\n${kit.websiteCopy.aboutSection}\n\n${kit.websiteCopy.featureBullets.join("\n")}`}
      >
        <p className="mb-1 text-xl font-extrabold text-white">
          {kit.websiteCopy.heroHeadline}
        </p>
        <p className="mb-3 text-sm text-zinc-400">{kit.websiteCopy.subheadline}</p>
        <span className="goblin-btn-primary mb-4 inline-block !px-4 !py-2 text-xs">
          {kit.websiteCopy.ctaText}
        </span>
        <p className="mb-3 text-sm text-zinc-300">{kit.websiteCopy.aboutSection}</p>
        <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
          {kit.websiteCopy.featureBullets.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </SectionCard>

      {/* 10. Social Kit */}
      <SectionCard
        emoji="📱"
        title="Social Media Kit"
        copyText={`IG: ${kit.socialKit.instagramBio}\nX: ${kit.socialKit.twitterBio}\nTikTok: ${kit.socialKit.tiktokBio}\n\n${kit.socialKit.launchPosts.join("\n\n")}`}
      >
        <div className="mb-3 space-y-2 text-sm">
          <p>
            <span className="font-semibold text-goblin-purple-light">Instagram: </span>
            {kit.socialKit.instagramBio}
          </p>
          <p>
            <span className="font-semibold text-goblin-purple-light">X/Twitter: </span>
            {kit.socialKit.twitterBio}
          </p>
          <p>
            <span className="font-semibold text-goblin-purple-light">TikTok: </span>
            {kit.socialKit.tiktokBio}
          </p>
        </div>
        <p className="goblin-label">Launch posts</p>
        <ul className="space-y-2">
          {kit.socialKit.launchPosts.map((p, i) => (
            <li
              key={i}
              className="rounded-lg border border-goblin-border bg-goblin-bg/40 p-2 text-sm text-zinc-200"
            >
              {p}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 11. Marketing Ideas */}
      <SectionCard emoji="🚀" title="Meme & Marketing Ideas">
        <div className="space-y-4 text-sm">
          <div>
            <p className="goblin-label">Viral content ideas</p>
            <ul className="list-inside list-disc space-y-1 text-zinc-300">
              {kit.marketingIdeas.viralContentIdeas.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="goblin-label">Meme ideas</p>
            <ul className="list-inside list-disc space-y-1 text-zinc-300">
              {kit.marketingIdeas.memeIdeas.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="goblin-label">Ad angles</p>
            <ul className="list-inside list-disc space-y-1 text-zinc-300">
              {kit.marketingIdeas.adAngles.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* 12. Launch Plan */}
      <SectionCard
        emoji="📅"
        title="7-Day Launch Plan"
        copyText={kit.launchPlan.join("\n")}
      >
        <ol className="space-y-2">
          {kit.launchPlan.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-goblin-border bg-goblin-bg/40 p-3 text-sm text-zinc-200"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-goblin-emerald/20 text-xs font-bold text-goblin-emerald">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
