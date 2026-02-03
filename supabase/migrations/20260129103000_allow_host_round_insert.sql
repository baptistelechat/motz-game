-- Allow host to insert rounds
CREATE POLICY "Host can insert rounds"
ON public.rounds
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.games
    WHERE games.id = rounds.game_id
    AND games.host_id = auth.uid()
  )
);

-- Allow host to update rounds (for debug reroll or status updates)
CREATE POLICY "Host can update rounds"
ON public.rounds
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.games
    WHERE games.id = rounds.game_id
    AND games.host_id = auth.uid()
  )
);
