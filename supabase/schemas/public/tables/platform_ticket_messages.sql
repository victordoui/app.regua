CREATE TABLE "public"."platform_ticket_messages" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "ticket_id"   uuid                     NOT NULL,
  "sender_id"   uuid                     NOT NULL,
  "message"     text                     NOT NULL,
  "is_internal" boolean                  DEFAULT false,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "platform_ticket_messages_pkey" PRIMARY KEY (id),
  CONSTRAINT "platform_ticket_messages_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES public.platform_support_tickets(id) ON DELETE CASCADE
);

ALTER TABLE "public"."platform_ticket_messages"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all ticket messages" ON "public"."platform_ticket_messages"
  FOR ALL
  TO PUBLIC
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can add messages to their tickets" ON "public"."platform_ticket_messages"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((is_internal = false) AND (EXISTS ( SELECT 1
   FROM public.platform_support_tickets
  WHERE ((platform_support_tickets.id = platform_ticket_messages.ticket_id) AND (platform_support_tickets.user_id = auth.uid()))))));

CREATE POLICY "Users can view non-internal messages on their tickets" ON "public"."platform_ticket_messages"
  FOR SELECT
  TO PUBLIC
  USING (((is_internal = false) AND (EXISTS ( SELECT 1
   FROM public.platform_support_tickets
  WHERE ((platform_support_tickets.id = platform_ticket_messages.ticket_id) AND (platform_support_tickets.user_id = auth.uid()))))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_ticket_messages" TO "authenticated", "postgres", "service_role";
