-- Ensure authenticated users can view game_players (redundant but safe)
DROP POLICY IF EXISTS "Authenticated users can view game_players" ON public.game_players;
CREATE POLICY "Authenticated users can view game_players"
    ON public.game_players
    FOR SELECT
    TO authenticated
    USING (true);

-- Ensure authenticated users can view players (redundant but safe)
DROP POLICY IF EXISTS "Authenticated users can view players" ON public.players;
CREATE POLICY "Authenticated users can view players"
    ON public.players
    FOR SELECT
    TO authenticated
    USING (true);
