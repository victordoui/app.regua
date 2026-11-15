CREATE TABLE "public"."loyalty_points" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "client_id"      uuid,
  "points"         integer                  NOT NULL DEFAULT 0,
  "total_earned"   integer                  NOT NULL DEFAULT 0,
  "total_redeemed" integer                  NOT NULL DEFAULT 0,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "loyalty_points_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  CONSTRAINT "loyalty_points_pkey" PRIMARY KEY (id),
  CONSTRAINT "loyalty_points_user_id_client_id_key" UNIQUE (user_id, client_id)
);

ALTER TABLE "public"."loyalty_points"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can manage their loyalty points" ON "public"."loyalty_points"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."loyalty_points" TO "authenticated", "postgres", "service_role";
