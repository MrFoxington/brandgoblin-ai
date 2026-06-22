"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { NIX_ZONE_LABEL, WALLPAPERS, STICKERS, GALLERY } from "@/lib/nix-assets";
import NixWallpapers from "./NixWallpapers";
import NixStickers from "./NixStickers";
import NixGallery from "./NixGallery";

function SectionHeading({ emoji, title, hint }: { emoji: string; title: string; hint: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-xl font-black text-white flex items-center gap-2">
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <p className="text-xs text-faint mt-0.5">{hint}</p>
    </div>
  );
}

export default function NixZone() {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={reduce ? {} : { rotate: [0, -8, 8, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          className="shrink-0"
        >
          <Image
            src="/nix/happy-waving-nix.png"
            alt="Nix waving hello"
            width={96}
            height={96}
            className="object-contain drop-shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            priority
          />
        </motion.div>
        <div>
          <h1 className="font-display text-3xl font-black text-white mb-1">{NIX_ZONE_LABEL}</h1>
          <p className="text-sm text-muted">
            Free Nix goodies — wallpapers, stickers, and more. Grab them, share them, spread the goblin. 🧙
          </p>
        </div>
      </div>

      {/* Wallpapers */}
      <section>
        <SectionHeading emoji="🖼" title="Wallpapers" hint="Desktop & phone — lightly marked so Nix travels with them." />
        <NixWallpapers wallpapers={WALLPAPERS} />
      </section>

      {/* Stickers */}
      <section>
        <SectionHeading emoji="🌟" title="Sticker Pack" hint="Transparent PNGs for your messengers." />
        <NixStickers stickers={STICKERS} />
      </section>

      {/* Gallery */}
      <section>
        <SectionHeading emoji="🎬" title="Nix Gallery" hint="Nix doing cool stuff — share the fun." />
        <NixGallery items={GALLERY} />
      </section>
    </div>
  );
}
