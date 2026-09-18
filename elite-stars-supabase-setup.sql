-- Elite Stars FC
-- One-time security tightening + seed existing squad.
-- Run this in Supabase SQL Editor.

-- Restrict player write access to the Elite Stars admin email.
drop policy if exists "Authenticated users can add players" on public.players;
drop policy if exists "Authenticated users can edit players" on public.players;
drop policy if exists "Authenticated users can delete players" on public.players;

create policy "Elite Stars admin can add players"
on public.players
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'jssarablow@gmail.com');

create policy "Elite Stars admin can edit players"
on public.players
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'jssarablow@gmail.com')
with check ((auth.jwt() ->> 'email') = 'jssarablow@gmail.com');

create policy "Elite Stars admin can delete players"
on public.players
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'jssarablow@gmail.com');

-- Seed the six players currently in player.json.
-- Run this section only once, before adding new players through Admin.
insert into public.players
  (id, name, position, number, photo, appearances, goals, assists)
values
  (1, 'Origi', 'Goalkeeper', 1, '', 12, 0, 0),
  (2, 'AuntyBoss', 'Defender', 2, '', 10, 1, 2),
  (3, 'Fred', 'Defender', 3, '', 11, 0, 1),
  (4, 'Phillip', 'Midfielder', 4, '', 12, 3, 4),
  (5, 'Evans', 'Midfielder', 5, '', 9, 2, 3),
  (6, 'Mose', 'Forward', 6, '', 12, 8, 2)
on conflict (id) do nothing;

-- Make the identity sequence continue after the seeded IDs.
select setval(
  pg_get_serial_sequence('public.players', 'id'),
  coalesce((select max(id) from public.players), 1),
  true
);
