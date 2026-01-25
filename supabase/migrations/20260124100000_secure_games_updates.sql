-- Secure games table updates
-- Revoke generic UPDATE permission and grant only on specific columns
-- This ensures that even the Host cannot change critical fields like 'id', 'code', 'host_id', 'created_at'

REVOKE UPDATE ON public.games FROM authenticated;
GRANT UPDATE (status, started_at) ON public.games TO authenticated;

-- Note: The existing RLS policy "Hosts can update their games" still applies,
-- ensuring that only the host (auth.uid() = host_id) can perform these updates.