-- Public sharing metadata belongs to the business owner, not the platform.
alter table public.barbershop_settings
  add column if not exists meta_title text,
  add column if not exists meta_description text;

alter table public.public_business_profile
  add column if not exists meta_title text,
  add column if not exists meta_description text;

alter table public.barbershop_settings
  drop constraint if exists barbershop_settings_meta_title_length,
  drop constraint if exists barbershop_settings_meta_description_length,
  add constraint barbershop_settings_meta_title_length
    check (meta_title is null or char_length(meta_title) <= 60),
  add constraint barbershop_settings_meta_description_length
    check (meta_description is null or char_length(meta_description) <= 160);

-- `barbershop_settings` contains private contact and operational data. Public
-- client pages must use `public_business_profile`, never this source table.
drop policy if exists "Allow public read access by user_id" on public.barbershop_settings;
revoke select on table public.barbershop_settings from anon;

-- Keep the intentionally-public projection synchronized. The public table is
-- the only business data used by unauthenticated share previews.
create or replace function public.sync_public_business_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.is_public_page_enabled then
    insert into public.public_business_profile (
      user_id, company_name, slogan, logo_url, banner_url, primary_color_hex,
      secondary_color_hex, address, phone, instagram_url, facebook_url,
      whatsapp_number, cancellation_hours_before, allow_online_cancellation,
      allow_guest_booking, buffer_minutes, meta_title, meta_description
    ) values (
      new.user_id, new.company_name, new.slogan, new.logo_url, new.banner_url,
      new.primary_color_hex, new.secondary_color_hex, new.address, new.phone,
      new.instagram_url, new.facebook_url, new.whatsapp_number,
      new.cancellation_hours_before, new.allow_online_cancellation,
      new.allow_guest_booking, coalesce(new.buffer_minutes, 0),
      nullif(new.meta_title, ''), nullif(new.meta_description, '')
    ) on conflict (user_id) do update set
      company_name = excluded.company_name,
      slogan = excluded.slogan,
      logo_url = excluded.logo_url,
      banner_url = excluded.banner_url,
      primary_color_hex = excluded.primary_color_hex,
      secondary_color_hex = excluded.secondary_color_hex,
      address = excluded.address,
      phone = excluded.phone,
      instagram_url = excluded.instagram_url,
      facebook_url = excluded.facebook_url,
      whatsapp_number = excluded.whatsapp_number,
      cancellation_hours_before = excluded.cancellation_hours_before,
      allow_online_cancellation = excluded.allow_online_cancellation,
      allow_guest_booking = excluded.allow_guest_booking,
      buffer_minutes = excluded.buffer_minutes,
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description;
  else
    delete from public.public_business_profile where user_id = new.user_id;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_public_business_profile() from public, anon, authenticated;

-- Backfill existing public businesses without exposing any private fields.
update public.public_business_profile public_profile
set
  meta_title = nullif(settings.meta_title, ''),
  meta_description = nullif(settings.meta_description, '')
from public.barbershop_settings settings
where settings.user_id = public_profile.user_id;
