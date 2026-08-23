create table public.community_reports (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  category text not null check (category in ('parking', 'crowding', 'water', 'wind', 'services')),
  detail text not null check (char_length(detail) <= 280),
  created_at timestamptz not null default now()
);

create index community_reports_beach_created_idx
  on public.community_reports (beach_id, created_at desc);

alter table public.community_reports enable row level security;

grant select, insert on table public.community_reports to anon, authenticated;
grant select, insert on table public.community_reports to service_role;
revoke update, delete on table public.community_reports from anon, authenticated;

create policy "Published beach reports are readable"
  on public.community_reports
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.beaches
      where beaches.id = community_reports.beach_id
        and beaches.is_published = true
    )
  );

create policy "Reports can be added to published beaches"
  on public.community_reports
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.beaches
      where beaches.id = community_reports.beach_id
        and beaches.is_published = true
    )
  );;
