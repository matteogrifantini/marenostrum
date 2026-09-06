alter table public.review_profiles
  add column if not exists rating numeric(2,1) check (rating >= 1.0 and rating <= 5.0),
  add column if not exists review_count integer check (review_count >= 0);
