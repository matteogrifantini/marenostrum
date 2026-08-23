create table public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  beach_slug text not null references public.beaches(slug) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, beach_slug)
);

create index user_favorites_user_created_idx
  on public.user_favorites (user_id, created_at desc);

alter table public.user_favorites enable row level security;

revoke all on table public.user_favorites from anon, authenticated, service_role;
grant select, insert, delete on table public.user_favorites to authenticated;
grant all on table public.user_favorites to service_role;

create policy "Users can read their own favorites"
  on public.user_favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own favorites"
  on public.user_favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own favorites"
  on public.user_favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
