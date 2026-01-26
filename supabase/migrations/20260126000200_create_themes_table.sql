-- Create themes table
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'fr',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(label, locale)
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Themes are viewable by everyone" 
ON public.themes FOR SELECT 
USING (true);

-- Seed data
INSERT INTO public.themes (label) VALUES
    ('Animaux'),
    ('Pays'),
    ('Villes'),
    ('Métiers'),
    ('Prénoms'),
    ('Marques'),
    ('Fruits & Légumes'),
    ('Objets'),
    ('Sports'),
    ('Célébrités'),
    ('Aliments'),
    ('Corps humain'),
    ('Vêtements'),
    ('Personnages fictifs'),
    ('Titre de film'),
    ('Instruments de musique');
