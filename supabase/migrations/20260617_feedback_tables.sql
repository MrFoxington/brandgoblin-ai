-- Brand feedback (rating + optional text)
create table if not exists brand_feedback (
  id uuid primary key default gen_random_uuid(),
  brand_generation_id uuid not null references brand_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check (rating in ('nailed_it', 'pretty_close', 'not_what_i_imagined')),
  feedback_text text,
  created_at timestamptz default now()
);
alter table brand_feedback enable row level security;
create policy "Users manage own feedback" on brand_feedback
  for all using (auth.uid() = user_id);

-- Business validation (would you build this?)
create table if not exists brand_validation (
  id uuid primary key default gen_random_uuid(),
  brand_generation_id uuid not null references brand_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  would_build text not null check (would_build in ('yes', 'maybe', 'no')),
  created_at timestamptz default now()
);
alter table brand_validation enable row level security;
create policy "Users manage own validation" on brand_validation
  for all using (auth.uid() = user_id);

-- Testimonials (nailed_it + yes → ask for testimonial)
create table if not exists brand_testimonials (
  id uuid primary key default gen_random_uuid(),
  brand_generation_id uuid not null references brand_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  testimonial_text text not null,
  created_at timestamptz default now()
);
alter table brand_testimonials enable row level security;
create policy "Users manage own testimonials" on brand_testimonials
  for all using (auth.uid() = user_id);

-- Analytics events
create table if not exists brand_analytics (
  id uuid primary key default gen_random_uuid(),
  brand_generation_id uuid references brand_generations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  created_at timestamptz default now()
);
alter table brand_analytics enable row level security;
create policy "Users manage own analytics" on brand_analytics
  for all using (auth.uid() = user_id);
