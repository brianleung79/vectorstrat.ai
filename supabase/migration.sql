-- KBIACal tables for Supabase
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Families table: stores each user's children configuration
create table families (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  children jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id)
);

-- Schedules table: stores full schedule + waitlist blob per user
-- Format matches the scheduler's in-memory structure:
--   schedule: { "childname": { "5": ["classId1", ...], "6": [...], ... }, ... }
--   waitlist:  { "childname": { "5": ["classId1", ...], ... }, ... }
create table schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  schedule jsonb not null default '{}'::jsonb,
  waitlist jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id)
);

-- Row-Level Security: users can only access their own data
alter table families enable row level security;
alter table schedules enable row level security;

create policy "Users can read own family"
  on families for select
  using (auth.uid() = user_id);

create policy "Users can insert own family"
  on families for insert
  with check (auth.uid() = user_id);

create policy "Users can update own family"
  on families for update
  using (auth.uid() = user_id);

create policy "Users can delete own family"
  on families for delete
  using (auth.uid() = user_id);

create policy "Users can read own schedules"
  on schedules for select
  using (auth.uid() = user_id);

create policy "Users can insert own schedules"
  on schedules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own schedules"
  on schedules for update
  using (auth.uid() = user_id);

create policy "Users can delete own schedules"
  on schedules for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger families_updated_at
  before update on families
  for each row execute function update_updated_at();

create trigger schedules_updated_at
  before update on schedules
  for each row execute function update_updated_at();
