-- Rate-limit table for the no-auth landing page teaser endpoint
create table if not exists public.teaser_requests (
  id         uuid        default gen_random_uuid() primary key,
  ip_hash    text        not null,
  created_at timestamptz not null default now()
);

create index if not exists teaser_requests_ip_hash_created_idx
  on public.teaser_requests (ip_hash, created_at);
