-- Create table public.players
create table if not exists public.players (
  id uuid references auth.users not null primary key,
  pseudo text not null,
  avatar_config jsonb not null default '{}'::jsonb,
  last_seen timestamptz not null default now()
);

-- Enable RLS
alter table public.players enable row level security;

-- Policies

-- 1. Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone"
  on public.players for select
  using ( true );

-- 2. Users can insert their own profile
create policy "Users can insert their own profile"
  on public.players for insert
  with check ( auth.uid() = id );

-- 3. Users can update their own profile
create policy "Users can update their own profile"
  on public.players for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );
