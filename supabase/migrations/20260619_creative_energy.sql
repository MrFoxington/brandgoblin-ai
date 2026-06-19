-- ⚡ Creative Energy System
-- Run this in Supabase SQL Editor or via: supabase db push

-- ── 1. user_energy_balances ───────────────────────────────────────────────
create table if not exists public.user_energy_balances (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  plan                      text not null default 'free',
  monthly_energy_total      integer not null default 0,
  monthly_energy_remaining  integer not null default 0,
  refill_energy_total       integer not null default 0,
  refill_energy_remaining   integer not null default 0,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique(user_id)
);

-- ── 2. energy_transactions ────────────────────────────────────────────────
create table if not exists public.energy_transactions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  transaction_type      text not null,
  -- Types: monthly_grant | usage | refill_purchase | refund | admin_adjustment | reset
  amount                integer not null, -- positive = added, negative = deducted
  balance_after         integer not null,
  description           text,
  related_generation_id uuid,
  stripe_payment_id     text,
  created_at            timestamptz not null default now()
);

-- ── 3. generation_usage_logs ──────────────────────────────────────────────
create table if not exists public.generation_usage_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  brand_id         uuid,
  content_type     text not null,
  energy_cost      integer not null,
  model_used       text,
  prompt_tokens    integer,
  completion_tokens integer,
  image_count      integer,
  status           text not null default 'success',
  -- Statuses: success | failed | refunded
  created_at       timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────
create index if not exists idx_energy_transactions_user_id
  on public.energy_transactions(user_id);
create index if not exists idx_energy_transactions_created_at
  on public.energy_transactions(created_at desc);
create index if not exists idx_generation_usage_logs_user_id
  on public.generation_usage_logs(user_id);
create index if not exists idx_generation_usage_logs_content_type
  on public.generation_usage_logs(content_type);

-- ── Auto-update updated_at ────────────────────────────────────────────────
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_user_energy_balances_updated_at on public.user_energy_balances;
create trigger update_user_energy_balances_updated_at
  before update on public.user_energy_balances
  for each row execute function public.update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────────────────
alter table public.user_energy_balances enable row level security;
alter table public.energy_transactions enable row level security;
alter table public.generation_usage_logs enable row level security;

-- Users can only read their own data; only server (service role) can write
create policy "users_read_own_energy"
  on public.user_energy_balances for select
  using (auth.uid() = user_id);

create policy "users_read_own_transactions"
  on public.energy_transactions for select
  using (auth.uid() = user_id);

create policy "users_read_own_usage_logs"
  on public.generation_usage_logs for select
  using (auth.uid() = user_id);
