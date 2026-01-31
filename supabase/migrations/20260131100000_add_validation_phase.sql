-- Add VALIDATING to round_status enum
ALTER TYPE "public"."round_status" ADD VALUE 'VALIDATING';

-- Add votes column to submissions
ALTER TABLE "public"."submissions" 
ADD COLUMN "votes" text[] DEFAULT ARRAY[]::text[];

-- Add rejected status column to submissions (or use is_valid logic, but explicitly tracking rejection is better)
-- Actually, the story says "Score = 0, statut = 'rejected'". 
-- Existing is_valid is boolean. 
-- Let's add a rejection_reason enum or text? 
-- Existing: rejection_reason text.
-- Let's rely on is_valid = false and rejection_reason = 'social_consensus'.
