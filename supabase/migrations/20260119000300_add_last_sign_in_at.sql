-- Add last_sign_in_at to players to track actual activity
ALTER TABLE public.players 
ADD COLUMN last_sign_in_at TIMESTAMPTZ DEFAULT NOW();

-- Comment for clarity
COMMENT ON COLUMN public.players.last_sign_in_at IS 'Updated whenever the user loads the application/profile';
