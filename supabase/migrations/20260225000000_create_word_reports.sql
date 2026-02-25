-- Migration: 20260225000000_create_word_reports.sql

create table public.word_reports (
    id uuid default gen_random_uuid() primary key,
    game_id uuid not null references public.games(id) on delete cascade,
    round_id uuid not null references public.rounds(id) on delete cascade,
    reporter_id uuid not null references public.players(id) on delete cascade,
    reported_word text not null,
    reason text default 'offensive' not null,
    created_at timestamptz default now() not null
);

alter table public.word_reports enable row level security;

-- Policies
create policy "Enable insert for authenticated users"
    on public.word_reports for insert
    to authenticated
    with check (auth.uid() = reporter_id);

create policy "Enable select for admins"
    on public.word_reports for select
    to service_role
    using (true);

-- Indexes
create index idx_word_reports_game_id on public.word_reports(game_id);
create index idx_word_reports_round_id on public.word_reports(round_id);
create index idx_word_reports_reporter_id on public.word_reports(reporter_id);
