CREATE TABLE "public"."user_subscriptions" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           uuid                     NOT NULL,
  "client_id"         uuid                     NOT NULL,
  "plan_id"           uuid                     NOT NULL,
  "start_date"        date                     NOT NULL,
  "end_date"          date                     NOT NULL,
  "credits_remaining" integer                  NOT NULL DEFAULT 0,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_subscriptions_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."user_subscriptions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_subscriptions"
  ADD COLUMN "status" public.subscription_status NOT NULL DEFAULT 'active'::public.subscription_status;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can delete their own user subscriptions" ON "public"."user_subscriptions"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own user subscriptions" ON "public"."user_subscriptions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own user subscriptions" ON "public"."user_subscriptions"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own user subscriptions" ON "public"."user_subscriptions"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_subscriptions" TO "authenticated", "postgres", "service_role";
