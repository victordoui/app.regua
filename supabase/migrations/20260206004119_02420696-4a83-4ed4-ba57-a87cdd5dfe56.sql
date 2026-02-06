-- 1. Remover a politica problemática que causa recursão infinita
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 2. Criar nova politica para administradores usando has_role() com SECURITY DEFINER
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);