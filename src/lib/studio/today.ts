// "Today in the Studio" (Creator Studio Phase D, Sept 2026).
// One suggested creation per brand per day, picked deterministically so the
// Vault rail, the Studio and a reload all agree. Pure, no React, safe anywhere.

import type { ImageType } from "@/lib/energy-config";

export interface StudioIdea {
  key: string;
  /** Shown to the user. One line. */
  label: string;
  imageType: ImageType;
  /** Art direction handed to the prompt cooker (empty for thumbnails: they use the guided form). */
  note: string;
}

export const STUDIO_IDEAS: StudioIdea[] = [
  { key: "hero",        label: "A moody hero shot of your product",          imageType: "product_art",       note: "moody, dramatic hero shot with cinematic lighting" },
  { key: "flatlay",     label: "A bold product flatlay",                     imageType: "product_art",       note: "bold product flatlay with colorful props and graphic styling" },
  { key: "packaging",   label: "Your packaging, up close",                   imageType: "product_art",       note: "close-up packaging shot, premium materials, soft studio light" },
  { key: "lifestyle",   label: "Your product in someone's hands",            imageType: "product_art",       note: "lifestyle shot with the product in use, natural light, a real setting" },
  { key: "mascot",      label: "Your mascot in a playful scene",             imageType: "mascot",            note: "playful, fun mascot scene with vibrant colors" },
  { key: "logo-card",   label: "A minimalist logo card",                     imageType: "logo_concept",      note: "clean minimalist logo on a simple card, lots of white space" },
  { key: "announce",    label: "A social post that announces something",     imageType: "social_graphic",    note: "announcement-style social graphic with a strong focal composition and room for a headline" },
  { key: "bold-line",   label: "A social graphic built around one bold line", imageType: "social_graphic",   note: "typographic social graphic with one bold statement as the hero element" },
  { key: "thumbnail",   label: "A thumbnail for your next video",            imageType: "youtube_thumbnail", note: "" },
];

export function findStudioIdea(key: string | undefined | null): StudioIdea | undefined {
  if (!key) return undefined;
  return STUDIO_IDEAS.find((i) => i.key === key);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The day's pick for a brand. Same brand + same day = same idea, everywhere. */
export function pickTodayIdea(brandId: string, date: Date = new Date()): StudioIdea {
  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const idx = hashString(`${brandId}|${dayKey}`) % STUDIO_IDEAS.length;
  return STUDIO_IDEAS[idx];
}

/** The Studio link that opens with this idea already cooking. */
export function studioHrefFor(brandId: string, idea: StudioIdea): string {
  return `/dashboard/studio?brand=${brandId}&type=${idea.imageType}&spark=${idea.key}`;
}
