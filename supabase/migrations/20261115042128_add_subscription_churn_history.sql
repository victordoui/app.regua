alter table public.platform_subscription_events
  add column if not exists previous_end_date timestamptz,
  add column if not exists end_date timestamptz;

alter table public.platform_subscription_events
  drop constraint if exists platform_subscription_events_event_type_check;

alter table public.platform_subscription_events
  add constraint platform_subscription_events_event_type_check
  check (event_type in ('created', 'snapshot', 'plan_changed', 'status_changed', 'renewed'));

insert into public.platform_subscription_events (
  subscription_id,
  user_id,
  event_type,
  plan_type,
  status,
  end_date,
  created_at,
  source
)
select
  subscription.id,
  subscription.user_id,
  'snapshot',
  subscription.plan_type,
  subscription.status,
  subscription.end_date,
  transaction_timestamp(),
  'migration_snapshot'
from public.platform_subscriptions as subscription
where not exists (
  select 1
  from public.platform_subscription_events as event
  where event.subscription_id = subscription.id
    and event.event_type = 'snapshot'
)
and exists (
  select 1
  from auth.users as auth_user
  where auth_user.id = subscription.user_id
);

update public.platform_subscription_events as event
set
  created_at = transaction_timestamp(),
  end_date = subscription.end_date
from public.platform_subscriptions as subscription
where event.subscription_id = subscription.id
  and event.event_type = 'snapshot'
  and event.source = 'migration_snapshot';

create or replace function public.log_platform_subscription_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, plan_type, status, end_date, created_at
    ) values (
      new.id, new.user_id, 'created', new.plan_type, new.status, new.end_date, coalesce(new.created_at, now())
    );
    return new;
  end if;

  if old.plan_type is distinct from new.plan_type then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, previous_plan_type, plan_type,
      previous_status, status, previous_end_date, end_date
    ) values (
      new.id, new.user_id, 'plan_changed', old.plan_type, new.plan_type,
      old.status, new.status, old.end_date, new.end_date
    );
  end if;

  if old.status is distinct from new.status then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, previous_plan_type, plan_type,
      previous_status, status, previous_end_date, end_date
    ) values (
      new.id, new.user_id, 'status_changed', old.plan_type, new.plan_type,
      old.status, new.status, old.end_date, new.end_date
    );
  end if;

  if old.end_date is distinct from new.end_date then
    insert into public.platform_subscription_events (
      subscription_id, user_id, event_type, previous_plan_type, plan_type,
      previous_status, status, previous_end_date, end_date
    ) values (
      new.id, new.user_id, 'renewed', old.plan_type, new.plan_type,
      old.status, new.status, old.end_date, new.end_date
    );
  end if;

  return new;
end;
$$;

revoke all on function public.log_platform_subscription_event() from public, anon, authenticated;

drop trigger if exists log_platform_subscription_event on public.platform_subscriptions;
create trigger log_platform_subscription_event
after insert or update of plan_type, status, end_date on public.platform_subscriptions
for each row execute function public.log_platform_subscription_event();
