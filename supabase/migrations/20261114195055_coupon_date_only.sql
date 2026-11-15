alter table public.platform_coupons
  alter column valid_from drop default,
  alter column valid_from type date
    using (valid_from at time zone 'UTC')::date,
  alter column valid_from set default ((now() at time zone 'America/Sao_Paulo')::date),
  alter column valid_until type date
    using (valid_until at time zone 'UTC')::date;
