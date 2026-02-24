
-- Update constraint to allow 'archived' status
ALTER TABLE public.kick_sessions
DROP CONSTRAINT kick_sessions_status_check;

ALTER TABLE public.kick_sessions
ADD CONSTRAINT kick_sessions_status_check
CHECK (status IN ('active', 'completed', 'expired', 'rejected', 'archived'));
