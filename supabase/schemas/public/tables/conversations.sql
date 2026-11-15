CREATE TABLE "public"."conversations" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "participant_id"  uuid                     NOT NULL,
  "title"           text,
  "last_message"    text,
  "last_message_at" timestamp with time zone DEFAULT now(),
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "conversations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."conversations"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX conversations_business_participant_uidx ON public.conversations USING btree (user_id, participant_id);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can create conversations" ON "public"."conversations"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their conversations" ON "public"."conversations"
  FOR UPDATE
  TO PUBLIC
  USING (((auth.uid() = user_id) OR (auth.uid() = participant_id)));

CREATE POLICY "Users can view conversations they participate in" ON "public"."conversations"
  FOR SELECT
  TO PUBLIC
  USING (((auth.uid() = user_id) OR (auth.uid() = participant_id)));

CREATE POLICY "conversations_staff_manage" ON "public"."conversations"
  FOR ALL
  TO "authenticated"
  USING ((user_id = public.current_business_id()))
  WITH CHECK ((user_id = public.current_business_id()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversations" TO "authenticated", "postgres", "service_role";
