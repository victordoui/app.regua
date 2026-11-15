CREATE POLICY "Authorized users can manage appointment result photos" ON "storage"."objects"
  FOR ALL
  TO "authenticated"
  USING (((bucket_id = 'appointment-photos'::text) AND (EXISTS ( SELECT 1
   FROM (public.appointments a
     LEFT JOIN public.profiles p ON ((p.id = a.barbeiro_id)))
  WHERE (((a.id)::text = (storage.foldername(objects.name))[2]) AND ((a.user_id = auth.uid()) OR (p.user_id = auth.uid())))))))
  WITH CHECK (((bucket_id = 'appointment-photos'::text) AND (EXISTS ( SELECT 1
   FROM (public.appointments a
     LEFT JOIN public.profiles p ON ((p.id = a.barbeiro_id)))
  WHERE (((a.id)::text = (storage.foldername(objects.name))[2]) AND ((a.user_id = auth.uid()) OR (p.user_id = auth.uid())))))));

CREATE POLICY "Owners can delete public assets" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'public-assets'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY "Owners can update public assets" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'public-assets'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
  WITH CHECK (((bucket_id = 'public-assets'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY "Owners can upload public assets" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'public-assets'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY "Users can delete their gallery images" ON "storage"."objects"
  FOR DELETE
  TO PUBLIC
  USING (((bucket_id = 'gallery'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));

CREATE POLICY "Users can update their gallery images" ON "storage"."objects"
  FOR UPDATE
  TO PUBLIC
  USING (((bucket_id = 'gallery'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));

CREATE POLICY "Users can upload gallery images" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'gallery'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
