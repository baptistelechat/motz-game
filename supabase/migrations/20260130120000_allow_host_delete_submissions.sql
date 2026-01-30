CREATE POLICY "Hosts can delete submissions of their games"
ON public.submissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.games
    WHERE games.id = submissions.game_id
    AND games.host_id = auth.uid()
  )
);
