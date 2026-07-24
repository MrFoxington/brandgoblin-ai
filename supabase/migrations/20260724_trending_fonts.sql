-- 🔥 Hot Right Now fonts — one AI-curated list cached per calendar month.
-- Written only by the server (service role); no client access needed.
create table if not exists trending_fonts (
  month_key  text primary key,          -- e.g. "2026-07"
  fonts      jsonb not null,            -- [{ family, category, reason }]
  created_at timestamptz not null default now()
);

alter table trending_fonts enable row level security;
-- No policies on purpose: only the service-role key (server) reads/writes.
