alter table public.beaches
  add column if not exists image_path text,
  add column if not exists image_alt text,
  add column if not exists image_credit text,
  add column if not exists image_license text,
  add column if not exists orientation_label text,
  add column if not exists services text[] not null default '{}',
  add column if not exists warnings text[] not null default '{}',
  add column if not exists facts text[] not null default '{}';
alter table public.beach_conditions
  add column if not exists forecast_at timestamptz,
  add column if not exists weather_code integer,
  add column if not exists precipitation_probability_percent numeric(5, 2)
    check (precipitation_probability_percent between 0 and 100),
  add column if not exists cloud_cover_percent numeric(5, 2)
    check (cloud_cover_percent between 0 and 100),
  add column if not exists apparent_temperature_celsius numeric(5, 2),
  add column if not exists water_temperature_celsius numeric(5, 2),
  add column if not exists wave_direction_degrees numeric(5, 2)
    check (wave_direction_degrees >= 0 and wave_direction_degrees < 360);
update public.beach_conditions
set forecast_at = observed_at
where forecast_at is null;
alter table public.beach_conditions
  alter column forecast_at set not null,
  alter column wave_height_meters drop not null;
create unique index if not exists beach_conditions_forecast_unique_idx
  on public.beach_conditions (beach_id, source_id, forecast_at);
create index if not exists beach_conditions_forecast_lookup_idx
  on public.beach_conditions (beach_id, forecast_at);
revoke insert, update, delete on table
  public.data_sources, public.beaches, public.beach_conditions
  from anon, authenticated;
grant select on table
  public.data_sources, public.beaches, public.beach_conditions
  to anon, authenticated;
insert into public.data_sources (id, slug, name, url, quality, is_public)
values (
  '00000000-0000-0000-0000-000000000002',
  'open-meteo',
  'Open-Meteo',
  'https://open-meteo.com/',
  'high',
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  url = excluded.url,
  quality = excluded.quality,
  is_public = excluded.is_public;
with canonical_beaches (
  slug,
  name,
  municipality,
  coast,
  description,
  orientation_degrees,
  orientation_label,
  shelter,
  tags,
  access_level,
  latitude,
  longitude,
  image_path,
  image_alt,
  image_credit,
  image_license,
  services,
  warnings,
  facts
) as (
  values
    (
      'cala-del-gelsomino',
      'Cala del Gelsomino',
      'Noto',
      'Sud-est',
      'Acqua bassa, luce aperta e una baia che resta piacevole quando gira il vento.',
      120,
      'Sud-est',
      array['maestrale', 'ponente', 'tramontana'],
      array['relax', 'famiglie', 'acque-basse', 'fondale-basso'],
      'facile',
      36.9436,
      15.1953,
      '/images/beaches/cala-del-gelsomino.jpg',
      'La spiaggia della Pineta del Gelsomineto sulla costa sud-orientale della Sicilia.',
      'Stella',
      'CC BY-SA 4.0',
      array['Parcheggio vicino', 'Bar stagionale', 'Pineta'],
      array['Nelle ore centrali il parcheggio può riempirsi.'],
      array['Fondale basso', 'Sabbia e ciottoli', 'Accesso breve dalla pineta']
    ),
    (
      'tonnara-di-vendicari',
      'Tonnara di Vendicari',
      'Noto',
      'Sud-est',
      'Un tratto di costa da vivere con calma, tra sentieri, acqua trasparente e paesaggio aperto.',
      160,
      'Sud',
      array['maestrale', 'tramontana'],
      array['esplora', 'selvaggia', 'panorama', 'sentiero'],
      'moderato',
      36.8078,
      15.0984,
      '/images/beaches/tonnara-di-vendicari.jpg',
      'La spiaggia della Tonnara di Vendicari vista dalla costa della riserva naturale.',
      'Daniele Chessari',
      'CC BY-SA 4.0',
      array['Riserva naturale', 'Sentiero segnalato', 'Area picnic'],
      array['L’ultimo tratto è a piedi e non è ombreggiato.'],
      array['Riserva naturale', 'Torre e tonnara storica', 'Accesso a piedi']
    ),
    (
      'spiaggia-della-marchesa',
      'Spiaggia della Marchesa',
      'Avola',
      'Sud-est',
      'Pineta, sabbia e un accesso semplice per una giornata senza troppi piani.',
      95,
      'Est-sud-est',
      array['maestrale', 'ponente'],
      array['relax', 'snorkeling', 'famiglie', 'pineta'],
      'facile',
      36.9274,
      15.1456,
      '/images/beaches/spiaggia-della-marchesa.jpg',
      'La spiaggia della Marchesa di Cassibile tra sabbia, pineta e mare aperto.',
      'Davide Mauro',
      'CC BY-SA 4.0',
      array['Pineta', 'Parcheggio', 'Area picnic'],
      array['Porta acqua per il tratto sotto il sole.'],
      array['Sabbia chiara', 'Pineta', 'Snorkeling vicino agli scogli']
    )
)
update public.beaches as beaches
set
  name = canonical_beaches.name,
  municipality = canonical_beaches.municipality,
  coast = canonical_beaches.coast,
  description = canonical_beaches.description,
  orientation_degrees = canonical_beaches.orientation_degrees,
  orientation_label = canonical_beaches.orientation_label,
  shelter = canonical_beaches.shelter,
  tags = canonical_beaches.tags,
  access_level = canonical_beaches.access_level,
  latitude = canonical_beaches.latitude,
  longitude = canonical_beaches.longitude,
  location = extensions.st_setsrid(
    extensions.st_makepoint(canonical_beaches.longitude, canonical_beaches.latitude),
    4326
  )::extensions.geography,
  image_path = canonical_beaches.image_path,
  image_alt = canonical_beaches.image_alt,
  image_credit = canonical_beaches.image_credit,
  image_license = canonical_beaches.image_license,
  services = canonical_beaches.services,
  warnings = canonical_beaches.warnings,
  facts = canonical_beaches.facts
from canonical_beaches
where beaches.slug = canonical_beaches.slug;
