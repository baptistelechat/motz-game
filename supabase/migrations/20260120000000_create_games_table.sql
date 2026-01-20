-- Create game_status enum
CREATE TYPE public.game_status AS ENUM ('LOBBY', 'PLAYING', 'FINISHED');

-- Create games table
CREATE TABLE public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    host_id UUID NOT NULL REFERENCES auth.users(id),
    status public.game_status DEFAULT 'LOBBY'::public.game_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies
-- INSERT: Authenticated users can create games
CREATE POLICY "Authenticated users can create games"
    ON public.games
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = host_id);

-- SELECT: Public can view games
CREATE POLICY "Public can view games"
    ON public.games
    FOR SELECT
    TO public
    USING (true);

-- UPDATE: Host only
CREATE POLICY "Hosts can update their games"
    ON public.games
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);
