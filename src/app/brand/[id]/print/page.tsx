import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintTrigger from "@/components/PrintTrigger";
import type { BrandGenerationRow, BrandKit, BrandInput } from "@/types";

export default async function BrandPrintPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: row } = await supabase
    .from("brand_generations")
    .select("id, user_id, input_data, output_data, created_at")
    .eq("id", params.id)
    .eq("user_id", authData.user.id)
    .single();

  if (!row) notFound();

  const generation = row as BrandGenerationRow;
  const kit = generation.output_data as BrandKit;
  const input = generation.input_data as BrandInput;
  const date = new Date(generation.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <PrintTrigger />
      <div
        style={{
          background: "#0a0a0f",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 32px",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        } as React.CSSProperties}
      >
        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(124,58,237,0.3)", paddingBottom: "24px", marginBottom: "32px" }}>
          <p style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            BrandGoblin AI · Brand Kit
          </p>
          <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#ffffff", margin: "0 0 6px 0" }}>
            {kit.recommendedName}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            {input.businessIdea} · {input.industry} · {input.vibe} · Generated {date}
          </p>
        </div>

        {/* Print button — hidden when printing */}
        <div className="no-print" style={{ marginBottom: "24px", display: "flex", gap: "12px" }}>
          <button
            onClick={() => window.print()}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #10b981)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            onClick={() => window.close()}
            style={{
              background: "rgba(45,45,78,0.6)",
              color: "#94a3b8",
              border: "1px solid rgba(45,45,78,0.8)",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ← Close
          </button>
        </div>

        {/* Brand Names */}
        <Section title="🏆 Brand Names">
          {kit.favoriteName ? (
            <>
              <div style={cardStyle({ border: "rgba(234,179,8,0.3)", bg: "rgba(234,179,8,0.05)" })}>
                <Label color="#eab308">🏆 Goblin&apos;s Favorite Pick</Label>
                <p style={{ fontSize: "26px", fontWeight: 900, color: "#fff", margin: "6px 0 4px" }}>{kit.favoriteName.name}</p>
                <p style={{ color: "#10b981", fontStyle: "italic", fontSize: "14px", margin: "0 0 12px" }}>&ldquo;{kit.favoriteName.tagline}&rdquo;</p>
                <Row>
                  <MiniCard title="Why the Goblin picked it" text={kit.favoriteName.whyPicked} />
                  <MiniCard title="Best for" text={kit.favoriteName.bestFor} />
                </Row>
              </div>
              {(kit.alternativeNames ?? []).length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <Label color="#64748b">Alternative Names</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    {kit.alternativeNames!.map((a) => (
                      <div key={a.name} style={cardStyle({})}>
                        <p style={{ fontWeight: 700, color: "#fff", fontSize: "15px", margin: "0 0 2px" }}>{a.name}</p>
                        <p style={{ color: "#10b981", fontStyle: "italic", fontSize: "12px", margin: "0 0 4px" }}>&ldquo;{a.tagline}&rdquo;</p>
                        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>{a.whyItWorks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {kit.recommendedName && (
                <div style={cardStyle({ border: "rgba(124,58,237,0.3)", bg: "rgba(124,58,237,0.05)" })}>
                  <Label color="#a78bfa">Recommended Name</Label>
                  <p style={{ fontSize: "24px", fontWeight: 900, color: "#fff", margin: "4px 0 0" }}>{kit.recommendedName}</p>
                </div>
              )}
              {(kit.brandNames ?? []).map((n) => (
                <div key={n.name} style={{ ...cardStyle({}), marginTop: "6px" }}>
                  <p style={{ fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{n.name}</p>
                  {n.reasoning && <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>{n.reasoning}</p>}
                </div>
              ))}
            </>
          )}
        </Section>

        {/* Name Strength Check */}
        {kit.nameStrengthCheck && (
          <Section title="🔍 Name Strength Check">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <MiniCard title="What Works" text={kit.nameStrengthCheck.whatWorks} titleColor="#22c55e" />
              <MiniCard title="Potential Concerns" text={kit.nameStrengthCheck.potentialConcerns} titleColor="#eab308" />
              <MiniCard title="Suggested Refinement" text={kit.nameStrengthCheck.suggestedRefinement} titleColor="#a78bfa" />
              <MiniCard title="Best Positioning Angle" text={kit.nameStrengthCheck.bestPositioningAngle} titleColor="#10b981" />
            </div>
          </Section>
        )}

        {/* Taglines */}
        <Section title="💬 Taglines">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {kit.taglines.map((t, i) => (
              <div key={i} style={cardStyle({})}>
                <p style={{ color: "#fff", fontSize: "13px", margin: 0 }}>&ldquo;{t}&rdquo;</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Brand Story */}
        <Section title="📖 Brand Story">
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>{kit.brandStory.originStory}</p>
          <div style={cardStyle({ border: "rgba(124,58,237,0.3)", bg: "rgba(124,58,237,0.05)" })}>
            <Label color="#a78bfa">Mission</Label>
            <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: "4px 0 0", lineHeight: 1.6 }}>{kit.brandStory.mission}</p>
          </div>
        </Section>

        {/* Brand Voice */}
        <Section title="🎭 Brand Voice">
          <Row>
            <div style={{ flex: 1 }}>
              <Label color="#94a3b8">Personality Traits</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {kit.brandVoice.personalityTraits.map((t) => (
                  <Pill key={t} text={t} />
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Label color="#94a3b8">Tone Examples</Label>
              <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
                {kit.brandVoice.toneExamples.map((t, i) => (
                  <li key={i} style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>→ {t}</li>
                ))}
              </ul>
            </div>
          </Row>
          <Row style={{ marginTop: "12px" }}>
            <div style={{ flex: 1 }}>
              <Label color="#10b981">✓ Words to Use</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {kit.brandVoice.wordsToUse.map((w) => (
                  <Pill key={w} text={w} color="green" />
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Label color="#f87171">✗ Words to Avoid</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {kit.brandVoice.wordsToAvoid.map((w) => (
                  <Pill key={w} text={w} color="red" />
                ))}
              </div>
            </div>
          </Row>
        </Section>

        {/* Mascot */}
        <Section title="🐲 Mascot Concept">
          <p style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{kit.mascot.name}</p>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, marginBottom: "6px" }}>{kit.mascot.appearance}</p>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, marginBottom: "6px" }}>{kit.mascot.personality}</p>
          <div style={cardStyle({})}>
            <Label color="#a78bfa">AI Image Prompt</Label>
            <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6, margin: "4px 0 0" }}>{kit.mascot.imagePrompt}</p>
          </div>
        </Section>

        {/* Logo Prompt */}
        <Section title="🖼️ Logo Prompt">
          <div style={cardStyle({})}>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{kit.logoPrompt}</p>
          </div>
        </Section>

        {/* Color Palette */}
        <Section title="🎨 Color Palette">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
            {kit.colorPalette.map((c) => (
              <div key={c.hex} style={cardStyle({})}>
                <div style={{ height: "40px", borderRadius: "6px", background: c.hex, marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }} />
                <p style={{ fontWeight: 700, color: "#fff", fontSize: "12px", margin: "0 0 2px" }}>{c.name}</p>
                <p style={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace", margin: "0 0 2px" }}>{c.hex}</p>
                <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>{c.usage}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Website Copy */}
        <Section title="🌐 Website Copy">
          <div style={{ marginBottom: "12px" }}>
            <Label color="#94a3b8">Hero Headline</Label>
            <p style={{ fontSize: "20px", fontWeight: 900, color: "#fff", margin: "4px 0 0" }}>{kit.websiteCopy.heroHeadline}</p>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <Label color="#94a3b8">Subheadline</Label>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0" }}>{kit.websiteCopy.subheadline}</p>
          </div>
          <Row>
            <div style={{ flex: 1 }}>
              <Label color="#94a3b8">CTA Button</Label>
              <div style={{ display: "inline-block", background: "linear-gradient(135deg,#7c3aed,#10b981)", color: "#fff", borderRadius: "8px", padding: "6px 16px", fontSize: "13px", fontWeight: 700, marginTop: "4px" }}>
                {kit.websiteCopy.ctaText}
              </div>
            </div>
          </Row>
          <div style={{ marginTop: "12px" }}>
            <Label color="#94a3b8">About Section</Label>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: "4px 0 0" }}>{kit.websiteCopy.aboutSection}</p>
          </div>
          <div style={{ marginTop: "12px" }}>
            <Label color="#94a3b8">Feature Bullets</Label>
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
              {kit.websiteCopy.featureBullets.map((f, i) => (
                <li key={i} style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "4px" }}>✓ {f}</li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Social Kit */}
        <Section title="📱 Social Media Kit">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            {[
              { platform: "Instagram", bio: kit.socialKit.instagramBio },
              { platform: "X / Twitter", bio: kit.socialKit.twitterBio },
              { platform: "TikTok", bio: kit.socialKit.tiktokBio },
            ].map(({ platform, bio }) => (
              <div key={platform} style={cardStyle({})}>
                <Label color="#a78bfa">{platform}</Label>
                <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, margin: "4px 0 0" }}>{bio}</p>
              </div>
            ))}
          </div>
          <Label color="#94a3b8">Launch Posts</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
            {kit.socialKit.launchPosts.map((p, i) => (
              <div key={i} style={cardStyle({})}>
                <p style={{ color: "#fff", fontSize: "12px", lineHeight: 1.5, margin: 0 }}>{p}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Marketing Ideas */}
        <Section title="🚀 Marketing & Meme Ideas">
          <Row>
            <div style={{ flex: 1 }}>
              <Label color="#a78bfa">Viral Content Ideas</Label>
              <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
                {kit.marketingIdeas.viralContentIdeas.map((idea, i) => (
                  <li key={i} style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "3px" }}>→ {idea}</li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <Label color="#10b981">Meme Ideas</Label>
              <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
                {kit.marketingIdeas.memeIdeas.map((idea, i) => (
                  <li key={i} style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "3px" }}>→ {idea}</li>
                ))}
              </ul>
              <Label color="#a78bfa" style={{ marginTop: "12px" }}>Ad Angles</Label>
              <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
                {kit.marketingIdeas.adAngles.map((idea, i) => (
                  <li key={i} style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "3px" }}>→ {idea}</li>
                ))}
              </ul>
            </div>
          </Row>
        </Section>

        {/* Launch Plan */}
        <Section title="📅 7-Day Launch Plan">
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {kit.launchPlan.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: "12px", ...cardStyle({}), marginBottom: "6px" }}>
                <span style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: "rgba(16,185,129,0.2)", color: "#10b981", fontSize: "11px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Footer */}
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(45,45,78,0.6)", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
            Generated by BrandGoblin AI · brandgoblinai.com
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #0a0a0f !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </>
  );
}

// ── Small inline helpers ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px", pageBreakInside: "avoid" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid rgba(45,45,78,0.6)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Label({ color = "#94a3b8", children, style }: { color?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, margin: 0, ...style }}>
      {children}
    </p>
  );
}

function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: "12px", ...style }}>
      {children}
    </div>
  );
}

function MiniCard({ title, text, titleColor = "#a78bfa" }: { title: string; text: string; titleColor?: string }) {
  return (
    <div style={cardStyle({})}>
      <Label color={titleColor}>{title}</Label>
      <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, margin: "4px 0 0" }}>{text}</p>
    </div>
  );
}

function Pill({ text, color }: { text: string; color?: "green" | "red" }) {
  const styles: React.CSSProperties = {
    borderRadius: "999px",
    padding: "2px 10px",
    fontSize: "11px",
    fontWeight: 600,
    border: "1px solid",
    ...(color === "green"
      ? { background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }
      : color === "red"
      ? { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }
      : { background: "rgba(124,58,237,0.1)", borderColor: "rgba(124,58,237,0.3)", color: "#a78bfa" }),
  };
  return <span style={styles}>{text}</span>;
}

function cardStyle({ border = "rgba(45,45,78,0.6)", bg = "rgba(45,45,78,0.2)" }: { border?: string; bg?: string }): React.CSSProperties {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: "8px",
    padding: "10px 12px",
  };
}
