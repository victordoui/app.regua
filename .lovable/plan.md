
# Plano: Sistema Super Admin - Controle Total do Na Régua

## Visão Geral da Arquitetura

O sistema terá 3 níveis hierárquicos:

```text
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN (Você)                       │
│         Controle total do sistema Na Régua                  │
│   - Gerenciar assinantes (donos de barbearias)              │
│   - Criar cupons globais                                    │
│   - Banir/remover usuários                                  │
│   - Ver métricas de todas as barbearias                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                ADMIN (Donos de Barbearia)                   │
│         Gerencia sua própria barbearia                      │
│   - Barbeiros, serviços, agendamentos                       │
│   - Clientes da sua barbearia                               │
│   - Financeiro, relatórios                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│      BARBEIRO / CLIENTE                                     │
│         Roles existentes (sem mudanças)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Migração de Banco de Dados

Adicionar `super_admin` ao enum `app_role` e criar tabelas de controle:

```sql
-- Adicionar novo role ao enum
ALTER TYPE public.app_role ADD VALUE 'super_admin';

-- Tabela de assinaturas do sistema (donos de barbearia)
CREATE TABLE public.platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan_type TEXT NOT NULL DEFAULT 'trial', -- trial, basic, pro, enterprise
    status TEXT NOT NULL DEFAULT 'active', -- active, suspended, cancelled, expired
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    max_barbers INT DEFAULT 3,
    max_appointments_month INT DEFAULT 100,
    features JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cupons globais do sistema
CREATE TABLE public.platform_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL, -- percentage, fixed
    discount_value NUMERIC NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    max_uses INT,
    current_uses INT DEFAULT 0,
    applicable_plans TEXT[], -- ['basic', 'pro', 'enterprise']
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs de ações do super admin
CREATE TABLE public.platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL, -- ban_user, suspend_subscription, create_coupon, etc.
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_platform_subscriptions_user ON platform_subscriptions(user_id);
CREATE INDEX idx_platform_subscriptions_status ON platform_subscriptions(status);
CREATE INDEX idx_platform_coupons_code ON platform_coupons(code);
CREATE INDEX idx_platform_audit_logs_admin ON platform_audit_logs(super_admin_id);

