import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandGoblin AI — Type an idea. Summon a brand.",
  description:
    "BrandGoblin AI turns a single business idea into a complete launch-ready brand kit: names, taglines, voice, mascot, logo prompts, colors, copy, and a 7-day launch plan.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-goblin-bg bg-goblin-glow font-display antialiased">
        {children}
      </body>
    </html>
  );
}
