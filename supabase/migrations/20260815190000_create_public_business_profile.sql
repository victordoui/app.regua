-- Public client pages must never read the complete business settings row.
create table if not exists public.public_business_profile (
  user_id uuid primary key,
  company_name text not null,
  slogan text,
  logo_url text,
  banner_url text,
  primary_color_hex text,
  secondary_color_hex text,
  address text,
  phone text,
  instagram_url text,
  facebook_url text,
  whatsapp_number text,
  cancellation_hours_before integer,
  allow_online_cancellation boolean,
  allow_guest_booking boolean,
  buffer_minutes integer not null default 0
);

alter table public.public_business_profile enable row level security;
revoke all on public.public_business_profile from public;
grant select on public.public_business_profile to anon, authenticated;
create policy "Public businesses are discoverable"
on public.public_business_profile for select to anon, authenticated using (true);

insert into public.public_business_profile (
  user_id, company_name, slogan, logo_url, banner_url, primary_color_hex,
  secondary_color_hex, address, phone, instagram_url, facebook_url,
  whatsapp_number, cancellation_hours_before, allow_online_cancellation,
  allow_guest_booking, buffer_minutes
)
select user_id, company_name, slogan, logo_url, banner_url, primary_color_hex,
  secondary_color_hex, address, phone, instagram_url, facebook_url,
  whatsapp_number, cancellation_hours_before, allow_online_cancellation,
  allow_guest_booking, coalesce(buffer_minutes, 0)
from public.barbershop_settings
where is_public_page_enabled = true
on conflict (user_id) do update set
  company_name = excluded.company_name, slogan = excluded.slogan,
  logo_url = excluded.logo_url, banner_url = excluded.banner_url,
  primary_color_hex = excluded.primary_color_hex, secondary_color_hex = excluded.secondary_color_hex,
  address = excluded.address, phone = excluded.phone, instagram_url = excluded.instagram_url,
  facebook_url = excluded.facebook_url, whatsapp_number = excluded.whatsapp_number,
  cancellation_hours_before = excluded.cancellation_hours_before,
  allow_online_cancellation = excluded.allow_online_cancellation,
  allow_guest_booking = excluded.allow_guest_booking, buffer_minutes = excluded.buffer_minutes;

create or replace function public.sync_public_business_profile()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.is_public_page_enabled then
    insert into public.public_business_profile (
      user_id, company_name, slogan, logo_url, banner_url, primary_color_hex,
      secondary_color_hex, address, phone, instagram_url, facebook_url,
      whatsapp_number, cancellation_hours_before, allow_online_cancellation,
      allow_guest_booking, buffer_minutes
    ) values (
      new.user_id, new.company_name, new.slogan, new.logo_url, new.banner_url, new.primary_color_hex,
      new.secondary_color_hex, new.address, new.phone, new.instagram_url, new.facebook_url,
      new.whatsapp_number, new.cancellation_hours_before, new.allow_online_cancellation,
      new.allow_guest_booking, coalesce(new.buffer_minutes, 0)
    ) on conflict (user_id) do update set
      company_name = excluded.company_name, slogan = excluded.slogan, logo_url = excluded.logo_url,
      banner_url = excluded.banner_url, primary_color_hex = excluded.primary_color_hex,
      secondary_color_hex = excluded.secondary_color_hex, address = excluded.address, phone = excluded.phone,
      instagram_url = excluded.instagram_url, facebook_url = excluded.facebook_url,
      whatsapp_number = excluded.whatsapp_number, cancellation_hours_before = excluded.cancellation_hours_before,
      allow_online_cancellation = excluded.allow_online_cancellation,
      allow_guest_booking = excluded.allow_guest_booking, buffer_minutes = excluded.buffer_minutes;
  else
    delete from public.public_business_profile where user_id = new.user_id;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_public_business_profile() from public, anon, authenticated;

drop trigger if exists sync_public_business_profile_after_change on public.barbershop_settings;
create trigger sync_public_business_profile_after_change
after insert or update on public.barbershop_settings
for each row execute function public.sync_public_business_profile();

revoke select on public.barbershop_settings from anon;
