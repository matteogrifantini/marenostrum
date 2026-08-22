drop policy if exists "Published review profiles are readable" on public.review_profiles;

create policy "Published review profiles are readable"
  on public.review_profiles
  for select
  to anon, authenticated
  using (
    verification_status in ('draft', 'verified', 'stale')
    and exists (
      select 1
      from public.beaches
      where beaches.id = review_profiles.beach_id
        and beaches.is_published = true
    )
  );
