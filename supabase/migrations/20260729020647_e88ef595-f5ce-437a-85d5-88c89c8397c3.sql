CREATE POLICY "profiles_super_admin_read"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));