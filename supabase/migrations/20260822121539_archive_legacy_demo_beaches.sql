update public.beaches
set
  is_published = false,
  publication_status = 'archived',
  updated_at = now()
where is_published = true
  and slug in (
    'cala-del-gelsomino',
    'spiaggia-della-marchesa',
    'tonnara-di-vendicari'
  );
