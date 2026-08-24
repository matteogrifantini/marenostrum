create table public.beach_reviews (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index beach_reviews_beach_user_idx
  on public.beach_reviews (beach_id, user_id);

create index beach_reviews_beach_created_idx
  on public.beach_reviews (beach_id, created_at desc);

alter table public.beach_reviews enable row level security;

revoke all on table public.beach_reviews from anon, authenticated, service_role;
grant select on table public.beach_reviews to anon, authenticated;
grant select, insert, update, delete on table public.beach_reviews to authenticated;
grant all on table public.beach_reviews to service_role;

create policy "Published beach reviews are readable"
  on public.beach_reviews
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.beaches
      where beaches.id = beach_reviews.beach_id
        and beaches.is_published = true
    )
  );

create policy "Users can create their own beach reviews"
  on public.beach_reviews
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beaches
      where beaches.id = beach_reviews.beach_id
        and beaches.is_published = true
    )
  );

create policy "Users can update their own beach reviews"
  on public.beach_reviews
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beaches
      where beaches.id = beach_reviews.beach_id
        and beaches.is_published = true
    )
  );

create policy "Users can delete their own beach reviews"
  on public.beach_reviews
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
