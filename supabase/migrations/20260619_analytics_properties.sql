-- 📊 Instrumentation: add properties column to brand_analytics
-- Run in Supabase SQL Editor

alter table public.brand_analytics
  add column if not exists properties jsonb default '{}';

-- Index for querying by event type + time
create index if not exists brand_analytics_event_created
  on public.brand_analytics (event_type, created_at desc);

-- Index for per-user session queries (D1/D7 return)
create index if not exists brand_analytics_user_created
  on public.brand_analytics (user_id, created_at desc);
