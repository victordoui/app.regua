CREATE OR REPLACE FUNCTION public.sync_public_business_profile()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$ begin if new.is_public_page_enabled then insert into public.public_business_profile (user_id,company_name,slogan,logo_url,banner_url,primary_color_hex,secondary_color_hex,address,phone,instagram_url,facebook_url,whatsapp_number,cancellation_hours_before,allow_online_cancellation,allow_guest_booking,buffer_minutes) values (new.user_id,new.company_name,new.slogan,new.logo_url,new.banner_url,new.primary_color_hex,new.secondary_color_hex,new.address,new.phone,new.instagram_url,new.facebook_url,new.whatsapp_number,new.cancellation_hours_before,new.allow_online_cancellation,new.allow_guest_booking,coalesce(new.buffer_minutes,0)) on conflict (user_id) do update set company_name=excluded.company_name,slogan=excluded.slogan,logo_url=excluded.logo_url,banner_url=excluded.banner_url,primary_color_hex=excluded.primary_color_hex,secondary_color_hex=excluded.secondary_color_hex,address=excluded.address,phone=excluded.phone,instagram_url=excluded.instagram_url,facebook_url=excluded.facebook_url,whatsapp_number=excluded.whatsapp_number,cancellation_hours_before=excluded.cancellation_hours_before,allow_online_cancellation=excluded.allow_online_cancellation,allow_guest_booking=excluded.allow_guest_booking,buffer_minutes=excluded.buffer_minutes; else delete from public.public_business_profile where user_id=new.user_id; end if; return new; end; $function$;

GRANT EXECUTE ON FUNCTION "public"."sync_public_business_profile"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."sync_public_business_profile"() FROM PUBLIC;
