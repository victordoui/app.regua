CREATE TABLE "public"."gift_cards" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "code"            text                     NOT NULL,
  "original_value"  numeric(10,2)            NOT NULL,
  "current_balance" numeric(10,2)            NOT NULL,
  "buyer_name"      text,
  "buyer_email"     text,
  "recipient_name"  text,
  "recipient_email" text,
  "message"         text,
  "expires_at"      timestamp with time zone,
  "redeemed_at"     timestamp with time zone,
  "status"          text                     NOT NULL DEFAULT 'active'::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gift_cards_code_key" UNIQUE (code),
  CONSTRAINT "gift_cards_pkey" PRIMARY KEY (id),
  CONSTRAINT "gift_cards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."gift_cards"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_gift_cards_code ON public.gift_cards USING btree (code);

CREATE INDEX idx_gift_cards_recipient_email ON public.gift_cards USING btree (recipient_email);

CREATE INDEX idx_gift_cards_status ON public.gift_cards USING btree (status);

CREATE INDEX idx_gift_cards_user_id ON public.gift_cards USING btree (user_id);

CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can delete their own gift cards" ON "public"."gift_cards"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own gift cards" ON "public"."gift_cards"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own gift cards" ON "public"."gift_cards"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own gift cards" ON "public"."gift_cards"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."gift_cards" TO "authenticated", "postgres", "service_role";
