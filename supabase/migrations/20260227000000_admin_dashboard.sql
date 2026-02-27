-- Migration: 20260227000000_admin_dashboard.sql

-- 1. Create app_role enum and add role to players
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS role app_role NOT NULL DEFAULT 'user';

-- 2. Create custom_dictionary table
CREATE TABLE IF NOT EXISTS public.custom_dictionary (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    word text NOT NULL UNIQUE,
    action text NOT NULL CHECK (action IN ('allow', 'block')),
    created_by uuid REFERENCES public.players(id),
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.custom_dictionary ENABLE ROW LEVEL SECURITY;

-- 3. Policies for custom_dictionary

-- Allow admins to do everything
CREATE POLICY "Admins full access on custom_dictionary"
    ON public.custom_dictionary
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow everyone to read allowed words (for dictionary validation)
CREATE POLICY "Public read allowed words"
    ON public.custom_dictionary
    FOR SELECT
    TO authenticated
    USING (action = 'allow');

-- 4. Update policies for player_reports (Admins can view all)

CREATE POLICY "Admins view all player_reports"
    ON public.player_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Update policies for word_reports (Admins can view all)

CREATE POLICY "Admins view all word_reports"
    ON public.word_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Policies for kick_sessions (Admins can view all)
CREATE POLICY "Admins view all kick_sessions"
    ON public.kick_sessions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Add status column to reports and allow updates for admins

ALTER TABLE public.player_reports 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored'));

ALTER TABLE public.word_reports 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored'));

-- Update policies for player_reports
CREATE POLICY "Admins update player_reports"
    ON public.player_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Update policies for word_reports
CREATE POLICY "Admins update word_reports"
    ON public.word_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
