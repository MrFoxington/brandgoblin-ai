import Link from "next/link";
import NixPose from "@/components/primitives/NixPose";

// Branded 404 — replaces the default unbranded Next.js dead end.
// Every lost visitor gets Nix + a way back in, on-brand.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <NixPose pose="thinking" size={140} glow />
      <p className="mt-6 text-xs font-bold tracking-widest uppercase text-primary-light">
        Error 404
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-black text-white mt-2">
        This page got goblin&rsquo;d.
      </h1>
      <p className="text-sm text-muted mt-3 max-w-md">
        Nix looked everywhere — under the cauldron, behind the brand vault — and this
        page just isn&rsquo;t here. Your ideas are safe, though.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className="btn-primary !py-2.5 !px-5 text-sm">
          ✦ Back to my Brand Vault
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-[rgba(45,45,78,0.8)] px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-white"
        >
          Go to the homepage
        </Link>
      </div>
      <p className="mt-10 text-xs text-faint italic">
        Nix says: &ldquo;I blame the interns. We don&rsquo;t have interns. It&rsquo;s complicated.&rdquo;
      </p>
    </div>
  );
}
