create policy "Hosts can update submissions of their games"
on submissions
for update
to authenticated
using (
  exists (
    select 1 from games
    where games.id = submissions.game_id
    and games.host_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from games
    where games.id = submissions.game_id
    and games.host_id = auth.uid()
  )
);
