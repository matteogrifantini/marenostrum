drop policy if exists "Verified parking for published beaches is readable"
  on public.parking_facilities;

create policy "Verified parking for published beaches is readable"
  on public.parking_facilities
  for select
  to anon, authenticated
  using (
    content_status = 'verified'
    and exists (
      select 1
      from public.beaches
      where beaches.id = parking_facilities.beach_id
        and beaches.is_published = true
    )
  );
