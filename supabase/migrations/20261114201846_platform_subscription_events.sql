create table if not exists public.platform_subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.platform_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'snapshot', 'plan_changed', 'status_changed')),
  previous_plan_type text,
  plan_type text not null,
  previous_status text,
  status text not null,
  created_at timestamptz not null default now(),
  source text not null default 'database_trigger'
);

create index if not exists idx_platform_subscription_events_created on public.platform_subscription_events (created_at desc);
create index if not exists idx_platform_subscription_events_user on public.platform_subscription_events (user_id, created_at desc);
create index if not exists idx_platform_subscription_events_type on public.platform_subscription_events (event_type, created_at desc);

alter table public.platform_subscription_events enable row level security;
revoke all on public.platform_subscription_events from anon, authenticated;
grant select on public.platform_subscription_events to authenticated;
grant all on public.platform_subscription_events to service_role;

drop policy if exists "Super admins can view platform subscription events" on public.platform_subscription_events;
create policy "Super admins can view platform subscription events"
on public.platform_subscription_events for select
to authenticated
using (public.has_role((select auth.uid()), 'super_admin'));

create or replace function public.log_platform_subscription_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, plan_type, status, created_at
    ) values (
      new.id, new.user_id, 'created', new.plan_type, new.status, coalesce(new.created_at, now())
    );
    return new;
  end if;

  if old.plan_type is distinct from new.plan_type then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, previous_plan_type, plan_type, previous_status, status
    ) values (
      new.id, new.user_id, 'plan_changed', old.plan_type, new.plan_type, old.status, new.status
    );
  end if;

  if old.status is distinct from new.status then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, previous_plan_type, plan_type, previous_status, status
    ) values (
      new.id, new.user_id, 'status_changed', old.plan_type, new.plan_type, old.status, new.status
    );
  end if;
  return new;
end;
$$;

revoke all on function public.log_platform_subscription_event() from public, anon, authenticated;

drop trigger if exists log_platform_subscription_event on public.platform_subscriptions;
create trigger log_platform_subscription_event
after insert or update of plan_type, status on public.platform_subscriptions
for each row execute function public.log_platform_subscription_event();

insert into public.platform_subscription_events (
  subscription_id, user_id, event_type, plan_type, status, created_at, source
)
select id, user_id, 'snapshot', plan_type, status, coalesce(created_at, now()), 'migration_snapshot'
from public.platform_subscriptions
where not exists (
  select 1 from public.platform_subscription_events existing
  where existing.subscription_id = platform_subscriptions.id and existing.event_type = 'snapshot'
);
