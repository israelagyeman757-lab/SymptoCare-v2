alter table public.profiles
  drop constraint profiles_preferred_language_check;

alter table public.profiles
  add constraint profiles_preferred_language_check
  check (preferred_language in ('en', 'tw', 'ee', 'gaa', 'fat', 'dag'));
