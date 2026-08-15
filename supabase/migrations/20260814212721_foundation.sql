create extension if not exists postgis with schema extensions;

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  url text not null,
  quality text not null check (quality in ('high', 'medium', 'low')),
  is_public boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.beaches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  municipality text not null,
  coast text not null,
  description text not null,
  orientation_degrees numeric(5, 2) not null check (orientation_degrees >= 0 and orientation_degrees < 360),
  shelter text[] not null default '{}',
  tags text[] not null default '{}',
  access_level text not null check (access_level in ('facile', 'moderato', 'difficile')),
  latitude numeric(9, 6) not null check (latitude between 35 and 39),
  longitude numeric(9, 6) not null check (longitude between 11 and 16),
  location extensions.geography(Point, 4326),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.beach_conditions (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid not null references public.beaches(id) on delete cascade,
  source_id uuid not null references public.data_sources(id) on delete restrict,
  observed_at timestamptz not null,
  wind_direction_degrees numeric(5, 2) not null check (wind_direction_degrees >= 0 and wind_direction_degrees < 360),
  wind_speed_kmh numeric(6, 2) not null check (wind_speed_kmh >= 0),
  gust_speed_kmh numeric(6, 2) not null check (gust_speed_kmh >= 0),
  wave_height_meters numeric(5, 2) not null check (wave_height_meters >= 0),
  weather text not null check (weather in ('sereno', 'poco nuvoloso', 'nuvoloso', 'pioggia')),
  temperature_celsius numeric(5, 2) not null,
  computed_score integer check (computed_score between 0 and 100),
  score_version text,
  created_at timestamptz not null default now()
);

create index beaches_location_gix on public.beaches using gist (location);
create index beach_conditions_lookup_idx on public.beach_conditions (beach_id, observed_at desc);
create index beach_conditions_source_idx on public.beach_conditions (source_id);

grant select on table public.data_sources, public.beaches, public.beach_conditions to anon, authenticated;

alter table public.data_sources enable row level security;
alter table public.beaches enable row level security;
alter table public.beach_conditions enable row level security;

create policy "Public sources are readable"
  on public.data_sources
  for select
  to anon, authenticated
  using (is_public = true);

create policy "Published beaches are readable"
  on public.beaches
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Conditions for published beaches are readable"
  on public.beach_conditions
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.beaches
      where beaches.id = beach_conditions.beach_id
        and beaches.is_published = true
    )
  );
