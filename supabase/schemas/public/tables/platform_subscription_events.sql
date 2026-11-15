CREATE TABLE "public"."platform_subscription_events" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id"     uuid                     NOT NULL,
  "user_id"             uuid                     NOT NULL,
  "event_type"          text                     NOT NULL,
  "previous_plan_type"  text,
  "plan_type"           text                     NOT NULL,
  "previous_status"     text,
  "status"              text                     NOT NULL,
  "previous_end_date"   timestamp with time zone,
  "end_date"            timestamp with time zone,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "source"              text                     NOT NULL DEFAULT 'database_trigger'::text,
  CONSTRAINT "platform_subscription_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "platform_subscription_events_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public.platform_subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT "platform_subscription_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "platform_subscription_events_event_type_check" CHECK (event_type = ANY (ARRAY['created'::text, 'snapshot'::text, 'plan_changed'::text, 'status_changed'::text, 'renewed'::text))
);

ALTER TABLE "public"."platform_subscription_events" ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_platform_subscription_events_created ON public.platform_subscription_events USING btree (created_at DESC);
CREATE INDEX idx_platform_subscription_events_user ON public.platform_subscription_events USING btree (user_id, created_at DESC);
CREATE INDEX idx_platform_subscription_events_type ON public.platform_subscription_events USING btree (event_type, created_at DESC);

CREATE POLICY "Super admins can view platform subscription events" ON public.platform_subscription_events
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'super_admin'));

GRANT SELECT ON TABLE "public"."platform_subscription_events" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_subscription_events" TO "service_role";
