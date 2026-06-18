"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CopyButton from "./CopyButton";
import type { CreatorContentType, BrandVoiceMode, CreatorContentRow, BrandGenerationRow } from "@/types";

// ─── Config ────────────────────────────────────────────────────────────────

const VOICE_OPTIONS: { key: BrandVoiceMode; label: string; emoji: string }[] = [
  { key: "professional",  label: "Professional",  emoji: "👔" },
  { key: "funny",         label: "Funny",          emoji: "😄" },
  { key: "luxury",        label: "Luxury",         emoji: "💎" },
  { key: "friendly",      label: "Friendly",       emoji: "🤝" },
  { key: "inspirational", label: "Inspirational",  emoji: "✨" },
  { key: "minimalist",    label: "Minimalist",     emoji: "◻️" },
  { key: "bold",          label: "Bold",           emoji: "⚡" },
];

type CardGroup = {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  types: { key: CreatorContentType; label: string }[];
};

const CARD_GROUPS: CardGroup[] = [
  {
    key: "social",
    emoji: "📱",
    title: "Social Content",
    desc: "Posts for every platform",
    types: [
      { key: "instagram_post", label: "Instagram Post" },
      { key: "twitter_post",   label: "X/Twitter Post" },
      { key: "facebook_post",  label: "Facebook Post" },
      { key: "linkedin_post",  label: "LinkedIn Post" },
      { key: "threads_post",   label: "Threads Post" },
      { key: "caption",        label: "Captions" },
      { key: "hashtag_set",    label: "Hashtag Sets" },
    ],
  },
  {
    key: "blog",
    emoji: "📝",
    title: "Blog Post",
    desc: "SEO-ready long-form content",
    types: [{ key: "blog_post", label: "Blog Post" }],
  },
  {
    key: "email",
    emoji: "📧",
    title: "Email Campaigns",
    desc: "Subject lines, copy & CTAs",
    types: [
      { key: "email_campaign",     label: "Email Campaign" },
      { key: "launch_announcement", label: "Launch Announcement" },
    ],
  },
  {
    key: "ads",
    emoji: "📢",
    title: "Ads & Promotions",
    desc: "Copy that converts",
    types: [
      { key: "ad_copy",           label: "Ad Copy" },
      { key: "headline",          label: "Headlines" },
      { key: "promotion",         label: "Promotion" },
      { key: "product_description", label: "Product Description" },
      { key: "seasonal_campaign", label: "Seasonal Campaign" },
    ],
  },
  {
    key: "calendar",
    emoji: "📅",
    title: "Content Calendar",
    desc: "30-day content plan",
    types: [{ key: "content_calendar", label: "Content Calendar" }],
  },
  {
    key: "strategy",
    emoji: "🎯",
    title: "Marketing Ideas",
    desc: "Strategy & campaign concepts",
    types: [
      { key: "marketing_ideas",     label: "Marketing Ideas" },
      { key: "campaign_ideas",      label: "Campaign Ideas" },
      { key: "audience_suggestions", label: "Audience Insights" },
    ],
  },
  {
    key: "voice",
    emoji: "🎙️",
    title: "Brand Voice",
    desc: "Voice guidelines & examples",
    types: [{ key: "brand_voice_suggestions", label: "Brand Voice Guide" }],
  },
];

const CONTENT_TYPE_LABELS: Partial<Record<CreatorContentType, string>> = {
  instagram_post: "Instagram",
  twitter_post: "X/Twitter",
  facebook_post: "Facebook",
  linkedin_post: "LinkedIn",
  threads_post: "Threads",
  caption: "Captions",
  hashtag_set: "Hashtags",
  blog_post: "Blog",
  product_description: "Product",
  email_campaign: "Email",
  ad_copy: "Ads",
  headline: "Headlines",
  promotion: "Promo",
  seasonal_campaign: "Seasonal",
  launch_announcement: "Launch",
  marketing_ideas: "Strategy",
  campaign_ideas: "Campaign",
  content_calendar: "Calendar",
  audience_suggestions: "Audience",
  brand_voice_suggestions: "Voice",
};

// ─── Types ─────────────────────────────────────────────────────────────────

interface GenerationResult {
  id?: string;
  contentType: CreatorContentType;
  title: string;
  content: { items: unknown[] };
}

