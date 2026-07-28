-- Launch hardening: tenant isolation, account linkage and atomic group bookings.
-- This migration intentionally preserves existing appointments and client records.

alter table public.client_profiles
  add column if not exists client_id uuid references public.clients(id) on delete set null;

alter table public.user_roles
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

-- A client can have one public-booking profile per business, not only one globally.
alter table public.client_profiles drop constraint if exists client_profiles_user_id_key;
create unique index if not exists client_profiles_user_business_unique
  on public.client_profiles(user_id, barbershop_user_id);
create unique index if not exists client_profiles_client_business_unique
  on public.client_profiles(client_id, barbershop_user_id)
  where client_id is not null;
create index if not exists idx_client_profiles_client_id on public.client_profiles(client_id);
create index if not exists idx_user_roles_profile_id on public.user_roles(profile_id);
create index if not exists idx_appointments_barber_date_active
  on public.appointments(barbeiro_id, appointment_date)
  where status <> 'cancelled';
create index if not exists idx_appointment_services_appointment_id
  on public.appointment_services(appointment_id);
create index if not exists idx_appointment_services_service_id
  on public.appointment_services(service_id);

-- Safe backfill: only link records where the current data already proves the relation.
update public.user_roles r
set profile_id = p.id
from public.profiles p
where p.user_id = r.user_id
  and r.profile_id is null;

-- Remove broad Data API permissions. RLS stays enabled on every exposed table.
revoke all on public.appointments, public.appointment_services, public.clients,
  public.client_profiles, public.profiles, public.user_roles, public.services,
  public.blocked_slots, public.business_hours from anon;
revoke all on public.appointments, public.appointment_services, public.clients,
  public.client_profiles, public.profiles, public.user_roles, public.services,
  public.blocked_slots, public.business_hours from authenticated;

grant select on public.services, public.business_hours to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select, insert, update on public.client_profiles to authenticated;
grant select on public.appointments, public.appointment_services, public.clients to authenticated;
grant select, insert, update, delete on public.appointments, public.appointment_services,
  public.clients, public.profiles, public.user_roles, public.services,
  public.blocked_slots, public.business_hours to authenticated;

-- Replace the legacy permissive policies with explicit ownership rules.
drop policy if exists "Users can manage their own appointments" on public.appointments;
drop policy if exists "Users can manage their appointment services" on public.appointment_services;
drop policy if exists "Users can manage their own clients" on public.clients;
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can manage their own services" on public.services;
drop policy if exists "Users can manage their blocked slots" on public.blocked_slots;
drop policy if exists "Public can view business hours" on public.business_hours;
drop policy if exists "Users can manage their business hours" on public.business_hours;
drop policy if exists "Barbershop owners can view their clients" on public.client_profiles;
drop policy if exists "Users can insert their own client profile" on public.client_profiles;
drop policy if exists "Users can update their own client profile" on public.client_profiles;
drop policy if exists "Users can view their own client profile" on public.client_profiles;
drop policy if exists "Admins can manage all roles" on public.user_roles;
drop policy if exists "Users can view their own roles" on public.user_roles;

create policy appointments_owner_manage on public.appointments for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy appointments_client_read on public.appointments for select to authenticated
  using (exists (
    select 1 from public.client_profiles cp
    where cp.user_id = (select auth.uid())
      and cp.client_id = appointments.client_id
      and cp.barbershop_user_id = appointments.user_id
  ));

create policy appointment_services_owner_manage on public.appointment_services for all to authenticated
  using (exists (select 1 from public.appointments a where a.id = appointment_services.appointment_id and a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.appointments a where a.id = appointment_services.appointment_id and a.user_id = (select auth.uid())));
create policy appointment_services_client_read on public.appointment_services for select to authenticated
  using (exists (
    select 1 from public.appointments a join public.client_profiles cp on cp.client_id = a.client_id and cp.barbershop_user_id = a.user_id
    where a.id = appointment_services.appointment_id and cp.user_id = (select auth.uid())
  ));

