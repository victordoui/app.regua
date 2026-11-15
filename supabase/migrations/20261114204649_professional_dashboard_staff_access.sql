-- A equipe só acessa os agendamentos do próprio profissional.
-- Administradores delegados continuam gerenciando toda a agenda da empresa.
drop policy if exists appointments_staff_manage on public.appointments;
create policy appointments_staff_manage
on public.appointments
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.profiles p
      on p.id = ur.profile_id
     and p.user_id = ur.barbershop_user_id
     and p.auth_user_id = ur.user_id
     and p.active = true
    where ur.user_id = (select auth.uid())
      and ur.barbershop_user_id = appointments.user_id
      and (
        ur.role = 'admin'
        or (ur.role = 'barbeiro' and ur.profile_id = appointments.barbeiro_id)
      )
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    join public.profiles p
      on p.id = ur.profile_id
     and p.user_id = ur.barbershop_user_id
     and p.auth_user_id = ur.user_id
     and p.active = true
    where ur.user_id = (select auth.uid())
      and ur.barbershop_user_id = appointments.user_id
      and (
        ur.role = 'admin'
        or (ur.role = 'barbeiro' and ur.profile_id = appointments.barbeiro_id)
      )
  )
);

-- O acesso é restrito ao próprio perfil do profissional nas tabelas financeiras.
drop policy if exists barber_shifts_staff_read_own on public.barber_shifts;
create policy barber_shifts_staff_read_own
on public.barber_shifts
for select
to authenticated
using (
  user_id = public.current_business_id()
  and exists (
    select 1 from public.user_roles ur
    join public.profiles p
      on p.id = ur.profile_id
     and p.user_id = ur.barbershop_user_id
     and p.auth_user_id = ur.user_id
     and p.active = true
    where ur.user_id = (select auth.uid())
      and ur.role = 'barbeiro'
      and ur.barbershop_user_id = barber_shifts.user_id
      and ur.profile_id = barber_shifts.barber_id
  )
);

drop policy if exists commissions_staff_read_own on public.commissions;
create policy commissions_staff_read_own
on public.commissions
for select
to authenticated
using (
  user_id = public.current_business_id()
  and exists (
    select 1 from public.user_roles ur
    join public.profiles p
      on p.id = ur.profile_id
     and p.user_id = ur.barbershop_user_id
     and p.auth_user_id = ur.user_id
     and p.active = true
    where ur.user_id = (select auth.uid())
      and ur.role = 'barbeiro'
      and ur.barbershop_user_id = commissions.user_id
      and ur.profile_id = commissions.barber_id
  )
);

drop policy if exists barbeiro_goals_staff_read_own on public.barbeiro_goals;
create policy barbeiro_goals_staff_read_own
on public.barbeiro_goals
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'barbeiro'
      and ur.profile_id = barbeiro_goals.barbeiro_id
  )
);

drop policy if exists barbeiro_goals_staff_insert_own on public.barbeiro_goals;
create policy barbeiro_goals_staff_insert_own
on public.barbeiro_goals
for insert
to authenticated
with check (
  goal_type = 'monthly_revenue'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'barbeiro'
      and ur.profile_id = barbeiro_goals.barbeiro_id
  )
);

drop policy if exists barbeiro_goals_staff_update_own on public.barbeiro_goals;
create policy barbeiro_goals_staff_update_own
on public.barbeiro_goals
for update
to authenticated
using (
  goal_type = 'monthly_revenue'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'barbeiro'
      and ur.profile_id = barbeiro_goals.barbeiro_id
  )
)
with check (
  goal_type = 'monthly_revenue'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'barbeiro'
      and ur.profile_id = barbeiro_goals.barbeiro_id
  )
);
