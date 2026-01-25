-- Create game_players table
CREATE TABLE IF NOT EXISTS public.game_players (
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    is_ready BOOLEAN DEFAULT false NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (game_id, player_id)
);

ALTER TABLE public.game_players REPLICA IDENTITY FULL;

-- Enable Realtime
alter publication supabase_realtime add table public.game_players;

ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Create policies

-- SELECT: Public can view players in a game (to see who is in the lobby)
CREATE POLICY "Public can view game players"
    ON public.game_players
    FOR SELECT
    TO public
    USING (true);

-- INSERT: Authenticated users can join games (insert themselves)
CREATE POLICY "Authenticated users can join games"
    ON public.game_players
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- UPDATE: Authenticated users can update their own status (e.g. is_ready)
CREATE POLICY "Users can update their own status"
    ON public.game_players
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

-- DELETE: Authenticated users can leave games (delete themselves)
CREATE POLICY "Users can leave games"
    ON public.game_players
    FOR DELETE
    TO authenticated
    USING (auth.uid() = player_id);
