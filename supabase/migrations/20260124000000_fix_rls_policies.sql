-- Ensure games are viewable by everyone (including authenticated users who are not host)
DROP POLICY IF EXISTS "Public can view games" ON public.games;
CREATE POLICY "Public can view games"
    ON public.games
    FOR SELECT
    TO public
    USING (true);

-- Ensure authenticated users can specifically view games (redundant but safe)
DROP POLICY IF EXISTS "Authenticated users can view games" ON public.games;
CREATE POLICY "Authenticated users can view games"
    ON public.games
    FOR SELECT
    TO authenticated
    USING (true);
