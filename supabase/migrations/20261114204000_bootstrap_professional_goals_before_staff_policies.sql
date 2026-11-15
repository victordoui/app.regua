-- The production schema is missing this table even though the professional
-- dashboard and the following staff-policy migration depend on it. Keep the
-- DDL idempotent for QA databases where the historical table already exists.
create table if not exists public.barbeiro_goals (
  id uuid not null default gen_random_uuid() primary key,
  barbeiro_id uuid not null references public.profiles(id) on delete cascade,
  goal_type text not null check (
    goal_type in ('monthly_revenue', 'appointments_count', 'client_satisfaction', 'subscription_sales')
  ),
  target_value numeric(10, 2) not null,
  current_value numeric(10, 2) default 0,
  period_start date not null,
  period_end date not null,
  achieved boolean default false,
  bonus_amount numeric(10, 2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.barbeiro_goals enable row level security;
grant select, insert, update on public.barbeiro_goals to authenticated;
create index if not exists idx_barbeiro_goals_barbeiro_id
  on public.barbeiro_goals (barbeiro_id);

do $migration$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.barbeiro_goals'::regclass
      and tgname = 'update_barbeiro_goals_updated_at'
      and not tgisinternal
  ) then
    create trigger update_barbeiro_goals_updated_at
      before update on public.barbeiro_goals
      for each row execute function public.update_updated_at_column();
  end if;
end;
$migration$;
