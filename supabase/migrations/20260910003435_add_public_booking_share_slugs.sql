-- Persist the public identity used by branded booking-share URLs.
alter table public.barbershop_settings
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists share_slug text,
  add column if not exists share_title text,
  add column if not exists share_description text;

alter table public.public_business_profile
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists share_slug text,
  add column if not exists share_title text,
  add column if not exists share_description text;

create or replace function public.slugify_booking_business(value text)
returns text
language sql
immutable
as $$
  select nullif(trim(both '-' from regexp_replace(
    regexp_replace(lower(translate(coalesce(value, ''),
      'áàãâäéèêëíìîïóòõôöúùûüçñ',
      'aaaaaeeeeiiiiooooouuuucn')), '[^a-z0-9]+', '-', 'g'),
    '-+', '-', 'g')), '');
$$;

create unique index if not exists public_business_profile_share_slug_key
  on public.public_business_profile (share_slug)
  where share_slug is not null;

drop policy if exists "Allow public read access by user_id" on public.barbershop_settings;
revoke select on table public.barbershop_settings from anon;

-- Existing companies receive a readable slug. Duplicate names get a stable
-- short suffix rather than failing the backfill.
with candidates as (
  select user_id, coalesce(public.slugify_booking_business(company_name), 'empresa') as base
  from public.barbershop_settings
), numbered as (
  select user_id, base,
    row_number() over (partition by base order by user_id) as occurrence
  from candidates
)
update public.barbershop_settings settings
set share_slug = case when numbered.occurrence = 1 then numbered.base
                      else numbered.base || '-' || left(numbered.user_id::text, 8) end
from numbered
where settings.user_id = numbered.user_id
  and (settings.share_slug is null or settings.share_slug = '');

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
      allow_guest_booking, buffer_minutes, meta_title, meta_description,
      share_slug, share_title, share_description
    ) values (
      new.user_id, new.company_name, new.slogan, new.logo_url, new.banner_url,
      new.primary_color_hex, new.secondary_color_hex, new.address, new.phone,
      new.instagram_url, new.facebook_url, new.whatsapp_number,
      new.cancellation_hours_before, new.allow_online_cancellation,
      new.allow_guest_booking, coalesce(new.buffer_minutes, 0),
      nullif(new.meta_title, ''), nullif(new.meta_description, ''),
      coalesce(nullif(new.share_slug, ''), public.slugify_booking_business(new.company_name)),
      nullif(new.share_title, ''), nullif(new.share_description, '')
    ) on conflict (user_id) do update set
      company_name = excluded.company_name, slogan = excluded.slogan,
      logo_url = excluded.logo_url, banner_url = excluded.banner_url,
      primary_color_hex = excluded.primary_color_hex,
      secondary_color_hex = excluded.secondary_color_hex, address = excluded.address,
      phone = excluded.phone, instagram_url = excluded.instagram_url,
      facebook_url = excluded.facebook_url, whatsapp_number = excluded.whatsapp_number,
      cancellation_hours_before = excluded.cancellation_hours_before,
      allow_online_cancellation = excluded.allow_online_cancellation,
      allow_guest_booking = excluded.allow_guest_booking, buffer_minutes = excluded.buffer_minutes,
      meta_title = excluded.meta_title, meta_description = excluded.meta_description,
      share_slug = coalesce(excluded.share_slug, public_business_profile.share_slug),
      share_title = excluded.share_title, share_description = excluded.share_description;
  else
    delete from public.public_business_profile where user_id = new.user_id;
  end if;
  return new;
end;
$$;

revoke all on function public.slugify_booking_business(text) from public, anon, authenticated;
revoke all on function public.sync_public_business_profile() from public, anon, authenticated;

update public.public_business_profile profile
set share_slug = settings.share_slug
from public.barbershop_settings settings
where settings.user_id = profile.user_id
  and (profile.share_slug is null or profile.share_slug = '');
