// GET /api/admin/font-debug — runs every stage of the thumbnail text pipeline
// IN the production runtime and reports exactly where it breaks. Admin-only.
// Added July 24 after four blind-fix rounds on the tofu/empty-title bug: no
// more guessing — this returns ground truth from the actual Vercel lambda.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inspectTtf } from "@/lib/studio/ttf-inspect";
import { pickTtfUrlFromCss } from "@/lib/studio/font-files";
import { renderTextImage } from "@/lib/studio/text-overlay";

export const runtime = "nodejs";

const TTF_UA = "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "joepro@hotmail.com";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errMsg(e: any): string {
  return String(e?.message ?? e).slice(0, 300);
}

export async function GET() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user || authData.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const report: Record<string, any> = {
    node: process.version,
    env: { FONTCONFIG_PATH: process.env.FONTCONFIG_PATH ?? null },
  };

  // A: can this lambda reach Google Fonts css2 (old-UA TTF variant)?
  try {
    const res = await fetch(
      "https://fonts.googleapis.com/css2?family=Jost:wght@700&display=swap",
      { headers: { "User-Agent": TTF_UA } }
    );
    const css = await res.text();
    // Use the REAL production picker (not a private regex) so this endpoint
    // exercises the exact code path thumbnails use — and echo the raw CSS
    // body, because on July 24 a null ttfUrl with status 200 left us blind.
    const ttfUrl = pickTtfUrlFromCss(css);
    report.a_css = {
      status: res.status,
      cssLength: css.length,
      ttfUrl,
      cssBody: css.slice(0, 2000),
    };

    // B: download + inspect the ttf
    if (ttfUrl) {
      const ttfRes = await fetch(ttfUrl);
      const buf = Buffer.from(await ttfRes.arrayBuffer());
      report.b_ttf = { status: ttfRes.status, bytes: buf.length, inspect: inspectTtf(buf) };

      // C: opentype.js module shape + parse
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m: any = await import("opentype.js");
        report.c_opentype = {
          keys: Object.keys(m).slice(0, 10),
          hasParse: typeof m?.parse === "function",
          hasDefaultParse: typeof m?.default?.parse === "function",
        };
        const ot = typeof m?.parse === "function" ? m : m?.default;
        const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        const font = ot.parse(ab);
        const probe = font.getPath("A", 0, 0, 64).toPathData(1);
        report.d_parse = {
          ok: true,
          unitsPerEm: font.unitsPerEm,
          ascender: font.ascender,
          probeLen: probe?.length ?? 0,
        };
      } catch (e) {
        report.c_or_d_error = errMsg(e);
      }
    }
  } catch (e) {
    report.a_error = errMsg(e);
  }

  // E: the full real renderer, exactly as thumbnails use it
  try {
    const r = await renderTextImage({
      text: "TEST DRIFT OK",
      family: "Jost",
      weight: 700,
      uppercase: true,
      color: "#FFFFFF",
      accentWord: "DRIFT",
      accentColor: "#FF6B35",
      boxWidth: 600,
      boxHeight: 200,
      align: "left",
    });
    report.e_render = {
      width: r.width,
      height: r.height,
      pngBytes: r.buffer.length,
      pngBase64: r.buffer.length < 200000 ? `data:image/png;base64,${r.buffer.toString("base64")}` : "(too big)",
    };
  } catch (e) {
    report.e_error = errMsg(e);
  }

  return NextResponse.json(report);
}
