# Airo Fix Pack — July 5, 2026 (the 3 audit errors)

Fixes for the 3 landing-page issues from the July 5 audit. The landing page is built in Airo,
so these ship as paste-ins. Feed Airo ONE block at a time, publish, hard-refresh the live site
and check, then move to the next block.

Order matters: Block 1 is the money fix, do it first.

---

## BLOCK 1 — "Already have a brand?" line (sells the new logo-upload feature)

Paste this into Airo:

In the "Now Nix designs the visuals, too" section (the one with the three product images:
coffee bag, serum bottle, surfboard), add one short line directly under the paragraph text,
before the Start Creating button. It should read exactly: "Already have a brand? Upload your
own logo and Nix stamps it on every product art and social graphic he makes for you." Style
it slightly smaller than the paragraph above it, in the site's gold accent color so it stands
out as a feature callout. Do not change anything else in the section.

Check after publish: line appears under the section text, gold, no layout break.

---

## BLOCK 2 — Remove the dead social icons

Paste this into Airo:

In the site footer, remove the three social media icons (Twitter, GitHub, LinkedIn) that
currently sit under the BrandGoblin description text. They link nowhere and hurt trust.
Do not change anything else in the footer: keep the logo, description text, all link columns,
and the legal links exactly as they are.

Check after publish: icons gone, footer columns intact, /privacy /terms /refund still linked.

(When real BrandGoblin social accounts exist, we add back only the ones actually in use.)

---

## BLOCK 3 — Console error on page load (best effort)

This one is inside Airo's own generated code, so a paste-in may or may not fix it. Worth one
attempt. Paste this into Airo:

The site throws a React hydration error (minified React error #418) in the browser console on
every page load. This usually means some content renders differently on the server than in the
browser, such as dates, times, random values, or rotating text. Please find and fix any content
that changes between server render and browser render so the console is clean on load. Do not
change the visible design.

Check after publish: open the live site, press F12, look at the Console tab, reload the page.
If a red "Minified React error #418" still appears, Airo could not fix it. In that case stop
here and leave it: the error does not break anything visible and only Airo/GoDaddy support can
fix their own generated code. Mention it to them if you ever contact support.

---

That is all 3. Blocks A and B from docs/AIRO_POWERED_BY_NIX_PASTEINS.md (the Powered by NIX
header + footer) can be fed in the same Airo session, still one block at a time.
