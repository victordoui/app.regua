

# Plano: Dashboard Super Admin Completo com Metricas de Usuarios

## Objetivo
Transformar o Dashboard do Super Admin em um painel completo que mostre todas as informacoes sobre usuarios cadastrados, assinaturas, trials, roles e status geral da plataforma. Tambem adicionar configuracao dinamica do periodo de trial e corrigir a visibilidade de usuarios "orfaos" (sem perfil completo).

---

## O que sera implementado

### 1. Novo hook `usePlatformUsers` para buscar dados completos
Criar um hook que consulta `profiles`, `user_roles` e `platform_subscriptions` para montar uma visao completa de todos os usuarios do sistema, incluindo:
- Nome, email, avatar
- Role atribuida (super_admin, admin, barber, client)
- Status da assinatura e plano
- Data de cadastro
- Usuarios sem perfil completo (orfaos)

### 2. Dashboard Super Admin aprimorado
Adicionar novas metricas ao dashboard existente:
- **Total de usuarios cadastrados** (da tabela `profiles`)
- **Usuarios por role** (admin, barbeiro, cliente, super_admin)
- **Assinaturas ativas vs trial vs pagas**
- **Periodo de trial** (exibir quantos dias o trial possui)
- **Usuarios sem perfil completo** (alerta)
- **Novos cadastros este mes**

Os cards existentes serao mantidos e novos cards serao adicionados abaixo, junto com uma tabela resumo dos usuarios recentes.

### 3. Coluna `trial_days` na tabela `platform_plan_config`
Adicionar via migracao uma coluna `trial_days INTEGER DEFAULT 14` para que o periodo de teste seja configuravel pelo Super Admin na pagina de Planos e Precos, ao inves de hardcoded no SQL.

### 4. Pagina de Usuarios do Sistema (nova rota `/superadmin/users`)
Criar uma pagina dedicada com tabela listando todos os usuarios, com:
- Nome, email, role, plano, status da assinatura
- Filtros por role e status
- Busca por nome/email
- Indicacao visual de usuarios com cadastro incompleto

### 5. Atualizacao do Sidebar
Adicionar link "Usuarios do Sistema" no grupo "Visao Geral" do sidebar do Super Admin.

---

## Detalhes Tecnicos

### Migracao SQL
```sql
ALTER TABLE platform_plan_config 
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14;
```

### Novo hook: `src/hooks/superadmin/usePlatformUsers.ts`
- Consulta `profiles` com join em `user_roles` e `platform_subscriptions`
- Retorna contagens por role, por status, usuarios recentes e orfaos
- Exporta stats agregadas para uso no dashboard

### Arquivos modificados
- `src/pages/superadmin/SuperAdminDashboard.tsx` - Adicionar novos cards de metricas e tabela de usuarios recentes
- `src/components/superadmin/SuperAdminSidebar.tsx` - Adicionar link para nova pagina de usuarios
- `src/hooks/superadmin/usePlanConfig.ts` - Incluir `trial_days` nos tipos e mutacoes
- `src/types/superAdmin.ts` - Adicionar `trial_days` ao tipo `PlanConfig` e `PlanConfigFormData`
- `src/integrations/supabase/types.ts` - Atualizar tipos gerados

### Novos arquivos
- `src/hooks/superadmin/usePlatformUsers.ts` - Hook para dados de usuarios
- `src/pages/superadmin/SystemUsers.tsx` - Nova pagina de usuarios do sistema

### Rota
- Adicionar `/superadmin/users` no `App.tsx`

