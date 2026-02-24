
-- Drop the restrictive policy
DROP POLICY "View active kick sessions" ON public.kick_sessions;

-- Create a more permissive policy that allows viewing completed/rejected sessions
-- This ensures Realtime sends UPDATE events when status changes from 'active' to 'completed'
-- We allow seeing all kick sessions for simplicity and reliability of Realtime events
CREATE POLICY "View all kick sessions"
    ON public.kick_sessions FOR SELECT
    TO authenticated
    USING (true);
