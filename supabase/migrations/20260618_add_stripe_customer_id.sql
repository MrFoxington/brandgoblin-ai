-- ============================================================
-- Add Stripe customer linkage to users
-- ============================================================
-- The Stripe webhook (/api/stripe/webhook) stores the Stripe customer ID on
-- checkout.session.completed and looks users up by it on subscription
-- updated/deleted events. Without this column, a successful payment cannot be
-- written back to the user row — the customer would pay but stay on the free
-- plan. This migration adds the column and an index for the webhook lookup.

alter table public.users
  add column if not exists stripe_customer_id text;

create unique index if not exists users_stripe_customer_id_key
  on public.users (stripe_customer_id)
  where stripe_customer_id is not null;
