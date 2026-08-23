create table public.beach_catalog_candidates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(trim(name)) > 0),
  region text not null check (region = 'Sicilia'),
  province text not null check (province in ('AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP')),
  municipality text not null check (char_length(trim(municipality)) > 0),
  coast text not null check (char_length(trim(coast)) > 0),
  latitude numeric(9, 6) check (latitude is null or latitude between 35 and 39),
  longitude numeric(9, 6) check (longitude is null or longitude between 11 and 16),
  access_level text check (access_level is null or access_level in ('facile', 'moderato', 'difficile')),
  source_url text not null check (char_length(trim(source_url)) > 0),
  source_name text not null check (char_length(trim(source_name)) > 0),
  source_type text not null check (char_length(trim(source_type)) > 0),
  verified_at timestamptz not null default now(),
  next_review_at timestamptz not null default (now() + interval '30 days'),
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'verified', 'stale', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  ),
  check (
    publication_status <> 'verified'
    or (latitude is not null and longitude is not null and access_level is not null)
  )
);
create index beach_catalog_candidates_status_idx
  on public.beach_catalog_candidates (publication_status, province);
alter table public.beach_catalog_candidates enable row level security;
revoke all on table public.beach_catalog_candidates from anon, authenticated;
grant all on table public.beach_catalog_candidates to service_role;
