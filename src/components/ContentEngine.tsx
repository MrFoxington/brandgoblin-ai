"use client";

import { useState } from "react";
import Link from "next/link";
import CopyButton from "./CopyButton";
import type { BrandKit, BrandInput, MarketingContentType, Plan } from "@/types";

const CONTENT_TYPES: {
  key: MarketingContentType;
  label: string;
  emoji: string;
  desc: string;
  button: string;
}[] = [
  { key: "social_posts",       label: "Social Posts",        emoji: "📸", desc: "10 Instagram post ideas",        button: "Conjure Posts" },
  { key: "captions",           label: "Captions",            emoji: "✍️", desc: "10 fresh captions",              button: "Conjure Captions" },
  { key: "blog_ideas",         label: "Blog Ideas",          emoji: "📝", desc: "10 blog topics",                 button: "Conjure Blogs" },
  { key: "ad_copy",            label: "Ad Copy",             emoji: "📢", desc: "10 ad ideas",                    button: "Conjure Ads" },
  { key: "email_campaigns",    label: "Email Campaigns",     emoji: "📧", desc: "5 email campaign ideas",         button: "Conjure Emails" },
  { key: "video_ideas",        label: "Video Ideas",         emoji: "🎬", desc: "10 Reel/TikTok ideas",           button: "Conjure Videos" },
  { key: "hashtags",           label: "Hashtags",            emoji: "🏷️", desc: "10 hashtag sets",               button: "Conjure Hashtags" },
  { key: "seasonal_campaigns", label: "Seasonal Campaigns",  emoji: "🌟", desc: "5 campaign ideas",               button: "Conjure Campaign" },
  { key: "meme_ideas",         label: "Meme Ideas",          emoji: "😄", desc: "10 meme concepts",               button: "Conjure Memes" },
  { key: "headline_ideas",     label: "Headlines",           emoji: "🎯", desc: "10 promo headlines",             button: "Conjure Headlines" },
  { key: "website_copy",       label: "Website Copy",        emoji: "🌐", desc: "10 copy variations",             button: "Conjure Copy" },
  { key: "cta_ideas",          label: "CTA Ideas",           emoji: "⚡", desc: "10 call-to-action variations",  button: "Conjure CTAs" },
];

