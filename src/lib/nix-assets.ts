// ── Nix Zone asset manifest ──────────────────────────────────────────────────
// Free Nix goodies surfaced in the Nix Zone. Display-only — Fox provides every
// asset by dropping the file into /public/nix/<folder>/ and adding ONE line below.
//
// ⛔ HARD RULE: never AI-generate or fabricate Nix art. This file only references
// files that already exist on disk. An empty array renders a graceful "coming
// soon" empty state — never a placeholder Nix.
//
// To add a goodie:
//   1. Drop the file in the matching /public/nix/ folder
//   2. Add one entry to the matching array below
//   (paths are web paths from /public, e.g. "/nix/wallpapers/nix-desk-cosmic.png")

// Single renamable section label — swap this one value to rename everywhere.
// Options Fox may pick: "Nix Zone" · "Nix's Stash" · "Hang with Nix" · "Goblin Goodies" · "Nixville"
export const NIX_ZONE_LABEL = "✨ Nix";

export interface Wallpaper {
  name: string;
  desktop?: string; // full-res desktop file (e.g. 1920×1080 / 2560×1440)
  phone?: string;   // full-res phone file (e.g. 1080×1920)
}

export interface Sticker {
  name: string;
  path: string; // transparent-bg PNG (~512×512)
}

export interface GalleryItem {
  name: string;
  path: string;
  kind: "image" | "clip"; // "clip" → rendered in <video> (.mp4/.webm)
}

// ── Wallpapers ───────────────────────────────────────────────────────────────
// Drop files in /public/nix/wallpapers/ then add entries here.
// Example:
//   { name: "Cosmic Nix", desktop: "/nix/wallpapers/nix-cosmic-desktop.png", phone: "/nix/wallpapers/nix-cosmic-phone.png" },
export const WALLPAPERS: Wallpaper[] = [];

// ── Stickers ─────────────────────────────────────────────────────────────────
// Drop transparent-bg PNGs in /public/nix/stickers/ then add entries here.
// Example:
//   { name: "Waving Nix", path: "/nix/stickers/nix-wave.png" },
export const STICKERS: Sticker[] = [];

// ── Gallery (images + short clips) ───────────────────────────────────────────
// Drop files in /public/nix/gallery/ then add entries here.
// Example:
//   { name: "Nix skating", path: "/nix/gallery/nix-skate.png", kind: "image" },
//   { name: "Nix waving loop", path: "/nix/gallery/nix-wave.mp4", kind: "clip" },
export const GALLERY: GalleryItem[] = [];
