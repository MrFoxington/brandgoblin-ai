# BrandGoblin AI — "Cofounder Lite" Brief (Brand Memory · Welcome Back · Library Search)
> Build spec for three additive, low-risk upgrades that make BrandGoblin feel like a cofounder
> **without** touching the Stripe, energy, or auth systems already shipped.
> Hand to Claude Code. Build in the phase order below.

---

## 0. PRIME DIRECTIVE — DO NOT BREAK WHAT EXISTS

This work is **additive and read-mostly**. It must not alter the payment or energy systems.

**Existing tables — extend, never recreate or rename:**
`users`, `brand_generations`, `creator_content`, `user_energy_balances`,
`energy_transactions`, `generation_usage_logs`, plus the feedback/testimonial/waitlist tables.

**Existing column facts to build on (verified):**
- `brand_generations` = `id, user_id, input_data jsonb, output_data jsonb, created_at, favorite`.
  The full generated brand kit lives in `output_data` (JSON). **This is our memory source.**
- `creator_content` = `id, user_id, brand_id, content_type, title, content` (written by
  `/api/generate/creator`). ⚠️ **Precondition:** this table currently has **no migration in the
  repo** (it was created manually). Phase 3 depends on it — first add a proper idempotent
  migration that matches the live table (confirm columns in Supabase before writing it), so the
  schema is reproducible. Do not alter existing columns.

**Rules for all phases:**
- Migrations must be **idempotent and additive**: `add column if not exists`, `create index if
  not exists`, and `drop policy if exists` before `create policy`. Never `drop`/`alter` an
  existing column or table.
- **RLS on everything**: users may read only their own rows. No new table is world-readable.
- Do **not** modify `/api/stripe/*`, `/lib/energy*`, or the energy tables.
- Build small, typed, modular utilities. No new third-party services.

---

## PHASE 1 — BRAND MEMORY (brand-context injection)  ⭐ highest value, lowest risk

**Goal:** every piece of Creator Pro content is automatically consistent with the brand the user
already generated — without them re-entering anything. This is the "cofounder remembers you"
feeling, built entirely from data we already store.

**No schema change required.** `creator_content.brand_id` already links content to a brand, and
the brand's voice/colors/audience/values live in `brand_generations.output_data`.

### Build
1. `src/lib/brand-context.ts` — a server-only module:
   - `getBrandContext(brandId, userId): Promise<BrandContext | null>`
     - Loads the `brand_generations` row (RLS-scoped to the user), reads `output_data`.
     - Extracts a **compact** context object: brand name, tagline, voice/tone, target audience,
       brand values, color palette (names/hex), mood, and 2–3 favorite name picks if present.
   - `formatBrandContextForPrompt(ctx): string`
     - Renders a tight, token-budgeted block (aim < ~250 tokens). Truncate long fields.
     - Returns `""` when no context — never throw.
2. Wire into `/api/generate/creator/route.ts`:
   - When `brandId` is present, call `getBrandContext` and **prepend** the formatted block to the
     existing prompt (before the per-content-type schema). Keep current behavior when no brandId.
   - This is the only edit to that route. Do not change its energy or auth logic.

### Acceptance
- Generating content with a `brandId` visibly reflects that brand's voice/audience/colors.
- Generating with no `brandId` behaves exactly as today.
- A user can never load another user's brand context (RLS verified).

---

## PHASE 2 — WELCOME BACK (return experience)  — retention, read-only

**Goal:** when a user opens the dashboard, greet them with continuity: "Last time we worked on
**[Brand]** — want to keep building?" Builds the habit loop from the Magic Experience brief.

**No schema change required** — derive everything from existing rows.

### Build
1. `src/lib/recent-activity.ts` (server):
   - `getReturnSummary(userId)` → `{ lastBrand, lastBrandAt, recentContent[], totalPieces }`
     from the latest `brand_generations` and most recent `creator_content` (RLS-scoped).
   - Handle the **first-time / empty** case explicitly (`null` → show a fresh-start state, not a
     broken card).
2. Dashboard component `WelcomeBack.tsx`:
   - "Good morning, {firstName} 👋" + "Last time we worked on **{brand}**."
   - Quick-resume chips: continue that brand, or jump to a content type.
   - Use existing Nix poses (waving) and Framer Motion entrance; respect `prefers-reduced-motion`.
3. Optional, deferred: a `daily_activity` table later if we want true streaks — **not now**.
   (Streaks can be computed on the fly from `generation_usage_logs.created_at` when wanted.)

### Acceptance
- Returning user sees their real most-recent brand + a working resume action.
- Brand-new user sees a warm first-run state, no errors.
- All queries are read-only and RLS-scoped.

---

## PHASE 3 — LIBRARY SEARCH (find everything you've made)  — one additive migration

**Goal:** turn the pile of past outputs into a searchable "business library." Uses Postgres
full-text search built into Supabase — no external search service.

### Build
1. **Precondition:** ensure `creator_content` has a committed, idempotent migration (see §0).
2. Migration `supabase/migrations/<date>_library_search.sql` (idempotent):
   - Add a `tsvector` search column (generated/maintained) to `creator_content` over `title` +
     relevant text in `content`, and to `brand_generations` over the brand name/tagline/story in
     `output_data`.
   - Add **GIN indexes** on those tsvector columns.
   - Keep/confirm RLS so search only ever returns the user's own rows.
3. `src/app/api/library/search/route.ts`:
   - Auth-scoped query (`websearch_to_tsquery`) across `creator_content` (+ optionally
     `brand_generations`), returning typed results with type, title, snippet, date, brand_id.
   - Paginate; cap result size.
4. UI: a search field + results list in the dashboard/library view. Clicking a result opens that
   saved output. Reuse existing components/styling.

### Acceptance
- Searching returns matching past content, ranked, **only the user's own**.
- Empty/no-match state is friendly (Nix sleeping/empty-state pose).
- The migration re-runs cleanly (idempotent) and adds nothing destructive.

---

## OPTIONAL POLISH (cheap, additive — only after 1–3 land)
- `favorite boolean default false` on `creator_content` (mirror of `brand_generations.favorite`)
  → star any output. One additive column + a toggle.
- Run `supabase gen types` and commit generated DB types for full type-safety. No runtime risk.

## EXPLICITLY OUT OF SCOPE (do not build here)
- Image/video generation (needs async jobs + object storage + cost controls — separate project).
- New energy buckets / changes to deduction order (the live system stays as-is).
- Any `profiles`/`subscriptions` tables — we use `users`.

---

## BUILD ORDER
1. Phase 1 (Brand Memory) — ship and feel it; it's the biggest perceived upgrade.
2. Phase 2 (Welcome Back).
3. Phase 3 (Library Search) — do the `creator_content` migration precondition first.

Build, verify acceptance, and commit **each phase separately** before the next.
