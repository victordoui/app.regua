-- Inserir roles para os usuários de teste
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('1bb82282-b952-42c8-acd3-f09d67da5d3f', 'super_admin'::app_role),
  ('7aca9a68-a3fc-4c8c-a1fc-fd7039c0e6c8', 'admin'::app_role),
  ('62b04ab1-0f57-43cc-96f8-5bc892f44676', 'barbeiro'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;