-- Create round_status enum
CREATE TYPE public.round_status AS ENUM ('PLAYING', 'COMPLETED');

-- Create rounds table
CREATE TABLE public.rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    constraints JSONB NOT NULL,
    status public.round_status DEFAULT 'PLAYING'::public.round_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Enable Realtime
alter publication supabase_realtime add table public.rounds;

-- Policies

-- SELECT: Players can view rounds of their games
CREATE POLICY "Players can view rounds of their games"
    ON public.rounds
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.game_players gp
            WHERE gp.game_id = rounds.game_id
            AND gp.player_id = auth.uid()
        )
    );

-- INSERT: Only Postgres functions (or service role) should insert rounds normally, 
-- but for now we might want to allow it via RPC which runs as owner.
-- If we want to allow direct insert from client (unlikely for this logic), we'd add a policy.
-- Since logic is in RPC (Task 2), we might not need an INSERT policy for authenticated users 
-- unless the RPC runs with "security invoker".
-- The story says "RPC `start_new_round`", usually RPCs are "security definer" or "invoker".
-- If "security definer", it bypasses RLS.
-- If "security invoker", we need an INSERT policy if the user inserts directly, 
-- BUT the RPC will likely do the insert.
-- Let's leave INSERT policy restricted for now (default deny).
