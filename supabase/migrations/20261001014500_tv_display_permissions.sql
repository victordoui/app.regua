begin;
revoke all on public.tv_display_settings from authenticated;
grant select, insert, update on public.tv_display_settings to authenticated;
alter table public.tv_display_settings add constraint tv_slides_array
  check (jsonb_typeof(config->'slides') = 'array' and jsonb_array_length(config->'slides') <= 30);
commit;
