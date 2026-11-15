CREATE TABLE "public"."platform_payments" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id"   uuid,
  "user_id"           uuid                     NOT NULL,
  "amount"            numeric                  NOT NULL,
  "payment_method"    text,
  "status"            text                     DEFAULT 'pending'::text,
  "invoice_url"       text,
  "paid_at"           timestamp with time zone,
  "created_at"        timestamp with time zone DEFAULT now(),
  "provider_event_id" text,
  CONSTRAINT "platform_payments_pkey" PRIMARY KEY (id),
  CONSTRAINT "platform_payments_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public.platform_subscriptions(id) ON DELETE CASCADE
);

ALTER TABLE "public"."platform_payments"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX platform_payments_provider_event_id_key ON public.platform_payments USING btree (provider_event_id)
  WHERE (provider_event_id IS NOT NULL);

CREATE POLICY "Super admins can manage platform payments" ON "public"."platform_payments"
  FOR ALL
  TO PUBLIC
  USING (public.is_super_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."platform_payments" TO "authenticated", "postgres", "service_role";
