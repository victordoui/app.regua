CREATE TABLE "public"."stock_movements" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "product_id" uuid,
  "type"       text                     NOT NULL,
  "quantity"   integer                  NOT NULL,
  "reason"     text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY (id),
  CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT "stock_movements_type_check" CHECK ((type = ANY (ARRAY['in'::text, 'out'::text])))
);

ALTER TABLE "public"."stock_movements"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their stock movements" ON "public"."stock_movements"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."stock_movements" TO "authenticated", "postgres", "service_role";
