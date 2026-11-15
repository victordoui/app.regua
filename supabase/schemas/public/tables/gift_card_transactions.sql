CREATE TABLE "public"."gift_card_transactions" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "gift_card_id"   uuid                     NOT NULL,
  "user_id"        uuid                     NOT NULL,
  "amount"         numeric(10,2)            NOT NULL,
  "type"           text                     NOT NULL,
  "appointment_id" uuid,
  "notes"          text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gift_card_transactions_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT "gift_card_transactions_pkey" PRIMARY KEY (id),
  CONSTRAINT "gift_card_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "gift_card_transactions_gift_card_id_fkey" FOREIGN KEY (gift_card_id) REFERENCES public.gift_cards(id) ON DELETE CASCADE
);

ALTER TABLE "public"."gift_card_transactions"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_gc_transactions_appointment ON public.gift_card_transactions USING btree (appointment_id);

CREATE INDEX idx_gc_transactions_gift_card ON public.gift_card_transactions USING btree (gift_card_id);

CREATE INDEX idx_gc_transactions_user_id ON public.gift_card_transactions USING btree (user_id);

CREATE POLICY "Users can insert their own gift card transactions" ON "public"."gift_card_transactions"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own gift card transactions" ON "public"."gift_card_transactions"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."gift_card_transactions" TO "authenticated", "postgres", "service_role";
