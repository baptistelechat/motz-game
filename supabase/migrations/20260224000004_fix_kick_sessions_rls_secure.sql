-- Fix RLS policy for kick_sessions to be more secure
-- Replaces the loose "View all" policy with one restricted to game participants

DROP POLICY "View all kick sessions" ON public.kick_sessions;

CREATE POLICY "View game kick sessions"
    ON public.kick_sessions FOR SELECT
    TO authenticated
    USING (
      auth.uid() = target_id OR 
      auth.uid() = initiator_id OR
      EXISTS (
        SELECT 1 FROM public.game_players gp
        WHERE gp.game_id = kick_sessions.game_id
        AND gp.player_id = auth.uid()
      )
    );
