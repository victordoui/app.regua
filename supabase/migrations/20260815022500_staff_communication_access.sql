drop policy if exists client_profiles_staff_read on public.client_profiles;
create policy client_profiles_staff_read
on public.client_profiles
for select
to authenticated
using (barbershop_user_id = public.current_business_id());

drop policy if exists conversations_staff_manage on public.conversations;
create policy conversations_staff_manage
on public.conversations
for all
to authenticated
using (user_id = public.current_business_id())
with check (user_id = public.current_business_id());

drop policy if exists messages_staff_read on public.messages;
create policy messages_staff_read
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = public.current_business_id()
  )
);

drop policy if exists messages_staff_insert on public.messages;
create policy messages_staff_insert
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.user_id = public.current_business_id()
  )
);

create unique index if not exists conversations_business_participant_uidx
  on public.conversations (user_id, participant_id);
