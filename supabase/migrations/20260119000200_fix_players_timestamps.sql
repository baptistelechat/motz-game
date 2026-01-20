-- 1. Add created_at column
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now() NOT NULL;

-- 2. Rename last_seen to updated_at
-- This reflects that the field tracks profile updates, not necessarily presence
ALTER TABLE public.players 
RENAME COLUMN last_seen TO updated_at;
