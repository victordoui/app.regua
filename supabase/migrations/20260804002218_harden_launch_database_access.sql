-- Launch security hardening: anonymous access is limited to the public booking
-- catalog. Business and customer data remain available only to authenticated,
-- authorized users through RLS.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- These resources are intentionally shown on the public booking page. RLS
-- policies further limit the rows that are returned.
GRANT SELECT ON TABLE public.barbershop_settings TO anon;
GRANT SELECT ON TABLE public.business_hours TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.services TO anon;
GRANT SELECT ON TABLE public.gallery TO anon;
GRANT SELECT ON TABLE public.discount_coupons TO anon;
GRANT SELECT ON TABLE public.loyalty_rewards TO anon;
GRANT SELECT ON TABLE public.reviews TO anon;
GRANT SELECT ON TABLE public.service_combos TO anon;
GRANT SELECT ON TABLE public.service_combo_items TO anon;

-- Legacy objects are not used by the application. Remove their externally
-- callable surface and the test function that can block a database worker.
REVOKE ALL ON TABLE public.atualizar FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.inserir_3x_e_parar();

-- Public buckets can serve known asset URLs without allowing anonymous object
-- enumeration. Upload, update and deletion must be tied to the owner's folder.
DROP POLICY IF EXISTS "Allow public read access to public-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert to public-assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload public assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update public assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete public assets" ON storage.objects;

CREATE POLICY "Owners can upload public assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'public-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can update public assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'public-assets' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'public-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete public assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'public-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload appointment photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete appointment photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view appointment photos" ON storage.objects;

CREATE POLICY "Authorized users can manage appointment result photos"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'appointment-photos'
  AND EXISTS (
    SELECT 1 FROM public.appointments a
    LEFT JOIN public.profiles p ON p.id = a.barbeiro_id
    WHERE a.id::text = (storage.foldername(name))[2]
      AND (a.user_id = auth.uid() OR p.user_id = auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'appointment-photos'
  AND EXISTS (
    SELECT 1 FROM public.appointments a
    LEFT JOIN public.profiles p ON p.id = a.barbeiro_id
    WHERE a.id::text = (storage.foldername(name))[2]
      AND (a.user_id = auth.uid() OR p.user_id = auth.uid())
  )
);
