import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "BrandGoblin AI — Your AI Marketing Department",
    template: "%s | BrandGoblin AI",
  },
  description:
    "Everyone has an idea. BrandGoblin helps bring it to life. Turn any idea into a complete launch-ready brand in minutes — names, taglines, story, visuals, and unlimited marketing content.",
  metadataBase: new URL(APP_URL),
  keywords: ["brand generator", "AI branding", "brand name generator", "marketing AI", "brand kit", "BrandGoblin"],
  authors: [{ name: "BrandGoblin AI" }],
  creator: "BrandGoblin AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "BrandGoblin AI",
    title: "BrandGoblin AI — Everyone Has An Idea. We Help Bring It To Life.",
    description:
      "Turn any idea into a complete launch-ready brand in minutes. AI-powered names, taglines, story, visuals, and unlimited marketing content. Meet Nix — your AI brand strategist.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BrandGoblin AI — Your AI Marketing Department",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandGoblin AI — Your AI Marketing Department",
    description:
      "Everyone has an idea. BrandGoblin helps bring it to life. AI-powered brand kits + unlimited marketing content.",
    images: ["/og-image.png"],
    creator: "@brandgoblinai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="application-name" content="BrandGoblin AI" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} min-h-screen bg-bg font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
