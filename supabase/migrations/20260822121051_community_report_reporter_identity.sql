alter table public.community_reports
  add column reporter_id text
  check (reporter_id is null or reporter_id ~ '^[0-9a-f-]{36}$');

create unique index community_reports_reporter_identity_idx
  on public.community_reports (beach_id, category, detail, reporter_id)
  where reporter_id is not null;

revoke insert on table public.community_reports from anon, authenticated;

drop policy if exists "Reports can be added to published beaches"
  on public.community_reports;
