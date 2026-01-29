-- Create submissions table
CREATE TABLE public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    points_details JSONB, -- Breakdown of score (letters, speed, etc.)
    is_valid BOOLEAN NOT NULL DEFAULT false,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX submissions_game_id_idx ON public.submissions(game_id);
CREATE INDEX submissions_round_id_idx ON public.submissions(round_id);
CREATE INDEX submissions_player_id_idx ON public.submissions(player_id);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Enable Realtime
alter publication supabase_realtime add table public.submissions;

-- Policies

-- SELECT: Players can view all submissions of their games
CREATE POLICY "Players can view submissions of their games"
    ON public.submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.game_players gp
            WHERE gp.game_id = submissions.game_id
            AND gp.player_id = auth.uid()
        )
    );
