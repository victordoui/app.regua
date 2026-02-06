

# Plano: Melhorias Avançadas do Super Admin

## Visão Geral

Vamos expandir significativamente o painel Super Admin com novas funcionalidades organizadas em seções na sidebar, criando uma experiência completa de gestão da plataforma Na Régua.

## Nova Estrutura da Sidebar

```text
┌─────────────────────────────────────────┐
│  [Shield] Super Admin                   │
│  Na Régua Platform                      │
├─────────────────────────────────────────┤
│                                         │
│  VISAO GERAL                            │
│  ├── Dashboard                          │
│  └── Métricas Financeiras               │
│                                         │
│  GESTAO DE ASSINANTES                   │
│  ├── Assinantes                         │
│  ├── Assinaturas Expirando              │
│  └── Histórico de Pagamentos            │
│                                         │
│  MARKETING & COMUNICACAO                │
│  ├── Cupons da Plataforma               │
│  ├── Mensagens em Massa                 │
│  └── Templates de Email                 │
│                                         │
│  CONFIGURACOES                          │
│  ├── Planos e Preços                    │
│  └── Recursos por Plano                 │
│                                         │
│  SUPORTE                                │
│  └── Tickets de Suporte                 │
│                                         │
│  AUDITORIA                              │
│  └── Logs de Auditoria                  │
│                                         │
├─────────────────────────────────────────┤
│  [Logout] Sair                          │
└─────────────────────────────────────────┘
```

---

## 1. Migracoes de Banco de Dados

### Nova Tabela: `platform_payments`
Histórico de pagamentos dos assinantes.

```sql
CREATE TABLE public.platform_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES platform_subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_method TEXT, -- pix, credit_card, boleto
    status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
    invoice_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nova Tabela: `platform_broadcast_messages`
Mensagens em massa para assinantes.

```sql
CREATE TABLE public.platform_broadcast_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    channel TEXT NOT NULL, -- email, push, sms
    target_plans TEXT[], -- ['basic', 'pro', 'enterprise'] ou null para todos
    target_status TEXT[], -- ['active'] ou null para todos
    sent_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nova Tabela: `platform_email_templates`
Templates de email para comunicacoes automaticas.

```sql
CREATE TABLE public.platform_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    trigger_event TEXT, -- welcome, renewal_reminder, payment_failed, plan_upgrade
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nova Tabela: `platform_plan_config`
Configuracao de precos e recursos por plano.

```sql
CREATE TABLE public.platform_plan_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL UNIQUE, -- trial, basic, pro, enterprise
    display_name TEXT NOT NULL,
    price_monthly NUMERIC NOT NULL DEFAULT 0,
    price_yearly NUMERIC,
    max_barbers INT NOT NULL DEFAULT 3,
    max_appointments_month INT NOT NULL DEFAULT 100,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nova Tabela: `platform_support_tickets`
Sistema de tickets de suporte.

