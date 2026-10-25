create table public.search_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, window_start)
);

alter table public.search_rate_limits enable row level security;

revoke all on table public.search_rate_limits from anon, authenticated;

create or replace function public.consume_search_rate_limit(target_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz := date_trunc('hour', now());
  current_count integer;
begin
  insert into public.search_rate_limits (user_id, window_start, request_count)
  values (target_user_id, current_window, 1)
  on conflict (user_id, window_start)
  do update set request_count = public.search_rate_limits.request_count + 1
  returning request_count into current_count;

  delete from public.search_rate_limits
  where user_id = target_user_id and window_start < current_window;

  return current_count;
end;
$$;

revoke all on function public.consume_search_rate_limit(uuid) from public, anon, authenticated;
grant execute on function public.consume_search_rate_limit(uuid) to service_role;
