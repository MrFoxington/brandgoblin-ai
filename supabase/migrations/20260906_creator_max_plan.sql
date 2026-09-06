-- Creator Max plan (Sept 6, 2026) — Brand Maturity P6.
-- users.plan gains the value 'max'. The original schema declared an inline
-- CHECK (plan in ('free','pro','agency')) which would reject 'max' at the
-- webhook and silently break the first real Max purchase. Drop whichever
-- check constraint currently guards users.plan (name may differ from schema.sql)
-- and re-add it with 'max' included.
--
-- ⚠️ RUN THIS IN THE SUPABASE SQL EDITOR *BEFORE* DEPLOYING THE MAX CODE.

do $$
declare r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%plan%'
  loop
    execute format('alter table public.users drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.users
  add constraint users_plan_check check (plan in ('free', 'pro', 'max', 'agency'));

-- Sanity: should list exactly one row.
-- select conname, pg_get_constraintdef(oid) from pg_constraint
--  where conrelid = 'public.users'::regclass and conname = 'users_plan_check';
