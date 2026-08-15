insert into public.data_sources (id, slug, name, url, quality, is_public, last_checked_at)
values
  ('00000000-0000-0000-0000-000000000001', 'demo', 'Dati dimostrativi Sicilia Beach', 'https://example.com/demo', 'low', true, '2026-08-14T08:00:00Z')
on conflict (slug) do nothing;

insert into public.beaches (
  id, slug, name, municipality, coast, description, orientation_degrees,
  shelter, tags, access_level, latitude, longitude, location, is_published
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'cala-del-gelsomino',
    'Cala del Gelsomino',
    'Noto',
    'Sud-est',
    'Dati dimostrativi: acqua bassa, luce aperta e una baia che resta piacevole quando gira il vento.',
    120,
    array['maestrale', 'ponente', 'tramontana'],
    array['relax', 'famiglie', 'acque-basse'],
    'facile',
    36.800000,
    15.100000,
    extensions.st_setsrid(extensions.st_makepoint(15.100000, 36.800000), 4326)::extensions.geography,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'tonnara-di-vendicari',
    'Tonnara di Vendicari',
    'Noto',
    'Sud-est',
    'Dati dimostrativi: un tratto di costa da vivere con calma, tra sentieri, acqua trasparente e paesaggio aperto.',
    160,
    array['maestrale', 'tramontana'],
    array['esplora', 'selvaggia', 'panorama'],
    'moderato',
    36.800500,
    15.100500,
    extensions.st_setsrid(extensions.st_makepoint(15.100500, 36.800500), 4326)::extensions.geography,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'spiaggia-della-marchesa',
    'Spiaggia della Marchesa',
    'Avola',
    'Sud-est',
    'Dati dimostrativi: pineta, sabbia e un accesso semplice per una giornata senza troppi piani.',
    95,
    array['maestrale', 'ponente'],
    array['relax', 'snorkeling', 'famiglie'],
    'facile',
    36.801000,
    15.101000,
    extensions.st_setsrid(extensions.st_makepoint(15.101000, 36.801000), 4326)::extensions.geography,
    true
  )
on conflict (slug) do nothing;

insert into public.beach_conditions (
  id, beach_id, source_id, observed_at, wind_direction_degrees, wind_speed_kmh,
  gust_speed_kmh, wave_height_meters, weather, temperature_celsius,
  computed_score, score_version
)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '2026-08-14T08:00:00Z', 315, 7, 12, 0.2, 'sereno', 30, 100, 'demo-0.1'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '2026-08-14T08:00:00Z', 315, 10, 18, 0.3, 'sereno', 29, 91, 'demo-0.1'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '2026-08-14T08:00:00Z', 315, 12, 20, 0.4, 'poco nuvoloso', 29, 82, 'demo-0.1')
on conflict (id) do nothing;
