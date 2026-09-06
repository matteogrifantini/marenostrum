alter table public.beaches
  add column if not exists country_code text not null default 'IT',
  add column if not exists region_code text,
  add column if not exists region_name text,
  add column if not exists province_name text;

alter table public.beaches
  alter column region_slug drop default;

update public.beaches
set
  country_code = coalesce(nullif(upper(trim(country_code)), ''), 'IT'),
  region_code = coalesce(
    nullif(trim(region_code), ''),
    case lower(trim(region_slug)) when 'sicilia' then 'IT-82' else null end
  ),
  region_name = coalesce(
    nullif(trim(region_name), ''),
    case lower(trim(region_slug)) when 'sicilia' then 'Sicilia' else null end
  ),
  province_name = coalesce(
    nullif(trim(province_name), ''),
    case upper(trim(province_code))
      when 'AG' then 'Agrigento'
      when 'CL' then 'Caltanissetta'
      when 'CT' then 'Catania'
      when 'EN' then 'Enna'
      when 'ME' then 'Messina'
      when 'PA' then 'Palermo'
      when 'RG' then 'Ragusa'
      when 'SR' then 'Siracusa'
      when 'TP' then 'Trapani'
      else null
    end
  ),
  location = coalesce(
    location,
    extensions.st_setsrid(
      extensions.st_makepoint(longitude, latitude),
      4326
    )::extensions.geography
  );

alter table public.beaches
  drop constraint if exists beaches_region_slug_check,
  drop constraint if exists beaches_province_code_check,
  drop constraint if exists beaches_latitude_check,
  drop constraint if exists beaches_longitude_check,
  drop constraint if exists beaches_country_code_check,
  drop constraint if exists beaches_latitude_global_check,
  drop constraint if exists beaches_longitude_global_check;

alter table public.beaches
  add constraint beaches_country_code_check
    check (country_code = 'IT'),
  add constraint beaches_region_slug_nonempty_check
    check (char_length(trim(region_slug)) > 0),
  add constraint beaches_region_code_check
    check (region_code is null or region_code ~ '^IT-[0-9]{2}$'),
  add constraint beaches_province_code_global_check
    check (province_code is null or province_code ~ '^[A-Z]{2}$'),
  add constraint beaches_latitude_global_check
    check (latitude between -90 and 90),
  add constraint beaches_longitude_global_check
    check (longitude between -180 and 180);

create index if not exists beaches_public_scope_idx
  on public.beaches (country_code, region_slug, province_code, publication_status)
  where is_published = true
    and publication_status in ('verified', 'stale');

alter table public.beach_catalog_candidates
  add column if not exists country_code text not null default 'IT';

update public.beach_catalog_candidates
set country_code = coalesce(nullif(upper(trim(country_code)), ''), 'IT');

alter table public.beach_catalog_candidates
  drop constraint if exists beach_catalog_candidates_region_check,
  drop constraint if exists beach_catalog_candidates_province_check,
  drop constraint if exists beach_catalog_candidates_latitude_check,
  drop constraint if exists beach_catalog_candidates_longitude_check,
  drop constraint if exists beach_catalog_candidates_country_code_check,
  drop constraint if exists beach_catalog_candidates_region_nonempty_check,
  drop constraint if exists beach_catalog_candidates_province_nonempty_check,
  drop constraint if exists beach_catalog_candidates_latitude_global_check,
  drop constraint if exists beach_catalog_candidates_longitude_global_check;

alter table public.beach_catalog_candidates
  add constraint beach_catalog_candidates_country_code_check
    check (country_code = 'IT'),
  add constraint beach_catalog_candidates_region_nonempty_check
    check (char_length(trim(region)) > 0),
  add constraint beach_catalog_candidates_province_nonempty_check
    check (char_length(trim(province)) > 0),
  add constraint beach_catalog_candidates_latitude_global_check
    check (latitude is null or latitude between -90 and 90),
  add constraint beach_catalog_candidates_longitude_global_check
    check (longitude is null or longitude between -180 and 180);

alter table public.parking_facilities
  drop constraint if exists parking_facilities_latitude_check,
  drop constraint if exists parking_facilities_longitude_check,
  drop constraint if exists parking_facilities_latitude_global_check,
  drop constraint if exists parking_facilities_longitude_global_check;

alter table public.parking_facilities
  add constraint parking_facilities_latitude_global_check
    check (latitude is null or latitude between -90 and 90),
  add constraint parking_facilities_longitude_global_check
    check (longitude is null or longitude between -180 and 180);

alter table public.webcams
  drop constraint if exists webcams_latitude_check,
  drop constraint if exists webcams_longitude_check,
  drop constraint if exists webcams_latitude_global_check,
  drop constraint if exists webcams_longitude_global_check;

alter table public.webcams
  add constraint webcams_latitude_global_check
    check (latitude is null or latitude between -90 and 90),
  add constraint webcams_longitude_global_check
    check (longitude is null or longitude between -180 and 180);

drop policy if exists "Published beach reports are readable" on public.community_reports;
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
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Reports can be added to published beaches" on public.community_reports;
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
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Published beach reviews are readable" on public.beach_reviews;
create policy "Published beach reviews are readable"
  on public.beach_reviews
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.beaches
      where beaches.id = beach_reviews.beach_id
        and beaches.is_published = true
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Users can create their own beach reviews" on public.beach_reviews;
create policy "Users can create their own beach reviews"
  on public.beach_reviews
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beaches
      where beaches.id = beach_reviews.beach_id
        and beaches.is_published = true
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Users can update their own beach reviews" on public.beach_reviews;
create policy "Users can update their own beach reviews"
  on public.beach_reviews
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.beaches
      where beaches.id = beach_reviews.beach_id
        and beaches.is_published = true
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Sources for published beaches are readable" on public.beach_sources;
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
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Verified parking for published beaches is readable" on public.parking_facilities;
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
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Published media is readable" on public.media_items;
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
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Published webcams are readable" on public.webcams;
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
        and beaches.publication_status in ('verified', 'stale')
    )
  );

drop policy if exists "Published review profiles are readable" on public.review_profiles;
create policy "Published review profiles are readable"
  on public.review_profiles
  for select
  to anon, authenticated
  using (
    verification_status in ('draft', 'verified', 'stale')
    and exists (
      select 1
      from public.beaches
      where beaches.id = review_profiles.beach_id
        and beaches.is_published = true
        and beaches.publication_status in ('verified', 'stale')
    )
  );