interface Props {
  brands: Pick<BrandGenerationRow, "id" | "output_data" | "input_data">[];
  recentContent: CreatorContentRow[];
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function CreatorProHub({ brands, recentContent: initialRecent }: Props) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id ?? "custom");
  const [customName, setCustomName]     = useState("");
  const [customIdea, setCustomIdea]     = useState("");
  const [brandVoice, setBrandVoice]     = useState<BrandVoiceMode>("friendly");
  const [activeGroup, setActiveGroup]   = useState<string | null>(null);
  const [activeType, setActiveType]     = useState<CreatorContentType | null>(null);
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<GenerationResult | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [recent, setRecent]             = useState<CreatorContentRow[]>(initialRecent);
  const [expandedRecent, setExpandedRecent] = useState<string | null>(null);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const isCustom = selectedBrandId === "custom";

  const brandName    = isCustom ? customName   : (selectedBrand?.output_data.recommendedName ?? "");
  const businessIdea = isCustom ? customIdea   : (selectedBrand?.input_data.businessIdea ?? "");
  const tagline      = isCustom ? undefined    : (selectedBrand?.output_data.taglines?.[0]);
  const brandId      = isCustom ? undefined    : selectedBrandId;

  function handleGroupClick(groupKey: string) {
    const group = CARD_GROUPS.find((g) => g.key === groupKey)!;
    if (activeGroup === groupKey) {
      setActiveGroup(null);
      setActiveType(null);
      setResult(null);
      setError(null);
    } else {
      setActiveGroup(groupKey);
      setActiveType(group.types[0].key);
      setResult(null);
      setError(null);
    }
  }

  async function handleGenerate() {
    if (!brandName || !businessIdea || !activeType) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate/creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, brandName, businessIdea, tagline, contentType: activeType, brandVoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      setResult(data);
      // Prepend to recent list
      if (data.id) {
        setRecent((prev) => [{
          id: data.id,
          user_id: "",
          brand_id: brandId ?? null,
          content_type: activeType!,
          title: data.title,
          content: data.content,
          created_at: new Date().toISOString(),
        }, ...prev.slice(0, 19)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The goblin dropped the scroll. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = !loading && !!activeType && !!brandName.trim() && !!businessIdea.trim();

  return (
    <div className="space-y-8">

      {/* ── Hero header ── */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 px-8 py-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8 sm:text-left text-center">
        <Image
          src="/nix/working-nix.png"
          alt="Nix working on your campaign"
          width={130}
          height={130}
          className="shrink-0 drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]"
          priority
        />
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="badge-purple">Creator Pro</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl mb-1">
            Your AI Marketing Department
          </h1>
          <p className="text-sm text-secondary font-medium mb-3">
            Nix is preparing your next campaign.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-1 text-sm text-muted">
            <span>Unlimited copywriter.</span>
            <span>Unlimited social media manager.</span>
            <span>Unlimited content strategist.</span>
            <span>Unlimited marketing ideas.</span>
          </div>
        </div>
      </div>

      {/* ── Brand + Voice selectors ── */}
      <div className="bg-card rounded-2xl p-6 space-y-5">
        <h2 className="font-display text-lg font-bold text-white">1. Choose your brand</h2>

        {/* Brand selector */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-faint font-medium uppercase tracking-wider">Brand</label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full rounded-xl border border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-white focus:border-primary/60 focus:outline-none"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.output_data.recommendedName}
                </option>
              ))}
              <option value="custom">✏️ Enter custom brand</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-faint font-medium uppercase tracking-wider">Brand Voice</label>
            <select
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value as BrandVoiceMode)}
              className="w-full rounded-xl border border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-white focus:border-primary/60 focus:outline-none"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.key} value={v.key}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom brand fields */}
        {isCustom && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-faint font-medium uppercase tracking-wider">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. NovaBrew"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-xl border border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-white placeholder:text-faint focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-faint font-medium uppercase tracking-wider">Business Idea</label>
              <input
                type="text"
                placeholder="e.g. Specialty coffee subscription"
                value={customIdea}
                onChange={(e) => setCustomIdea(e.target.value)}
                className="w-full rounded-xl border border-[rgba(45,45,78,0.8)] bg-[rgba(10,10,15,0.6)] px-4 py-3 text-sm text-white placeholder:text-faint focus:border-primary/60 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Voice chips */}
        <div>
          <p className="mb-2 text-xs text-faint font-medium uppercase tracking-wider">Quick select voice</p>
          <div className="flex flex-wrap gap-2">
            {VOICE_OPTIONS.map((v) => (
              <button
                key={v.key}
                onClick={() => setBrandVoice(v.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  brandVoice === v.key
                    ? "border-primary/60 bg-primary/20 text-primary-light"
                    : "border-[rgba(45,45,78,0.8)] text-muted hover:border-primary/40 hover:text-white"
                }`}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content cards ── */}
      <div>
        <h2 className="font-display text-lg font-bold text-white mb-4">2. Choose what to create</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARD_GROUPS.map((group) => {
            const isActive = activeGroup === group.key;
            return (
              <button
                key={group.key}
                onClick={() => handleGroupClick(group.key)}
                className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition ${
                  isActive
                    ? "border-primary/60 bg-primary/10"
                    : "border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.1)] hover:border-primary/40 hover:bg-[rgba(45,45,78,0.2)]"
                }`}
              >
                <span className="text-3xl">{group.emoji}</span>
                <div>
                  <p className="font-display font-bold text-white text-sm">{group.title}</p>
                  <p className="text-xs text-muted mt-0.5">{group.desc}</p>
                </div>
                {isActive && (
                  <span className="mt-1 rounded-full bg-primary/30 border border-primary/40 px-2 py-0.5 text-xs text-primary-light">
                    Selected ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Workflow panel ── */}
      {activeGroup && (() => {
        const group = CARD_GROUPS.find((g) => g.key === activeGroup)!;
        return (
          <div className="bg-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{group.emoji}</span>
              <div>
                <h2 className="font-display text-lg font-bold text-white">{group.title}</h2>
                <p className="text-xs text-muted">{group.desc}</p>
              </div>
            </div>

            {/* Sub-type selector (if multiple) */}
            {group.types.length > 1 && (
              <div>
                <p className="mb-2 text-xs text-faint font-medium uppercase tracking-wider">Content type</p>
                <div className="flex flex-wrap gap-2">
                  {group.types.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => { setActiveType(t.key); setResult(null); setError(null); }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        activeType === t.key
                          ? "border-secondary/60 bg-secondary/20 text-secondary"
                          : "border-[rgba(45,45,78,0.8)] text-muted hover:border-secondary/40 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate button */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="btn-primary !py-3 !px-8 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "🧌 Conjuring…" : `✦ Generate ${group.types.find(t => t.key === activeType)?.label ?? group.title}`}
              </button>
              {!brandName.trim() && (
                <p className="text-xs text-yellow-400">Select a brand above first</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">{error}</p>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    ✨ Generated: <span className="text-primary-light">{result.title}</span>
                  </p>
                  <span className="text-xs text-faint">Saved to your vault</span>
                </div>
                <ResultRenderer contentType={result.contentType} content={result.content} />
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Recent generations ── */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-white">📚 Recent Generations</h2>
            <span className="text-xs text-faint">{recent.length} saved</span>
          </div>
          <div className="space-y-3">
            {recent.slice(0, 10).map((item) => (
              <div key={item.id} className="bg-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedRecent(expandedRecent === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[rgba(45,45,78,0.2)] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">
                      {CARD_GROUPS.find((g) => g.types.some((t) => t.key === item.content_type))?.emoji ?? "✦"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <p className="text-xs text-faint">
                        {CONTENT_TYPE_LABELS[item.content_type]} · {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {expandedRecent === item.id ? "▲ Hide" : "▼ Show"}
                  </span>
                </button>
                {expandedRecent === item.id && (
                  <div className="border-t border-[rgba(45,45,78,0.6)] bg-[rgba(10,10,15,0.4)] p-5 max-h-96 overflow-y-auto">
                    <ResultRenderer
                      contentType={item.content_type}
                      content={item.content as { items: unknown[] }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="text-center py-10 text-muted text-sm">
          Your generated content will appear here. Start creating above.
        </div>
      )}
    </div>
  );
}

// ─── Result renderer ─────────────────────────────────────────────────────────

function ResultRenderer({ contentType, content }: { contentType: CreatorContentType; content: { items: unknown[] } }) {
  const items = content?.items ?? [];

  // Social posts with hook + copy + hashtags
  if (["instagram_post", "facebook_post", "linkedin_post"].includes(contentType)) {
    return (
      <div className="space-y-3">
        {(items as { hook?: string; copy: string; hashtags?: string[]; cta?: string }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            {item.hook && <p className="text-xs font-bold text-primary-light mb-1">Hook</p>}
            {item.hook && <p className="text-sm font-semibold text-white mb-2">{item.hook}</p>}
            <p className="text-sm text-muted leading-relaxed mb-2">{item.copy}</p>
            {item.cta && <p className="text-xs text-secondary mb-2">CTA: {item.cta}</p>}
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-faint flex-1">{item.hashtags?.join(" ")}</p>
              <CopyButton text={`${item.hook ? item.hook + "\n\n" : ""}${item.copy}${item.hashtags ? "\n\n" + item.hashtags.join(" ") : ""}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Twitter / Threads — compact
  if (["twitter_post", "threads_post"].includes(contentType)) {
    return (
      <div className="space-y-2">
        {(items as { copy: string; hashtags?: string[] }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] px-4 py-3 flex items-start justify-between gap-2">
            <p className="text-sm text-white leading-relaxed flex-1">{item.copy}{item.hashtags?.length ? " " + item.hashtags.join(" ") : ""}</p>
            <CopyButton text={item.copy + (item.hashtags?.length ? " " + item.hashtags.join(" ") : "")} label="" className="shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Hashtag sets
  if (contentType === "hashtag_set") {
    return (
      <div className="space-y-2">
        {(items as string[][]).map((set, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] px-4 py-3 flex items-start justify-between gap-2">
            <p className="text-xs text-muted flex-1 leading-relaxed">{set.join(" ")}</p>
            <CopyButton text={set.join(" ")} label="" className="shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Blog post
  if (contentType === "blog_post") {
    const post = items[0] as { title: string; intro: string; sections: { heading: string; body: string }[]; conclusion: string; seoKeywords: string[] } | undefined;
    if (!post) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-white">{post.title}</h3>
          <CopyButton text={[post.title, post.intro, ...post.sections.map(s => `${s.heading}\n${s.body}`), post.conclusion].join("\n\n")} label="" className="shrink-0" />
        </div>
        <p className="text-sm text-muted leading-relaxed">{post.intro}</p>
        {post.sections.map((s, i) => (
          <div key={i}>
            <p className="font-semibold text-white text-sm mb-1">{s.heading}</p>
            <p className="text-sm text-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
        <p className="text-sm text-muted leading-relaxed italic">{post.conclusion}</p>
        <p className="text-xs text-faint">SEO: {post.seoKeywords?.join(", ")}</p>
      </div>
    );
  }

  // Email campaigns
  if (contentType === "email_campaign" || contentType === "launch_announcement") {
    return (
      <div className="space-y-3">
        {(items as { subjectLine?: string; subject?: string; preheader?: string; channel?: string; body: string; cta: string }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            {item.channel && <p className="text-xs font-bold text-secondary mb-2 uppercase tracking-widest">{item.channel}</p>}
            <p className="text-xs font-bold text-primary-light mb-0.5">Subject</p>
            <p className="text-sm font-semibold text-white mb-1">{item.subjectLine ?? item.subject}</p>
            {item.preheader && <p className="text-xs text-faint italic mb-2">{item.preheader}</p>}
            <p className="text-sm text-muted leading-relaxed mb-2">{item.body}</p>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-secondary/20 border border-secondary/30 px-3 py-0.5 text-xs text-secondary">{item.cta}</span>
              <CopyButton text={`Subject: ${item.subjectLine ?? item.subject}\n\n${item.body}\n\nCTA: ${item.cta}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Ad copy / product descriptions
  if (contentType === "ad_copy" || contentType === "promotion") {
    return (
      <div className="space-y-3">
        {(items as { headline: string; body: string; cta?: string; offer?: string; urgency?: string }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            {item.offer && <p className="text-xs font-bold text-yellow-400 mb-1">{item.offer}</p>}
            <p className="text-sm font-bold text-white mb-1">{item.headline}</p>
            <p className="text-xs text-muted leading-relaxed mb-2">{item.body}</p>
            {item.urgency && <p className="text-xs text-red-400 mb-2">⏱ {item.urgency}</p>}
            <div className="flex items-center justify-between">
              {item.cta && <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-0.5 text-xs text-primary-light">{item.cta}</span>}
              <CopyButton text={`${item.headline}\n${item.body}${item.cta ? "\nCTA: " + item.cta : ""}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Product descriptions
  if (contentType === "product_description") {
    return (
      <div className="space-y-3">
        {(items as { headline: string; shortDesc: string; longDesc: string; bullets: string[]; cta: string }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            <p className="text-sm font-bold text-white mb-1">{item.headline}</p>
            <p className="text-xs text-secondary italic mb-2">{item.shortDesc}</p>
            <p className="text-xs text-muted leading-relaxed mb-2">{item.longDesc}</p>
            <ul className="space-y-1 mb-2">
              {item.bullets?.map((b, bi) => (
                <li key={bi} className="flex items-start gap-1.5 text-xs text-muted">
                  <span className="text-secondary mt-0.5 shrink-0">✓</span>{b}
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary-light">{item.cta}</span>
              <CopyButton text={`${item.headline}\n${item.longDesc}\n${item.bullets?.join("\n")}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Content calendar
  if (contentType === "content_calendar") {
    return (
      <div className="space-y-4">
        {(items as { week: string; theme: string; posts: { day: string; platform: string; topic: string; type: string }[] }[]).map((week, i) => (
          <div key={i}>
            <p className="text-sm font-bold text-white mb-1">{week.week} <span className="text-secondary text-xs font-normal">— {week.theme}</span></p>
            <div className="space-y-1.5">
              {week.posts?.map((post, pi) => (
                <div key={pi} className="flex items-start gap-3 rounded-lg bg-[rgba(45,45,78,0.15)] px-3 py-2">
                  <span className="text-xs text-faint w-16 shrink-0">{post.day}</span>
                  <span className="text-xs text-secondary shrink-0">{post.platform}</span>
                  <span className="text-xs text-muted flex-1">{post.topic}</span>
                  <span className="text-xs text-faint shrink-0">{post.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Marketing/campaign ideas
  if (contentType === "marketing_ideas" || contentType === "campaign_ideas") {
    return (
      <div className="space-y-3">
        {(items as { idea?: string; name?: string; concept?: string; why?: string; goal?: string; channels?: string[]; tactics?: string[] }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            <p className="text-sm font-bold text-white mb-1">{item.idea ?? item.name}</p>
            <p className="text-xs text-muted leading-relaxed mb-2">{item.why ?? item.concept ?? item.goal}</p>
            {item.channels && <p className="text-xs text-faint">{item.channels.join(" · ")}</p>}
            {item.tactics && (
              <ul className="mt-2 space-y-1">
                {item.tactics.map((t, ti) => (
                  <li key={ti} className="text-xs text-muted flex gap-1.5"><span className="text-secondary shrink-0">→</span>{t}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Audience suggestions
  if (contentType === "audience_suggestions") {
    return (
      <div className="space-y-3">
        {(items as { segment: string; description: string; channels: string[]; messaging: string }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            <p className="text-sm font-bold text-white mb-1">{item.segment}</p>
            <p className="text-xs text-muted leading-relaxed mb-2">{item.description}</p>
            <p className="text-xs text-secondary mb-1">{item.channels?.join(" · ")}</p>
            <p className="text-xs text-faint italic">&ldquo;{item.messaging}&rdquo;</p>
          </div>
        ))}
      </div>
    );
  }

  // Brand voice guide
  if (contentType === "brand_voice_suggestions") {
    return (
      <div className="space-y-3">
        {(items as { tone: string; description: string; examples: string[]; avoid: string[] }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            <p className="text-sm font-bold text-white mb-1">{item.tone}</p>
            <p className="text-xs text-muted mb-3">{item.description}</p>
            <p className="text-xs font-bold text-secondary mb-1">Examples</p>
            {item.examples?.map((e, ei) => (
              <p key={ei} className="text-xs text-muted italic mb-1">&ldquo;{e}&rdquo;</p>
            ))}
            <p className="text-xs font-bold text-red-400 mt-2 mb-1">Avoid</p>
            <p className="text-xs text-faint">{item.avoid?.join(", ")}</p>
          </div>
        ))}
      </div>
    );
  }

  // Seasonal campaigns
  if (contentType === "seasonal_campaign") {
    return (
      <div className="space-y-3">
        {(items as { season: string; theme: string; headline: string; copy: string; cta: string }[]).map((item, i) => (
          <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-purple text-xs">{item.season}</span>
              <span className="text-xs text-secondary">{item.theme}</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">{item.headline}</p>
            <p className="text-xs text-muted leading-relaxed mb-2">{item.copy}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary-light">{item.cta}</span>
              <CopyButton text={`${item.headline}\n${item.copy}\nCTA: ${item.cta}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: string list (captions, headlines, etc.)
  return (
    <div className="space-y-2">
      {(items as string[]).map((item, i) => (
        <div key={i} className="rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] px-4 py-3 flex items-start justify-between gap-2">
          <p className="text-sm text-white leading-relaxed">{item}</p>
          <CopyButton text={item} label="" className="shrink-0" />
        </div>
      ))}
    </div>
  );
}
