create index parking_facilities_source_idx
  on public.parking_facilities (source_id);

create index media_items_source_idx
  on public.media_items (source_id);

create index webcams_source_idx
  on public.webcams (source_id);

create policy "Refresh runs are server-only"
  on public.content_refresh_runs
  for all
  to anon, authenticated
  using (false)
  with check (false);
