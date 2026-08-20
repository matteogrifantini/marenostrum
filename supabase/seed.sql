insert into public.data_sources (id, slug, name, url, quality, is_public, last_checked_at)
values
  ('00000000-0000-0000-0000-000000000001', 'demo', 'Dati dimostrativi Mare Nostrum', 'https://example.com/demo', 'low', true, '2026-08-14T08:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'open-meteo', 'Open-Meteo', 'https://open-meteo.com/', 'high', true, null)
on conflict (slug) do nothing;

insert into public.beaches (
  id, slug, name, municipality, coast, description, orientation_degrees,
  shelter, tags, access_level, latitude, longitude, location, is_published,
  image_path, image_alt, image_credit, image_license, orientation_label,
  services, warnings, facts
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'cala-del-gelsomino',
    'Cala del Gelsomino',
    'Noto',
    'Sud-est',
    'Acqua bassa, luce aperta e una baia che resta piacevole quando gira il vento.',
    120,
    array['maestrale', 'ponente', 'tramontana'],
    array['relax', 'famiglie', 'acque-basse', 'fondale-basso'],
    'facile',
    36.943600,
    15.195300,
    extensions.st_setsrid(extensions.st_makepoint(15.195300, 36.943600), 4326)::extensions.geography,
    true,
    '/images/beaches/cala-del-gelsomino.jpg',
    'La spiaggia della Pineta del Gelsomineto sulla costa sud-orientale della Sicilia.',
    'Stella',
    'CC BY-SA 4.0',
    'Sud-est',
    array['Parcheggio vicino', 'Bar stagionale', 'Pineta'],
    array['Nelle ore centrali il parcheggio può riempirsi.'],
    array['Fondale basso', 'Sabbia e ciottoli', 'Accesso breve dalla pineta']
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'tonnara-di-vendicari',
    'Tonnara di Vendicari',
    'Noto',
    'Sud-est',
    'Un tratto di costa da vivere con calma, tra sentieri, acqua trasparente e paesaggio aperto.',
    160,
    array['maestrale', 'tramontana'],
    array['esplora', 'selvaggia', 'panorama', 'sentiero'],
    'moderato',
    36.807800,
    15.098400,
    extensions.st_setsrid(extensions.st_makepoint(15.098400, 36.807800), 4326)::extensions.geography,
    true,
    '/images/beaches/tonnara-di-vendicari.jpg',
    'La spiaggia della Tonnara di Vendicari vista dalla costa della riserva naturale.',
    'Daniele Chessari',
    'CC BY-SA 4.0',
    'Sud',
    array['Riserva naturale', 'Sentiero segnalato', 'Area picnic'],
    array['L’ultimo tratto è a piedi e non è ombreggiato.'],
    array['Riserva naturale', 'Torre e tonnara storica', 'Accesso a piedi']
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'spiaggia-della-marchesa',
    'Spiaggia della Marchesa',
    'Avola',
    'Sud-est',
    'Pineta, sabbia e un accesso semplice per una giornata senza troppi piani.',
    95,
    array['maestrale', 'ponente'],
    array['relax', 'snorkeling', 'famiglie', 'pineta'],
    'facile',
    36.927400,
    15.145600,
    extensions.st_setsrid(extensions.st_makepoint(15.145600, 36.927400), 4326)::extensions.geography,
    true,
    '/images/beaches/spiaggia-della-marchesa.jpg',
    'La spiaggia della Marchesa di Cassibile tra sabbia, pineta e mare aperto.',
    'Davide Mauro',
    'CC BY-SA 4.0',
    'Est-sud-est',
    array['Pineta', 'Parcheggio', 'Area picnic'],
    array['Porta acqua per il tratto sotto il sole.'],
    array['Sabbia chiara', 'Pineta', 'Snorkeling vicino agli scogli']
  )
on conflict (slug) do nothing;

insert into public.beach_conditions (
  id, beach_id, source_id, observed_at, forecast_at, wind_direction_degrees, wind_speed_kmh,
  gust_speed_kmh, wave_height_meters, weather, temperature_celsius,
  computed_score, score_version
)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '2026-08-14T08:00:00Z', '2026-08-14T08:00:00Z', 315, 7, 12, 0.2, 'sereno', 30, 100, 'demo-0.1'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '2026-08-14T08:00:00Z', '2026-08-14T08:00:00Z', 315, 10, 18, 0.3, 'sereno', 29, 91, 'demo-0.1'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '2026-08-14T08:00:00Z', '2026-08-14T08:00:00Z', 315, 12, 20, 0.4, 'poco nuvoloso', 29, 82, 'demo-0.1')
on conflict (id) do nothing;
