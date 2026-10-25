-- SymptoCare — initial schema
-- Applies: profiles, appointment_requests, RLS, and supporting triggers.

-- ===========================================================================
-- profiles — one row per authenticated user
-- ===========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'tw')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================================================================
-- appointment_requests — a request is NOT a confirmed booking.
-- status is restricted to 'requested' | 'cancelled' | 'confirmed'.
-- 'confirmed' is reserved for a future provider confirmation workflow and is
-- never set by the application itself.
-- ===========================================================================
create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  facility_type text not null,
  preferred_date date not null,
  preferred_time text not null,
  reason text,
  status text not null default 'requested'
    check (status in ('requested', 'cancelled', 'confirmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointment_requests_user_id_idx
  on public.appointment_requests (user_id);

-- ===========================================================================
-- updated_at trigger
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_appointment_requests_updated_at on public.appointment_requests;
create trigger trg_appointment_requests_updated_at
  before update on public.appointment_requests
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- Auto-create a profile row on sign-up
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Row-Level Security
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.appointment_requests enable row level security;

-- profiles: a user can read and update only their own row, and insert only
-- their own row. The id must match the authenticated user.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- appointment_requests: users can only read, create, update, and delete
-- requests they own. user_id must equal the authenticated user.
drop policy if exists "appointments_select_own" on public.appointment_requests;
create policy "appointments_select_own"
  on public.appointment_requests for select
  using (auth.uid() = user_id);

drop policy if exists "appointments_insert_own" on public.appointment_requests;
create policy "appointments_insert_own"
  on public.appointment_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "appointments_update_own" on public.appointment_requests;
create policy "appointments_update_own"
  on public.appointment_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status <> 'confirmed');

drop policy if exists "appointments_delete_own" on public.appointment_requests;
create policy "appointments_delete_own"
  on public.appointment_requests for delete
  using (auth.uid() = user_id);
