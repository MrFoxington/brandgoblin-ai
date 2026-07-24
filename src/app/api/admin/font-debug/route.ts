// GET /api/admin/font-debug — runs every stage of the thumbnail text pipeline
// IN the production runtime and reports exactly where it breaks. Admin-only.
// Added July 24 after four blind-fix rounds on the tofu/empty-title bug: no
// more guessing — this returns ground truth from the actual Vercel lambda.
//
// v3 (bundled font pack era) reports, in order:
//   bundle    — what the committed font pack looks like from this lambda
//   resolve   — which layer (bundled-fs / bundled-cdn / google / cache)
//               actually serves the house font and the pack's first family
//   a_css     — the raw Google css2 answer (the runtime last-resort layer)
//   e_render  — a real render through the exact production code path

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFontFile, pickFontUrlFromCss, FIRST_BUNDLED_FAMILY } from "@/lib/studio/font-files";
import { renderTextImage } from "@/lib/studio/text-overlay";
import manifest from "@/lib/studio/font-manifest.json";
import { promises as fs } from "fs";
import path from "path";

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
  const report: Record<string, any> = { node: process.version };

  // Bundle: is the committed font pack visible from this lambda?
  try {
    const fontDir = path.join(process.cwd(), "public", "fonts");
    let onDisk: string[] | string;
    try {
      onDisk = (await fs.readdir(fontDir)).slice(0, 5);
    } catch (e) {
      onDisk = `unreadable: ${errMsg(e)}`;
    }
    report.bundle = {
      manifestFamilies: Object.keys(manifest).length,
      firstBundledFamily: FIRST_BUNDLED_FAMILY,
      fontDirSample: onDisk,
    };
  } catch (e) {
    report.bundle_error = errMsg(e);
  }

  // Resolve: which layer serves the fonts thumbnails actually ask for?
  for (const [label, fam] of [["houseFont", "Jost"], ["firstBundled", FIRST_BUNDLED_FAMILY ?? ""]] as const) {
    if (!fam) continue;
    try {
      const r = await getFontFile(fam, 700, false);
      report[`resolve_${label}`] = r
        ? { family: fam, source: r.source, file: path.basename(r.path) }
        : { family: fam, resolved: null };
    } catch (e) {
      report[`resolve_${label}_error`] = errMsg(e);
    }
  }

  // A: the Google last-resort layer — raw css2 answer, never blind again.
  try {
    const res = await fetch(
      "https://fonts.googleapis.com/css2?family=Jost:wght@700&display=swap",
      { headers: { "User-Agent": TTF_UA } }
    );
    const css = await res.text();
    report.a_css = {
      status: res.status,
      cssLength: css.length,
      pickedUrl: pickFontUrlFromCss(css),
      cssBody: css.slice(0, 2000),
    };
  } catch (e) {
    report.a_error = errMsg(e);
  }

  // E: the full real renderer, exactly as thumbnails use it.
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
