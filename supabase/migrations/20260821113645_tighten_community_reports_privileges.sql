revoke all on table public.community_reports from anon, authenticated, service_role;

grant select, insert on table public.community_reports to anon, authenticated, service_role;;
