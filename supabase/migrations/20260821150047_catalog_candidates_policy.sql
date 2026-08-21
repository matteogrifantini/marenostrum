create policy "Catalog candidates are server-only"
  on public.beach_catalog_candidates
  for all
  to anon, authenticated
  using (false)
  with check (false);
