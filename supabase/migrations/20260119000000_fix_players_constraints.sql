-- Fix constraints for players table

-- 1. Ensure pseudo is unique
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'players_pseudo_key'
    ) THEN
        ALTER TABLE public.players ADD CONSTRAINT players_pseudo_key UNIQUE (pseudo);
    END IF;
END $$;

-- 2. Ensure avatar_config has required keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'players_avatar_config_check'
    ) THEN
        ALTER TABLE public.players ADD CONSTRAINT players_avatar_config_check CHECK (
            avatar_config ? 'animal' AND avatar_config ? 'color'
        );
    END IF;
END $$;
