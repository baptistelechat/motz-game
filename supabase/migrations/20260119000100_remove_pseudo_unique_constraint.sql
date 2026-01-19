-- Remove unique constraint on pseudo because players are identified by UUID
-- and duplicates are allowed (like display names)
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_pseudo_key;