export default function ContentEngine({
  brandId,
  kit,
  input,
  plan,
}: {
  brandId: string;
  kit: BrandKit;
  input: BrandInput;
  plan: Plan;
}) {
  const isPro = plan === "pro" || plan === "agency";
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleConjure(contentType: MarketingContentType) {
    if (!isPro) { setShowUpgrade(true); return; }
    if (loading) return;
    setLoading(contentType);
    setErrors((prev) => ({ ...prev, [contentType]: "" }));

    try {
      const res = await fetch("/api/generate/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          brandName: kit.recommendedName,
          businessIdea: input.businessIdea,
          brandStory: kit.brandStory?.mission ?? "",
          tagline: kit.taglines?.[0] ?? "",
          tone: input.vibe,
          targetAudience: input.targetAudience,
          contentType,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.upgrade) { setShowUpgrade(true); return; }
        throw new Error(json.error ?? "Failed.");
      }

      setResults((prev) => ({ ...prev, [contentType]: json.data }));
      setExpanded(contentType);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [contentType]: err instanceof Error ? err.message : "The goblin dropped the scroll. Try again.",
      }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div data-print-hide className="mt-10">
      {/* Upgrade modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-primary/20 p-8 text-center shadow-2xl">
            <span className="text-4xl block mb-4">🧌</span>
            <h3 className="font-display text-xl font-extrabold text-white mb-2">
              Unlock Creator Pro
            </h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Unlock Creator Pro to keep growing your brand with fresh posts, captions, blogs, ads, campaigns, and marketing ideas every month.
            </p>
            <Link href="/pricing" className="btn-primary w-full py-3 block text-center mb-3">
              ✦ Upgrade to Creator Pro
            </Link>
            <button
              onClick={() => setShowUpgrade(false)}
              className="text-sm text-muted hover:text-white transition-colors w-full py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white mb-1">
                Keep Growing This Brand
              </h2>
              <p className="text-sm text-muted">
                {isPro
                  ? "Generate unlimited fresh marketing content whenever you need it."
                  : "Creator Pro helps you keep creating fresh marketing content whenever you need it."}
              </p>
            </div>
            {!isPro && (
              <Link href="/pricing" className="btn-primary !py-2 !px-5 text-sm shrink-0">
                ✦ Upgrade to Creator Pro
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map((ct) => {
            const hasResult = !!results[ct.key];
            const isLoading = loading === ct.key;
            const err = errors[ct.key];
            const isOpen = expanded === ct.key;

            return (
              <div key={ct.key} className="flex flex-col rounded-xl border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.15)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{ct.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{ct.label}</p>
                      <p className="text-xs text-muted">{ct.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      onClick={() => handleConjure(ct.key)}
                      disabled={isLoading || !!loading}
                      className="btn-ghost !text-xs !py-1.5 !px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "✨ Conjuring…" : isPro ? ct.button : `🔒 ${ct.button}`}
                    </button>
                    {hasResult && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : ct.key)}
                        className="text-xs text-primary-light hover:text-white transition-colors"
                      >
                        {isOpen ? "▲ Hide" : "▼ Show results"}
                      </button>
                    )}
                  </div>
                </div>

                {isLoading && (
                  <p className="text-xs text-muted italic px-4 pb-3 animate-pulse">
                    The goblin is conjuring fresh content…
                  </p>
                )}
                {err && (
                  <p className="text-xs text-red-400 px-4 pb-3">{err}</p>
                )}

                {isOpen && hasResult && (
                  <div className="border-t border-[rgba(45,45,78,0.6)] bg-[rgba(10,10,15,0.4)] p-4 max-h-96 overflow-y-auto">
                    <ContentResults contentType={ct.key} data={results[ct.key]} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContentResults({ contentType, data }: { contentType: MarketingContentType; data: unknown }) {
  const items = (data as { items: unknown[] })?.items ?? [];

  if (contentType === "social_posts") {
    return (
      <div className="space-y-4">
        {(items as { hook: string; caption: string; visualIdea: string; hashtags: string[] }[]).map((item, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <p className="text-xs font-bold text-primary-light mb-1">Hook</p>
            <p className="text-sm text-white font-semibold mb-2">{item.hook}</p>
            <p className="text-xs font-bold text-secondary mb-1">Caption</p>
            <p className="text-sm text-muted mb-2 leading-relaxed">{item.caption}</p>
            <p className="text-xs font-bold text-faint mb-1">Visual Idea</p>
            <p className="text-xs text-muted italic mb-2">{item.visualIdea}</p>
            <div className="flex items-start gap-2">
              <p className="text-xs text-faint flex-1">{item.hashtags?.join(" ")}</p>
              <CopyButton text={`${item.caption}\n\n${item.hashtags?.join(" ")}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contentType === "blog_ideas") {
    return (
      <div className="space-y-3">
        {(items as { title: string; summary: string; seoKeywords: string[] }[]).map((item, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-white">{item.title}</p>
              <CopyButton text={item.title} label="" className="shrink-0" />
            </div>
            <p className="text-xs text-muted mt-1 mb-2 leading-relaxed">{item.summary}</p>
            <p className="text-xs text-faint">{item.seoKeywords?.join(", ")}</p>
          </div>
        ))}
      </div>
    );
  }

  if (contentType === "ad_copy") {
    return (
      <div className="space-y-3">
        {(items as { headline: string; body: string; cta: string }[]).map((item, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <p className="text-sm font-bold text-white mb-1">{item.headline}</p>
            <p className="text-xs text-muted mb-2 leading-relaxed">{item.body}</p>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-0.5 text-xs font-semibold text-primary-light">{item.cta}</span>
              <CopyButton text={`${item.headline}\n${item.body}\nCTA: ${item.cta}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contentType === "email_campaigns") {
    return (
      <div className="space-y-3">
        {(items as { subjectLine: string; emailBody: string; offer: string }[]).map((item, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <p className="text-xs font-bold text-primary-light mb-1">Subject</p>
            <p className="text-sm font-bold text-white mb-2">{item.subjectLine}</p>
            <p className="text-xs text-muted mb-2 leading-relaxed">{item.emailBody}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-secondary italic">{item.offer}</p>
              <CopyButton text={`Subject: ${item.subjectLine}\n\n${item.emailBody}\n\nOffer: ${item.offer}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contentType === "video_ideas") {
    return (
      <div className="space-y-3">
        {(items as { hook: string; videoConcept: string; cta: string }[]).map((item, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <p className="text-xs font-bold text-primary-light mb-1">Hook</p>
            <p className="text-sm font-bold text-white mb-2">{item.hook}</p>
            <p className="text-xs text-muted mb-2 leading-relaxed">{item.videoConcept}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary">{item.cta}</span>
              <CopyButton text={`Hook: ${item.hook}\n${item.videoConcept}\nCTA: ${item.cta}`} label="" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contentType === "hashtags") {
    return (
      <div className="space-y-2">
        {(items as string[][]).map((set, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3 flex items-start justify-between gap-2">
            <p className="text-xs text-muted flex-1 leading-relaxed">{set.join(" ")}</p>
            <CopyButton text={set.join(" ")} label="" className="shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (contentType === "seasonal_campaigns") {
    return (
      <div className="space-y-3">
        {(items as { campaignTheme: string; offer: string; socialPostIdea: string; emailIdea: string }[]).map((item, i) => (
          <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] p-3">
            <p className="text-sm font-bold text-white mb-1">{item.campaignTheme}</p>
            <p className="text-xs text-secondary mb-1">Offer: {item.offer}</p>
            <p className="text-xs text-muted mb-1">📸 {item.socialPostIdea}</p>
            <p className="text-xs text-muted">📧 {item.emailIdea}</p>
          </div>
        ))}
      </div>
    );
  }

  // Default: simple string list (captions, meme_ideas, headline_ideas, website_copy, cta_ideas)
  return (
    <div className="space-y-2">
      {(items as string[]).map((item, i) => (
        <div key={i} className="rounded-lg border border-[rgba(45,45,78,0.6)] bg-[rgba(45,45,78,0.2)] px-3 py-2 flex items-start justify-between gap-2">
          <p className="text-sm text-white leading-relaxed">{item}</p>
          <CopyButton text={item} label="" className="shrink-0" />
        </div>
      ))}
    </div>
  );
}
