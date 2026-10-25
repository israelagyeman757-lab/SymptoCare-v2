create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null,
  facility_type text,
  created_at timestamptz not null default now(),
  unique (name, region)
);

alter table public.clinics
  add constraint clinics_region_check
  check (region in (
    'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
    'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
    'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
  ));

alter table public.clinics enable row level security;

drop policy if exists "clinics_select_authenticated" on public.clinics;
create policy "clinics_select_authenticated"
  on public.clinics for select
  using (auth.uid() is not null);

create index clinics_region_idx on public.clinics (region);

alter table public.appointment_requests
  add column region text,
  add column clinic_id uuid references public.clinics (id) on delete set null;

alter table public.appointment_requests
  add constraint appointment_requests_region_check
  check (region is null or region in (
    'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
    'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
    'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
  ));
