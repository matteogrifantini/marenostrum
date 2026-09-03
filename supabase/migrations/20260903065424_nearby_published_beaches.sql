create or replace function public.nearby_published_beaches(
  query_latitude double precision,
  query_longitude double precision,
  query_radius_km double precision
)
returns setof public.beaches
language sql
stable
security invoker
set search_path = ''
as $function$
  select beaches.*
  from public.beaches as beaches
  where query_latitude between -90 and 90
    and query_longitude between -180 and 180
    and query_radius_km between 1 and 100
    and beaches.is_published = true
    and beaches.publication_status in ('verified', 'stale')
    and beaches.location is not null
    and extensions.st_dwithin(
      beaches.location,
      extensions.st_setsrid(
        extensions.st_makepoint(query_longitude, query_latitude),
        4326
      )::extensions.geography,
      query_radius_km * 1000
    )
  order by beaches.location operator(extensions.<->) extensions.st_setsrid(
    extensions.st_makepoint(query_longitude, query_latitude),
    4326
  )::extensions.geography;
$function$;

revoke all on function public.nearby_published_beaches(double precision, double precision, double precision)
  from public;
grant execute on function public.nearby_published_beaches(double precision, double precision, double precision)
  to anon, authenticated;
