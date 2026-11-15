-- Clientes autenticados só podem ler pagamentos vinculados aos próprios atendimentos.
grant select on public.payments to authenticated;
drop policy if exists payments_client_read_own on public.payments;
create policy payments_client_read_own
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.appointments a
    join public.client_profiles cp
      on cp.client_id = a.client_id
     and cp.barbershop_user_id = a.user_id
    where a.id = payments.appointment_id
      and payments.user_id = a.user_id
      and cp.user_id = (select auth.uid())
  )
);

-- Pontos de fidelidade pertencem ao cliente autenticado e à empresa do vínculo.
grant select on public.loyalty_points to authenticated;
drop policy if exists loyalty_points_client_read_own on public.loyalty_points;
create policy loyalty_points_client_read_own
on public.loyalty_points
for select
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.client_id = loyalty_points.client_id
      and cp.barbershop_user_id = loyalty_points.user_id
      and cp.user_id = (select auth.uid())
  )
);

-- O cliente vê somente as avaliações ligadas aos seus próprios atendimentos.
grant select, insert on public.reviews to authenticated;
drop policy if exists reviews_client_read_own_appointment on public.reviews;
create policy reviews_client_read_own_appointment
on public.reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.appointments a
    join public.client_profiles cp
      on cp.client_id = a.client_id
     and cp.barbershop_user_id = a.user_id
    where a.id = reviews.appointment_id
      and reviews.user_id = a.user_id
      and reviews.client_id = a.client_id
      and cp.user_id = (select auth.uid())
  )
);

-- Só o titular vinculado pode avaliar um atendimento concluído.
drop policy if exists reviews_client_insert_completed_appointment on public.reviews;
create policy reviews_client_insert_completed_appointment
on public.reviews
for insert
to authenticated
with check (
  appointment_id is not null
  and client_id is not null
  and length(coalesce(comment, '')) <= 500
  and exists (
    select 1
    from public.appointments a
    join public.client_profiles cp
      on cp.client_id = a.client_id
     and cp.barbershop_user_id = a.user_id
    where a.id = reviews.appointment_id
      and a.status = 'completed'
      and a.user_id = reviews.user_id
      and a.client_id = reviews.client_id
      and a.barbeiro_id is not distinct from reviews.barber_id
      and cp.user_id = (select auth.uid())
  )
);

create index if not exists idx_reviews_appointment_client
  on public.reviews(appointment_id, client_id);
