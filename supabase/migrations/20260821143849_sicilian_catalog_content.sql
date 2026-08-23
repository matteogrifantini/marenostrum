alter table public.beaches
  add column if not exists region_slug text not null default 'sicilia',
  add column if not exists province_code text,
  add column if not exists publication_status text not null default 'draft',
  add column if not exists last_verified_at timestamptz,
  add column if not exists next_review_at timestamptz;
update public.beaches
set
  region_slug = coalesce(nullif(region_slug, ''), 'sicilia'),
  province_code = case
    when municipality in ('Noto', 'Avola') then 'SR'
    else province_code
  end,
  publication_status = case when is_published then 'verified' else 'draft' end,
  last_verified_at = coalesce(last_verified_at, updated_at),
  next_review_at = coalesce(next_review_at, updated_at + interval '90 days');
alter table public.beaches
  add constraint beaches_region_slug_check
    check (region_slug = 'sicilia'),
  add constraint beaches_province_code_check
    check (province_code is null or province_code in ('AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP')),
  add constraint beaches_publication_status_check
    check (publication_status in ('draft', 'verified', 'stale', 'archived'));
create index beaches_publication_status_idx
  on public.beaches (publication_status, province_code);
create table public.beach_sources (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  source_name text not null check (char_length(trim(source_name)) > 0),
  source_type text not null check (char_length(trim(source_type)) > 0),
  source_url text not null check (source_url ~ '^https?://[^[:space:]]+$'),
  is_primary boolean not null default false,
  source_hash text,
  checked_at timestamptz not null default now(),
  next_check_at timestamptz not null default (now() + interval '30 days'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (beach_id, source_url)
);
create unique index beach_sources_one_primary_idx
  on public.beach_sources (beach_id)
  where is_primary;
create index beach_sources_next_check_idx
  on public.beach_sources (next_check_at);
create table public.parking_facilities (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  source_id uuid references public.beach_sources(id) on delete restrict,
  name text not null check (char_length(trim(name)) > 0),
  facility_type text not null check (char_length(trim(facility_type)) > 0),
  latitude numeric(9, 6) check (latitude is null or latitude between 35 and 39),
  longitude numeric(9, 6) check (longitude is null or longitude between 11 and 16),
  pricing_note text,
  access_note text,
  official_url text check (official_url is null or official_url ~ '^https?://[^[:space:]]+$'),
  content_status text not null default 'draft'
    check (content_status in ('draft', 'verified', 'stale', 'archived')),
  checked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);
create index parking_facilities_beach_status_expiry_idx
  on public.parking_facilities (beach_id, content_status, expires_at);
create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  source_id uuid references public.beach_sources(id) on delete restrict,
  kind text not null check (kind in ('photo', 'video', 'embed')),
  provider text not null check (char_length(trim(provider)) > 0),
  provider_item_id text,
  source_url text not null check (source_url ~ '^https?://[^[:space:]]+$'),
  media_url text,
  storage_path text,
  thumbnail_url text,
  credit text,
  license text,
  captured_at timestamptz,
  verified_at timestamptz,
  expires_at timestamptz,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'verified', 'stale', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (media_url is not null or storage_path is not null or kind = 'embed')
);
create unique index media_items_provider_item_idx
  on public.media_items (provider, provider_item_id)
  where provider_item_id is not null;
create index media_items_beach_status_expiry_idx
  on public.media_items (beach_id, publication_status, expires_at);
create table public.webcams (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  source_id uuid references public.beach_sources(id) on delete restrict,
  name text not null check (char_length(trim(name)) > 0),
  provider text not null check (char_length(trim(provider)) > 0),
  page_url text not null check (page_url ~ '^https?://[^[:space:]]+$'),
  snapshot_url text check (snapshot_url is null or snapshot_url ~ '^https?://[^[:space:]]+$'),
  stream_url text check (stream_url is null or stream_url ~ '^https?://[^[:space:]]+$'),
  latitude numeric(9, 6) check (latitude is null or latitude between 35 and 39),
  longitude numeric(9, 6) check (longitude is null or longitude between 11 and 16),
  status text not null default 'unknown' check (status in ('online', 'offline', 'unknown', 'stale')),
  content_status text not null default 'draft'
    check (content_status in ('draft', 'verified', 'stale', 'archived')),
  last_checked_at timestamptz,
  next_check_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);
create unique index webcams_provider_page_idx
  on public.webcams (beach_id, provider, page_url);
create index webcams_beach_status_check_idx
  on public.webcams (beach_id, content_status, next_check_at);
create table public.review_profiles (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  provider text not null check (char_length(trim(provider)) > 0),
  place_id text,
  maps_url text not null check (maps_url ~ '^https?://[^[:space:]]+$'),
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'verified', 'stale', 'archived')),
  checked_at timestamptz,
  next_check_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (place_id is not null or maps_url is not null)
);
create unique index review_profiles_provider_place_idx
  on public.review_profiles (provider, place_id)
  where place_id is not null;
create unique index review_profiles_beach_provider_idx
  on public.review_profiles (beach_id, provider);
create table public.content_refresh_runs (
  id uuid primary key default gen_random_uuid(),
  source_kind text not null check (char_length(trim(source_kind)) > 0),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'succeeded', 'partial', 'failed')),
  input_count integer not null default 0 check (input_count >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  error_summary text check (error_summary is null or char_length(error_summary) <= 500),
  created_at timestamptz not null default now()
);
create index content_refresh_runs_source_started_idx
  on public.content_refresh_runs (source_kind, started_at desc);
alter table public.beach_sources enable row level security;
alter table public.parking_facilities enable row level security;
alter table public.media_items enable row level security;
alter table public.webcams enable row level security;
alter table public.review_profiles enable row level security;
alter table public.content_refresh_runs enable row level security;
revoke all on table public.beach_sources, public.parking_facilities, public.media_items,
  public.webcams, public.review_profiles, public.content_refresh_runs
  from anon, authenticated, service_role;
grant select on table public.beach_sources, public.parking_facilities, public.media_items,
  public.webcams, public.review_profiles to anon, authenticated;
grant all on table public.beach_sources, public.parking_facilities, public.media_items,
  public.webcams, public.review_profiles, public.content_refresh_runs to service_role;
create policy "Sources for published beaches are readable"
  on public.beach_sources
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.beaches
      where beaches.id = beach_sources.beach_id
        and beaches.is_published = true
    )
  );
create policy "Verified parking for published beaches is readable"
  on public.parking_facilities
  for select
  to anon, authenticated
  using (
    content_status in ('verified', 'stale')
    and exists (
      select 1
      from public.beaches
      where beaches.id = parking_facilities.beach_id
        and beaches.is_published = true
    )
  );
create policy "Published media is readable"
  on public.media_items
  for select
  to anon, authenticated
  using (
    publication_status in ('verified', 'stale')
    and exists (
      select 1
      from public.beaches
      where beaches.id = media_items.beach_id
        and beaches.is_published = true
    )
  );
create policy "Published webcams are readable"
  on public.webcams
  for select
  to anon, authenticated
  using (
    content_status in ('verified', 'stale')
    and exists (
      select 1
      from public.beaches
      where beaches.id = webcams.beach_id
        and beaches.is_published = true
    )
  );
create policy "Published review profiles are readable"
  on public.review_profiles
  for select
  to anon, authenticated
  using (
    verification_status in ('verified', 'stale')
    and exists (
      select 1
      from public.beaches
      where beaches.id = review_profiles.beach_id
        and beaches.is_published = true
    )
  );
