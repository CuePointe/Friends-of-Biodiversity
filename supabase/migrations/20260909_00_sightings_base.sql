-- Compatibility guard for environments where the existing citizen-science table
-- has not yet been created. If `public.sightings` already exists, this is a no-op.
create table if not exists public.sightings (
  id uuid primary key default gen_random_uuid(),
  species text not null,
  lat double precision,
  lng double precision,
  observed_at timestamptz not null default now(),
  member_id uuid references public.members(id) on delete set null,
  member_name text,
  photo_url text,
  notes text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sightings_observed_at_idx on public.sightings(observed_at desc);
create index if not exists sightings_species_idx on public.sightings(species);
create index if not exists sightings_verified_idx on public.sightings(verified);