```sql
CREATE TABLE public.platform_support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.platform_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES platform_support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Novos Arquivos a Criar

### Tipos TypeScript
**`src/types/superAdmin.ts`** (atualizar)
- Adicionar: `PlatformPayment`, `BroadcastMessage`, `EmailTemplate`, `PlanConfig`, `SupportTicket`, `TicketMessage`
- Adicionar novos tipos de acoes de auditoria

### Novos Hooks
**`src/hooks/usePlatformPayments.ts`**
- `usePayments()` - Listar pagamentos
- `usePaymentStats()` - MRR, receita total, inadimplencia

**`src/hooks/usePlatformBroadcast.ts`**
- `useBroadcastMessages()` - CRUD de mensagens
- `sendBroadcast()` - Enviar mensagem em massa

**`src/hooks/usePlatformTemplates.ts`**
- `useEmailTemplates()` - CRUD de templates

**`src/hooks/usePlanConfig.ts`**
- `usePlanConfigs()` - CRUD de configuracoes de planos

**`src/hooks/useSupportTickets.ts`**
- `useTickets()` - CRUD de tickets
- `useTicketMessages()` - Mensagens de um ticket

### Novas Paginas
| Arquivo | Descricao |
|---------|-----------|
| `FinancialMetrics.tsx` | MRR, LTV, receita por plano, graficos de crescimento |
| `ExpiringSubscriptions.tsx` | Lista de assinaturas a vencer em 7/15/30 dias |
| `PaymentHistory.tsx` | Historico de pagamentos com filtros |
| `BroadcastMessages.tsx` | Criar e enviar mensagens em massa |
| `EmailTemplates.tsx` | Gerenciar templates de email |
| `PlanConfiguration.tsx` | Configurar precos e recursos dos planos |
| `SupportTickets.tsx` | Gerenciar tickets de suporte |
| `TicketDetail.tsx` | Visualizar e responder um ticket |

### Novos Componentes
| Arquivo | Descricao |
|---------|-----------|
| `SubscriberDetailDialog.tsx` | Modal com detalhes completos do assinante |
| `PaymentCard.tsx` | Card de pagamento individual |
| `RevenueChart.tsx` | Grafico de receita (12 meses) |
| `MRRCard.tsx` | Card com MRR e variacao mensal |
| `TicketCard.tsx` | Card de ticket de suporte |
| `ExportButton.tsx` | Botao para exportar dados em CSV |

---

## 3. Modificacoes em Arquivos Existentes

### `SuperAdminSidebar.tsx`
- Reorganizar em grupos colapsaveis (Collapsible)
- Adicionar novos itens de menu
- Implementar indicadores de notificacao

### `SuperAdminDashboard.tsx`
- Adicionar card de MRR
- Adicionar card de assinaturas expirando
- Adicionar grafico de crescimento de 12 meses
- Adicionar acesso rapido a tickets pendentes

### `SubscribersManagement.tsx`
- Adicionar modal de detalhes do assinante
- Adicionar busca por nome/email (via join com profiles)
- Adicionar botao de exportar CSV
- Mostrar nome da barbearia e dono

### `useSuperAdmin.ts`
- Adicionar join com `profiles` para obter nome/email
- Adicionar funcoes de exportacao

### `App.tsx`
- Adicionar novas rotas para as paginas criadas

---

## 4. Novas Rotas

```text
/superadmin                      → Dashboard
/superadmin/metrics              → Metricas Financeiras (MRR, LTV)
/superadmin/subscribers          → Gestao de Assinantes
/superadmin/expiring             → Assinaturas Expirando
/superadmin/payments             → Historico de Pagamentos
/superadmin/coupons              → Cupons da Plataforma
/superadmin/broadcast            → Mensagens em Massa
/superadmin/templates            → Templates de Email
/superadmin/plans                → Configuracao de Planos
/superadmin/support              → Tickets de Suporte
/superadmin/support/:id          → Detalhe do Ticket
/superadmin/logs                 → Logs de Auditoria
```

---

## 5. Funcionalidades Detalhadas

### Dashboard Melhorado
- **Cards principais**: Total Assinantes, Ativos, MRR, Churn Rate
- **Grafico de crescimento**: Ultimos 12 meses
- **Alertas**: Assinaturas expirando em 7 dias, tickets urgentes, pagamentos atrasados
- **Acoes rapidas**: Criar cupom, enviar broadcast, ver tickets

### Metricas Financeiras
- **MRR (Monthly Recurring Revenue)**: Receita recorrente mensal
- **LTV (Lifetime Value)**: Valor medio do cliente
- **Receita por plano**: Grafico de pizza
- **Crescimento**: Grafico de linha 12 meses
- **Taxa de inadimplencia**: Pagamentos atrasados

### Gestao de Assinantes Melhorada
- **Busca avancada**: Por nome, email, barbearia
- **Filtros**: Status, plano, data de expiracao
- **Modal de detalhes**: 
  - Informacoes da barbearia (logo, nome)
  - Dados do dono (nome, email, telefone)
  - Historico de pagamentos
  - Metricas da barbearia (barbeiros, agendamentos)
  - Notas internas
- **Exportar CSV**: Lista filtrada

### Assinaturas Expirando
- **Tabs**: 7 dias, 15 dias, 30 dias
- **Acoes em lote**: Renovar multiplos, enviar lembrete
- **Prioridade visual**: Cores por urgencia

### Mensagens em Massa
- **Canais**: Email, Push, SMS (futuro)
- **Segmentacao**: Por plano, por status, todos
- **Agendamento**: Enviar agora ou agendar
- **Historico**: Mensagens enviadas com metricas

### Templates de Email
- **Tipos**: Boas-vindas, lembrete de renovacao, falha de pagamento
- **Editor**: HTML simples com variaveis
- **Preview**: Visualizar antes de salvar
- **Ativar/Desativar**: Toggle rapido

### Configuracao de Planos
- **Precos**: Mensal e anual por plano
- **Limites**: Max barbeiros, agendamentos
- **Features**: Checkbox de funcionalidades
- **Ordenar**: Arrastar para reordenar

### Tickets de Suporte
- **Lista**: Com filtros por status e prioridade
- **Detalhes**: Chat-like com historico
- **Atribuir**: Designar para admin
- **Status**: Open, In Progress, Resolved, Closed

---

## 6. Ordem de Implementacao

| Etapa | Descricao |
|-------|-----------|
| 1 | Migracoes SQL (5 novas tabelas + RLS) |
| 2 | Atualizar types/superAdmin.ts |
| 3 | Criar novos hooks |
| 4 | Atualizar SuperAdminSidebar com grupos |
| 5 | Atualizar SuperAdminDashboard |
| 6 | Melhorar SubscribersManagement + SubscriberDetailDialog |
| 7 | Criar FinancialMetrics + graficos |
| 8 | Criar ExpiringSubscriptions |
| 9 | Criar PaymentHistory |
| 10 | Criar BroadcastMessages |
| 11 | Criar EmailTemplates |
| 12 | Criar PlanConfiguration |
| 13 | Criar SupportTickets + TicketDetail |
| 14 | Adicionar rotas no App.tsx |
| 15 | Seed de dados iniciais (configs de planos) |

---

## Resumo Tecnico

- **5 novas tabelas**: `platform_payments`, `platform_broadcast_messages`, `platform_email_templates`, `platform_plan_config`, `platform_support_tickets`, `platform_ticket_messages`
- **5 novos hooks**: Payments, Broadcast, Templates, PlanConfig, SupportTickets
- **9 novas paginas**: FinancialMetrics, ExpiringSubscriptions, PaymentHistory, BroadcastMessages, EmailTemplates, PlanConfiguration, SupportTickets, TicketDetail
- **6 novos componentes**: SubscriberDetailDialog, PaymentCard, RevenueChart, MRRCard, TicketCard, ExportButton
- **11 novas rotas**: Organizadas sob `/superadmin/*`
- **Sidebar reorganizada**: 6 grupos de menu colapsaveis

