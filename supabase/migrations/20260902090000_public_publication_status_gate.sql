drop policy if exists "Published beaches are readable" on public.beaches;
create policy "Published beaches are readable"
  on public.beaches for select to anon, authenticated
  using (is_published = true and publication_status in ('verified', 'stale'));

drop policy if exists "Conditions for published beaches are readable" on public.beach_conditions;
create policy "Conditions for published beaches are readable"
  on public.beach_conditions for select to anon, authenticated
  using (
    exists (
      select 1 from public.beaches
      where beaches.id = beach_conditions.beach_id
        and beaches.is_published = true
        and beaches.publication_status in ('verified', 'stale')
    )
  );
