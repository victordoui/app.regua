alter table public.appointments
  add column if not exists tip_amount numeric(12, 2) not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_tip_amount_nonnegative'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_tip_amount_nonnegative check (tip_amount >= 0);
  end if;
end;
$$;
