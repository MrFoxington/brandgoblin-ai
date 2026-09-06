import Link from "next/link";

/**
 * The BrandGoblin wordmark (Sept 6, 2026, Fox's call): a clean typographic
 * mark instead of the old full-lockup PNG (Nix + text) that read as busy in the
 * navbar. Nix himself lives INSIDE the app as the mascot, never as the logo.
 *
 * tone "dark" = in-app (paper text, green "Goblin"), "light" = marketing pages.
 */
export default function Wordmark({
  tone = "dark",
  href = "/",
  size = "md",
  showKicker = true,
}: {
  tone?: "light" | "dark";
  href?: string;
  size?: "sm" | "md";
  showKicker?: boolean;
}) {
  const light = tone === "light";
  const brand = light ? "text-ink" : "text-paper";
  const goblin = light ? "text-goblin" : "text-primary-light";
  const kicker = light ? "text-gold-dark" : "text-gold/90";
  const wordSize = size === "sm" ? "text-lg" : "text-[1.45rem]";

  return (
    <Link href={href} className="group inline-flex flex-col leading-none">
      <span
        className={`font-display font-bold tracking-tight ${wordSize}`}
        style={{ fontVariationSettings: '"SOFT" 30', letterSpacing: "-0.02em" }}
      >
        <span className={brand}>Brand</span>
        <span className={goblin}>Goblin</span>
      </span>
      {showKicker && (
        <span className={`mt-1 text-[9px] font-bold uppercase tracking-[0.22em] ${kicker}`}>
          Powered by NIX
        </span>
      )}
    </Link>
  );
}
