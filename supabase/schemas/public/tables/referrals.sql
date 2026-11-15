CREATE TABLE "public"."referrals" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"            uuid                     NOT NULL,
  "referrer_client_id" uuid                     NOT NULL,
  "referred_client_id" uuid                     NOT NULL,
  "referral_code"      text                     NOT NULL,
  "reward_given"       boolean                  DEFAULT false,
  "reward_amount"      numeric,
  "created_at"         timestamp with time zone DEFAULT now(),
  CONSTRAINT "referrals_pkey" PRIMARY KEY (id),
  CONSTRAINT "referrals_referred_client_id_fkey" FOREIGN KEY (referred_client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  CONSTRAINT "referrals_referrer_client_id_fkey" FOREIGN KEY (referrer_client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

ALTER TABLE "public"."referrals"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their referrals" ON "public"."referrals"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."referrals" TO "authenticated", "postgres", "service_role";
