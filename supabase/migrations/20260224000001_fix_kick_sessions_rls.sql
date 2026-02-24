-- Add missing INSERT policy for kick_sessions
create policy "Enable insert for initiator"
    on public.kick_sessions for insert
    to authenticated
    with check (auth.uid() = initiator_id);
