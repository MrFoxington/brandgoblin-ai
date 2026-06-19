-- ⚡ Idempotency backstop for energy refill purchases
-- The application checks energy_transactions for an existing stripe_payment_id
-- before granting a refill, but two webhook redeliveries arriving at the same
-- instant could both pass that check. This partial unique index makes the
-- database itself reject a duplicate, so a single payment can never be granted
-- twice no matter the timing.

create unique index if not exists energy_transactions_stripe_payment_id_key
  on public.energy_transactions (stripe_payment_id)
  where stripe_payment_id is not null;