create policy clients_owner_manage on public.clients for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy clients_client_read on public.clients for select to authenticated
  using (exists (select 1 from public.client_profiles cp where cp.user_id = (select auth.uid()) and cp.client_id = clients.id and cp.barbershop_user_id = clients.user_id));

create policy client_profiles_owner_manage on public.client_profiles for all to authenticated
  using ((select auth.uid()) = barbershop_user_id)
  with check ((select auth.uid()) = barbershop_user_id);
create policy client_profiles_self_read on public.client_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy client_profiles_self_insert on public.client_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy client_profiles_self_update on public.client_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy profiles_public_professional_read on public.profiles for select to anon, authenticated
  using (role = 'barbeiro' and active = true);
create policy profiles_owner_manage on public.profiles for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy services_public_read on public.services for select to anon, authenticated using (active = true);
create policy services_owner_manage on public.services for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy business_hours_public_read on public.business_hours for select to anon, authenticated using (true);
create policy business_hours_owner_manage on public.business_hours for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy blocked_slots_owner_manage on public.blocked_slots for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy user_roles_self_read on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );
$$;
revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

create policy user_roles_owner_manage on public.user_roles for all to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- Dev/bootstrap functions must never be callable from the Data API.
revoke all on function public.create_dev_profile_if_not_exists() from public, anon, authenticated;
revoke all on function public.create_dev_user_and_profile() from public, anon, authenticated;
revoke all on function public.create_subscriber_with_subscription(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.handle_new_client_profile() from public, anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke all on function public.is_client_of(uuid, uuid) from public, anon, authenticated;
revoke all on function public.is_super_admin(uuid) from public, anon, authenticated;

create or replace function public.book_group_appointments(
  _barbershop_user_id uuid,
  _responsible jsonb,
  _participants jsonb,
  _notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _actor uuid := auth.uid();
  _client_id uuid;
  _participant jsonb;
  _service_ids uuid[];
  _service_id uuid;
  _professional_id uuid;
  _date date;
  _time time;
  _duration integer;
  _price numeric;
  _buffer integer := 0;
  _opening time;
  _closing time;
  _is_closed boolean;
  _appointment_id uuid;
  _group_id uuid := gen_random_uuid();
  _created jsonb := '[]'::jsonb;
  _email text := lower(trim(coalesce(_responsible->>'email', '')));
  _name text := trim(coalesce(_responsible->>'name', ''));
  _phone text := regexp_replace(coalesce(_responsible->>'phone', ''), '[^0-9]', '', 'g');
begin
  if _actor is null then raise exception 'AUTH_REQUIRED' using errcode = '28000'; end if;
  if _barbershop_user_id is null or not exists (select 1 from public.barbershop_settings where user_id = _barbershop_user_id) then
    raise exception 'BUSINESS_NOT_FOUND' using errcode = 'P0001';
  end if;
  if _name = '' or _email = '' or _phone = '' then raise exception 'RESPONSIBLE_REQUIRED' using errcode = 'P0001'; end if;
  if jsonb_typeof(_participants) <> 'array' or jsonb_array_length(_participants) = 0 then raise exception 'PARTICIPANTS_REQUIRED' using errcode = 'P0001'; end if;

  select coalesce(buffer_minutes, 0) into _buffer from public.barbershop_settings where user_id = _barbershop_user_id;

  -- Deterministic transaction locks prevent a race for the same professional/day.
  for _professional_id, _date in
    select distinct (p->>'professionalId')::uuid, (p->>'date')::date
    from jsonb_array_elements(_participants) p
    order by 1, 2
  loop
    perform pg_advisory_xact_lock(hashtextextended(_barbershop_user_id::text || ':' || _professional_id::text || ':' || _date::text, 0));
  end loop;

  select id into _client_id from public.clients where user_id = _barbershop_user_id and lower(coalesce(email,'')) = _email limit 1;
  if _client_id is null then
    insert into public.clients(user_id, name, phone, email) values (_barbershop_user_id, _name, _phone, _email) returning id into _client_id;
  else
    update public.clients set name = _name, phone = _phone, updated_at = now() where id = _client_id;
  end if;

  insert into public.client_profiles(user_id, barbershop_user_id, client_id, full_name, phone)
  values (_actor, _barbershop_user_id, _client_id, _name, _phone)
  on conflict (user_id, barbershop_user_id) do update
  set client_id = excluded.client_id, full_name = excluded.full_name, phone = excluded.phone, updated_at = now();

  for _participant in select value from jsonb_array_elements(_participants)
  loop
    _professional_id := (_participant->>'professionalId')::uuid;
    _date := (_participant->>'date')::date;
    _time := (_participant->>'time')::time;
    _service_ids := array(select jsonb_array_elements_text(_participant->'serviceIds')::uuid);
    if coalesce(array_length(_service_ids, 1), 0) = 0 or _professional_id is null or _date is null or _time is null or trim(coalesce(_participant->>'name','')) = '' then
      raise exception 'INVALID_PARTICIPANT' using errcode = 'P0001';
    end if;
    if not exists (select 1 from public.profiles p where p.id = _professional_id and p.user_id = _barbershop_user_id and p.role = 'barbeiro' and p.active = true) then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'P0001';
    end if;
    if (select count(*) from public.services s where s.id = any(_service_ids) and s.user_id = _barbershop_user_id and s.active = true) <> array_length(_service_ids, 1) then
      raise exception 'INVALID_SERVICE' using errcode = 'P0001';
    end if;
    select coalesce(sum(duration_minutes),0), coalesce(sum(price),0) into _duration, _price from public.services where id = any(_service_ids);
    _service_id := _service_ids[1];
    select open_time, close_time, coalesce(is_closed,false) into _opening, _closing, _is_closed from public.business_hours where user_id = _barbershop_user_id and day_of_week = extract(dow from _date);
    if coalesce(_is_closed,false) or _opening is null or _closing is null or _time < _opening or (_time + make_interval(mins => _duration)) > _closing then
      raise exception 'OUTSIDE_BUSINESS_HOURS' using errcode = 'P0001';
    end if;
    if exists (
      select 1 from public.blocked_slots b
      where b.user_id = _barbershop_user_id and b.barber_id = _professional_id
        and b.start_datetime < ((_date + _time + make_interval(mins => _duration)) at time zone 'America/Sao_Paulo')
        and b.end_datetime > ((_date + _time) at time zone 'America/Sao_Paulo')
    ) then raise exception 'PROFESSIONAL_BLOCKED' using errcode = 'P0001'; end if;
    if exists (
      select 1 from public.appointments a
      where a.user_id = _barbershop_user_id and a.barbeiro_id = _professional_id and a.appointment_date = _date and a.status <> 'cancelled'
        and (a.appointment_date + a.appointment_time) < (_date + _time + make_interval(mins => _duration + _buffer))
        and (a.appointment_date + a.appointment_time + make_interval(mins => coalesce((select sum(s.duration_minutes) from public.appointment_services aps join public.services s on s.id = aps.service_id where aps.appointment_id = a.id), (select s.duration_minutes from public.services s where s.id = a.service_id), 0) + _buffer)) > (_date + _time)
    ) then raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001'; end if;

    insert into public.appointments(user_id, client_id, service_id, barbeiro_id, appointment_date, appointment_time, status, total_price, notes)
    values (_barbershop_user_id, _client_id, _service_id, _professional_id, _date, _time, 'pending', _price, coalesce(_participant->>'notes', _notes))
    returning id into _appointment_id;
    insert into public.appointment_services(appointment_id, service_id, price)
      select _appointment_id, s.id, s.price from public.services s where s.id = any(_service_ids);
    _created := _created || jsonb_build_array(jsonb_build_object('id',_appointment_id,'participant',_participant->>'name','date',_date,'time',to_char(_time,'HH24:MI'),'total',_price,'groupId',_group_id));
  end loop;
  return jsonb_build_object('groupId', _group_id, 'appointments', _created, 'total', (select coalesce(sum((item->>'total')::numeric),0) from jsonb_array_elements(_created) item));
end;
$$;

revoke all on function public.book_group_appointments(uuid, jsonb, jsonb, text) from public, anon;
grant execute on function public.book_group_appointments(uuid, jsonb, jsonb, text) to authenticated;
