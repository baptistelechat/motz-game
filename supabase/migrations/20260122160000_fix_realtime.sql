DO $$
BEGIN
  -- Check and add games
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'games') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
  END IF;
  
  -- Check and add game_players
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'game_players') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
  END IF;
END
$$;

-- Set REPLICA IDENTITY FULL for games
ALTER TABLE public.games REPLICA IDENTITY FULL;
