-- Migration de nettoyage suite au passage à la validation sociale
-- Supprime les anciennes tables et RPCs liées à la gestion des thèmes côté BDD

-- 1. Supprimer les tables inutiles
DROP TABLE IF EXISTS public.theme_words;
DROP TABLE IF EXISTS public.themes;

-- 2. Supprimer les fonctions RPC obsolètes (la logique est maintenant en TypeScript côté serveur)
DROP FUNCTION IF EXISTS public.start_new_round(UUID);
DROP FUNCTION IF EXISTS public.generate_round_constraints();
DROP FUNCTION IF EXISTS public.validate_theme(TEXT, TEXT);
