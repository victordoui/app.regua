

# Plano: Atribuir Role de Super Admin ao Usuario

## Problema Identificado

O usuario `superadmin@naregua.com` existe no banco de dados, mas **nao possui a role `super_admin`** atribuida na tabela `user_roles`. Por isso, ao clicar no botao "Super" na tela de login:

1. O login e feito com sucesso (autenticacao funciona)
2. O `RoleContext` busca as roles do usuario na tabela `user_roles`
3. Nao encontra nenhuma role `super_admin`
4. O `ProtectedRoute` redireciona o usuario de volta para `/` porque ele nao tem permissao

## Solucao

Criar uma migracao SQL para inserir a role `super_admin` na tabela `user_roles` para o usuario `superadmin@naregua.com`.

---

## Migracao SQL

```sql
-- Atribuir role super_admin ao usuario superadmin@naregua.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'superadmin@naregua.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Tambem atribuir roles aos outros usuarios de teste
-- Admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@naregua.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Barbeiro
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'barbeiro'::app_role
FROM auth.users
WHERE email = 'barbeiro@naregua.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Resultado Esperado

Apos a migracao:

| Usuario | Role |
|---------|------|
| superadmin@naregua.com | super_admin |
| admin@naregua.com | admin |
| barbeiro@naregua.com | barbeiro |

---

## Fluxo Corrigido

1. Usuario clica em "Super" na tela de login
2. Login com `superadmin@naregua.com` / `superadmin123456`
3. `RoleContext` encontra role `super_admin` na tabela `user_roles`
4. Usuario e redirecionado para `/superadmin` (Dashboard Super Admin)
5. `SuperAdminSidebar` e exibida com todas as opcoes de gestao da plataforma

---

## Resumo Tecnico

- **1 migracao SQL**: Inserir roles para usuarios de teste
- **Sem alteracoes de codigo**: A logica ja existe, apenas faltavam os dados

