-- players
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.players;
CREATE POLICY "Users can insert their own profile" ON public.players FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.players;
CREATE POLICY "Users can update their own profile" ON public.players FOR UPDATE USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- games
DROP POLICY IF EXISTS "Authenticated users can create games" ON public.games;
CREATE POLICY "Authenticated users can create games" ON public.games FOR INSERT WITH CHECK ((select auth.uid()) = host_id);

DROP POLICY IF EXISTS "Hosts can update their games" ON public.games;
CREATE POLICY "Hosts can update their games" ON public.games FOR UPDATE USING ((select auth.uid()) = host_id) WITH CHECK ((select auth.uid()) = host_id);

-- game_players
DROP POLICY IF EXISTS "Authenticated users can join games" ON public.game_players;
CREATE POLICY "Authenticated users can join games" ON public.game_players FOR INSERT WITH CHECK ((select auth.uid()) = player_id);

DROP POLICY IF EXISTS "Users can update their own status" ON public.game_players;
CREATE POLICY "Users can update their own status" ON public.game_players FOR UPDATE USING ((select auth.uid()) = player_id) WITH CHECK ((select auth.uid()) = player_id);

DROP POLICY IF EXISTS "Users can leave games" ON public.game_players;
CREATE POLICY "Users can leave games" ON public.game_players FOR DELETE USING ((select auth.uid()) = player_id);
