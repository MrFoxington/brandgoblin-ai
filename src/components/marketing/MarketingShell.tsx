import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Brand Maturity P4 (Sept 2026) — the marketing frame.
 *
 * Wraps a marketing page (landing, pricing, auth) in the `.theme-marketing`
 * scope: warm paper, ink text, goblin-green actions, Fraunces headlines.
 * Navbar and Footer render in their light tone so the frame matches the page,
 * whoever is looking at it (the tone follows the PAGE, not the login state).
 *
 * In-app pages (dashboard, Studio, generate…) don't use this and keep the dark
 * look until they inherit the system.
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-marketing flex min-h-screen flex-col bg-paper text-ink">
      <Navbar tone="light" />
      {children}
      <Footer tone="light" />
    </div>
  );
}
