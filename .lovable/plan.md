
# Plano: Corrigir Recursao Infinita nas Politicas RLS da Tabela user_roles

## Problema Identificado

A requisicao para buscar as roles do usuario retorna erro **500** com a mensagem:

```
"infinite recursion detected in policy for relation 'user_roles'"
```

### Causa Raiz

A politica **"Admins can manage roles"** na tabela `user_roles` esta configurada assim:

```sql
EXISTS (
  SELECT 1 FROM user_roles user_roles_1
  WHERE user_roles_1.user_id = auth.uid() 
  AND user_roles_1.role = 'admin'::app_role
)
```

**Fluxo da recursao:**
1. Usuario tenta consultar `user_roles`
2. RLS verifica a politica "Admins can manage roles"
3. A politica faz SELECT na propria tabela `user_roles`
4. Esse SELECT dispara novamente a verificacao de RLS
5. Volta ao passo 2 → **RECURSAO INFINITA**

---

## Solucao

Substituir a politica problemática por uma que use a funcao `has_role()` (que ja existe no banco com `SECURITY DEFINER`), permitindo bypass do RLS durante a verificacao.

Tambem vou adicionar permissao para `super_admin` gerenciar roles.

---

## Migracao SQL

```sql
-- 1. Remover a politica problemática
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 2. Criar nova politica para administradores usando has_role()
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

-- 3. Manter a politica existente para usuarios verem suas proprias roles
-- (ja existe e funciona corretamente)
-- "Users can view their own roles" - USING (auth.uid() = user_id)
```

---

## Resultado Esperado

Apos a correcao:

| Acao | Permissao |
|------|-----------|
| Usuario ve suas proprias roles | Permitido (politica existente) |
| Admin gerencia todas as roles | Permitido (nova politica) |
| Super Admin gerencia todas as roles | Permitido (nova politica) |

---

## Fluxo Corrigido

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICACAO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Usuario faz login como superadmin@naregua.com               │
│                           │                                     │
│                           ▼                                     │
│  2. RoleContext consulta user_roles                             │
│                           │                                     │
│                           ▼                                     │
│  3. RLS verifica politica "Users can view their own roles"      │
│     → auth.uid() = user_id? SIM                                 │
│                           │                                     │
│                           ▼                                     │
│  4. Retorna role: super_admin                                   │
│                           │                                     │
│                           ▼                                     │
│  5. ProtectedRoute verifica hasRole('super_admin')? SIM         │
│                           │                                     │
│                           ▼                                     │
│  6. Usuario acessa /superadmin com sucesso                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Resumo Tecnico

| Item | Descricao |
|------|-----------|
| Arquivos alterados | 0 (apenas migracao SQL) |
| Politica removida | "Admins can manage roles" |
| Politica criada | "Admins can manage all roles" |
| Funcao utilizada | `has_role()` com SECURITY DEFINER |
| Impacto | Corrige erro 500 e permite acesso ao Super Admin |
