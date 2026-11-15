CREATE TABLE "public"."sale_items" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "sale_id"     uuid                     NOT NULL,
  "product_id"  uuid,
  "service_id"  uuid,
  "item_name"   text                     NOT NULL,
  "quantity"    integer                  NOT NULL,
  "unit_price"  numeric(10,2)            NOT NULL,
  "total_price" numeric(10,2)            NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "sale_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
  CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE,
  CONSTRAINT "sale_items_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL
);

ALTER TABLE "public"."sale_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_sale_items_updated_at
  BEFORE UPDATE ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Owners can delete their sale items" ON "public"."sale_items"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.sales
  WHERE ((sales.id = sale_items.sale_id) AND (sales.user_id = auth.uid())))));

CREATE POLICY "Owners can insert their sale items" ON "public"."sale_items"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.sales
  WHERE ((sales.id = sale_items.sale_id) AND (sales.user_id = auth.uid())))));

CREATE POLICY "Owners can update their sale items" ON "public"."sale_items"
  FOR UPDATE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.sales
  WHERE ((sales.id = sale_items.sale_id) AND (sales.user_id = auth.uid())))));

CREATE POLICY "Owners can view their sale items" ON "public"."sale_items"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.sales
  WHERE ((sales.id = sale_items.sale_id) AND (sales.user_id = auth.uid())))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sale_items" TO "authenticated", "postgres", "service_role";
