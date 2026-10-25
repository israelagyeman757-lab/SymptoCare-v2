update public.appointment_requests
set facility_type = case facility_type
  when 'Health centre / CHPS' then 'healthCentre'
  when 'Apɔmuden bea / CHPS' then 'healthCentre'
  when 'District hospital' then 'districtHospital'
  when 'Mansini ayaresabea' then 'districtHospital'
  when 'Polyclinic' then 'polyclinic'
  when 'Pharmacy consultation' then 'pharmacy'
  when 'Pharmacy afotu' then 'pharmacy'
  when 'Other' then 'other'
  when 'Foforo' then 'other'
  else facility_type
end
where facility_type not in ('healthCentre', 'districtHospital', 'polyclinic', 'pharmacy', 'other');

alter table public.profiles
  add constraint profiles_display_name_length
  check (char_length(display_name) <= 100);

alter table public.appointment_requests
  add constraint appointment_requests_facility_type_check
    check (facility_type in ('healthCentre', 'districtHospital', 'polyclinic', 'pharmacy', 'other')),
  add constraint appointment_requests_reason_length
    check (char_length(reason) <= 500),
  add constraint appointment_requests_preferred_time_length
    check (char_length(preferred_time) <= 20);

create unique index appointment_requests_pending_unique
  on public.appointment_requests (user_id, facility_type, preferred_date, preferred_time)
  where status = 'requested';

drop policy if exists "appointments_insert_own" on public.appointment_requests;
create policy "appointments_insert_own"
  on public.appointment_requests for insert
  with check (auth.uid() = user_id and status = 'requested');

drop policy if exists "appointments_update_own" on public.appointment_requests;
create policy "appointments_update_own"
  on public.appointment_requests for update
  using (auth.uid() = user_id and status = 'requested')
  with check (auth.uid() = user_id and status = 'cancelled');
