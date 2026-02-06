-- Adicionar constraint unique na tabela user_roles se não existir
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);