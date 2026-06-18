-- BrandGoblin AI — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- users
-- Mirrors auth.users with app-specific fields (credits, plan).
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  credits integer not null default 3,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  stripe_customer_id text
);

alter table public.users enable row level security;

create policy "Users can view their own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own row"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create a `public.users` row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, credits, plan)
  values (new.id, new.email, 3, 'free');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- brand_generations
-- One row per AI-generated brand kit.
-- ============================================================
create table if not exists public.brand_generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  input_data jsonb not null,
  output_data jsonb not null,
  created_at timestamptz not null default now(),
  favorite boolean not null default false
);

create index if not exists brand_generations_user_id_idx
  on public.brand_generations (user_id, created_at desc);

alter table public.brand_generations enable row level security;

create policy "Users can view their own generations"
  on public.brand_generations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on public.brand_generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generations"
  on public.brand_generations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own generations"
  on public.brand_generations for delete
  using (auth.uid() = user_id);
