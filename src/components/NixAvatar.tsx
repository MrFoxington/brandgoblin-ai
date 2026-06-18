"use client";

import Image from "next/image";

type NixSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZE_MAP: Record<NixSize, number> = {
  xs: 28,
  sm: 40,
  md: 56,
  lg: 88,
  xl: 128,
  hero: 280,
};

export default function NixAvatar({
  size = "md",
  glow = false,
  className = "",
}: {
  size?: NixSize;
  glow?: boolean;
  className?: string;
}) {
  const px = SIZE_MAP[size];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        flexShrink: 0,
        filter: glow
          ? "drop-shadow(0 0 12px rgba(124,58,237,0.7)) drop-shadow(0 0 24px rgba(124,58,237,0.35))"
          : undefined,
      }}
      aria-label="Nix — BrandGoblin AI mascot"
      role="img"
    >
      <Image
        src="/logos/brandgoblin-logo.png"
        alt="Nix the BrandGoblin wizard"
        width={px}
        height={px}
        style={{ objectFit: "contain", width: px, height: px }}
        priority={size === "hero" || size === "xl" || size === "lg"}
      />
    </span>
  );
}