-- RLS
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas super_admin pode gerenciar
CREATE POLICY "Super admins can manage platform_subscriptions"
ON platform_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage platform_coupons"
ON platform_coupons FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view audit logs"
ON platform_audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;
```

---

## 2. Novos Arquivos a Criar

### Tipos TypeScript
**`src/types/superAdmin.ts`**
- `PlatformSubscription` - Assinaturas dos donos de barbearia
- `PlatformCoupon` - Cupons globais
- `AuditLog` - Logs de auditoria
- `SubscriptionStats` - Estatísticas do sistema

### Hook Principal
**`src/hooks/useSuperAdmin.ts`**
- `useSubscribers()` - CRUD de assinantes
- `usePlatformCoupons()` - CRUD de cupons
- `useAuditLogs()` - Visualizar logs
- `usePlatformStats()` - Métricas globais
- Funções: `banUser`, `suspendSubscription`, `renewSubscription`, `deleteUser`

### Contexto de Role
**`src/contexts/RoleContext.tsx`**
- Verificar role do usuário logado
- Disponibilizar `isSuperAdmin`, `isAdmin`, `isBarbeiro`
- Gerenciar redirecionamento baseado em role

### Páginas Super Admin
**`src/pages/superadmin/SuperAdminDashboard.tsx`**
- Métricas globais: total de barbearias, receita, crescimento
- Gráficos de assinaturas ativas/canceladas
- Alertas de assinaturas expirando

**`src/pages/superadmin/SubscribersManagement.tsx`**
- Listagem de todos os donos de barbearia
- Filtros: status, plano, data de expiração
- Ações: renovar, suspender, banir, excluir

**`src/pages/superadmin/PlatformCoupons.tsx`**
- CRUD de cupons globais
- Estatísticas de uso

**`src/pages/superadmin/AuditLogs.tsx`**
- Histórico de ações realizadas
- Filtros por data, ação, usuário

### Componentes
**`src/components/superadmin/SubscriberCard.tsx`**
- Card com info do assinante
- Botões de ação rápida

**`src/components/superadmin/SuperAdminSidebar.tsx`**
- Menu lateral específico para super admin

**`src/components/superadmin/SubscriberDetailsDialog.tsx`**
- Modal com detalhes completos do assinante
- Histórico de pagamentos
- Métricas da barbearia

---

## 3. Modificações em Arquivos Existentes

### `src/integrations/supabase/types.ts`
- Adicionar `'super_admin'` ao tipo `app_role`
- Adicionar interfaces das novas tabelas

### `src/pages/Login.tsx`
- Adicionar botão "Super Admin" na área de login rápido
- Estilizar com ícone diferenciado (Shield ou Star)

### `src/App.tsx`
- Adicionar rotas `/superadmin/*` protegidas
- Criar `SuperAdminRoute` que verifica role

### `src/components/ProtectedRoute.tsx`
- Adicionar prop opcional `requiredRole`
- Verificar role e redirecionar se não autorizado

### `src/contexts/AuthContext.tsx`
- Carregar role do usuário junto com sessão
- Expor `userRole` no contexto

---

## 4. Fluxo de Navegação

```text
Login
  │
  ├── Super Admin → /superadmin/dashboard
  │                  ├── /superadmin/subscribers
  │                  ├── /superadmin/coupons
  │                  └── /superadmin/logs
  │
  ├── Admin (Dono) → / (Dashboard atual)
  │                   └── Rotas existentes
  │
  └── Barbeiro → / (Dashboard limitado)
                 └── Rotas permitidas
```

---

## 5. Interface do Super Admin

### Dashboard
- Cards: Total Barbearias, Receita Mensal, Novos Assinantes, Churn Rate
- Gráfico de crescimento de assinantes
- Lista de assinaturas expirando em 7 dias
- Alertas de problemas

### Gestão de Assinantes
| Campo | Descrição |
|-------|-----------|
| Barbearia | Nome da empresa |
| Dono | Nome do proprietário |
| Plano | trial/basic/pro/enterprise |
| Status | active/suspended/cancelled/expired |
| Validade | Data de expiração |
| Ações | Renovar, Suspender, Banir, Excluir |

### Ações Disponíveis
1. **Renovar**: Estender data de expiração
2. **Suspender**: Bloquear acesso temporariamente
3. **Banir**: Bloquear permanentemente + marcar motivo
4. **Excluir**: Remover usuário e dados (com confirmação)
5. **Editar Plano**: Upgrade/downgrade de recursos

---

## 6. Ordem de Implementação

| Etapa | Descrição |
|-------|-----------|
| 1 | Migração SQL (enum + tabelas + RLS) |
| 2 | Tipos TypeScript |
| 3 | RoleContext + modificar AuthContext |
| 4 | Hook useSuperAdmin |
| 5 | SuperAdminRoute + modificar ProtectedRoute |
| 6 | SuperAdminSidebar |
| 7 | SuperAdminDashboard |
| 8 | SubscribersManagement + SubscriberCard |
| 9 | PlatformCoupons |
| 10 | AuditLogs |
| 11 | Botão Super Admin no Login.tsx |
| 12 | Rotas no App.tsx |
| 13 | Seed inicial (criar seu usuário como super_admin) |

---

## Resumo Técnico

- **Novo enum value**: `super_admin` adicionado a `app_role`
- **3 novas tabelas**: `platform_subscriptions`, `platform_coupons`, `platform_audit_logs`
- **~12 novos arquivos**: tipos, hooks, contextos, páginas, componentes
- **~6 arquivos modificados**: types, Login, App, ProtectedRoute, AuthContext, Sidebar
- **RLS configurado**: Apenas super_admin pode acessar tabelas de plataforma
