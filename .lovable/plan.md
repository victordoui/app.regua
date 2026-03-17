

# Redesign do Dashboard — Estilo Moderno Inspirado na Referência

## Visão Geral

Redesenhar o `DashboardOverview.tsx` para seguir o layout da imagem de referência: cards com bordas coloridas à esquerda, um card de perfil do negócio com QR code, agenda do dia como lista de horários, gráficos reorganizados e um card CTA promocional. Tudo adaptado aos dados e contexto do VIZZU.

## Layout Proposto (Grid)

```text
┌─────────────────────┬───────────────┬──────────────────────┐
│  CARD PERFIL        │  Agendamentos │  Receita Mensal      │
│  (Nome do negócio,  │  Hoje: 12     │  R$ 18.500           │
│  logo, QR code,     ├───────────────┤                      │
│  cargo/plano)       │  Pendentes    │                      │
│                     │  3            │                      │
├─────────────────────┴───────────────┴──────────────────────┤
│  GRÁFICO OCUPAÇÃO (linha, largura total)                   │
│  "Nível de produtividade — subiu 15% na última semana"     │
├──────────────────┬──────────────────┬──────────────────────┤
│  AGENDA DO DIA   │  GRÁFICO         │  CARD CTA            │
│  (lista horários │  SERVIÇOS        │  "Upgrade seu plano" │
│  09:30 Corte...) │  (pie/bar)       │  ou "Baixe relatório"│
└──────────────────┴──────────────────┴──────────────────────┘
```

## Arquivos a Alterar

### 1. `src/components/dashboard/DashboardOverview.tsx` — Reescrita completa

**Seção 1 — Topo (3 colunas)**:
- **Card Perfil do Negócio** (col-span-1): Nome do usuário/empresa, email, plano atual, mini QR code do link de agendamento público. Fundo com gradient VIZZU sutil.
- **2 Stats Cards empilhados** (col-span-1): "Agendamentos Hoje" e "Pendentes" — estilo minimalista com borda esquerda colorida (`border-l-4 border-primary`) e valor grande.
- **Card Receita/Serviços** (col-span-1): Gráfico de barras empilhadas mostrando os serviços do mês ou mini gráfico de receita.

**Seção 2 — Gráfico de Ocupação (largura total)**:
- Reutiliza `OccupancyChart` existente com texto "Nível de produtividade" acima.

**Seção 3 — Bottom (3 colunas)**:
- **Agenda do Dia** (col-span-1): Lista estilo timeline com horários (09:30, 10:00...), nome do cliente e serviço. Borda esquerda colorida por status.
- **Gráfico KPI/Serviços** (col-span-1): Reutiliza `ServicesChart` ou `AppointmentsChart`.
- **Card CTA** (col-span-1): Gradient VIZZU com chamada para ação (ex: "Veja seu relatório mensal", botão para `/reports`). Badge VIZZU no topo.

### 2. Novos sub-componentes (dentro de `src/components/dashboard/`):

- **`ProfileCard.tsx`**: Card com avatar do usuário, nome, email, plano, QR code mini do link público.
- **`TodayScheduleCard.tsx`**: Lista de agendamentos do dia em formato timeline (horário + cliente + serviço), estilo meeting list da referência.
- **`CTACard.tsx`**: Card promocional com gradient, ícone VIZZU e botão de ação.
- **`StatMiniCard.tsx`**: Card compacto com borda esquerda colorida, valor grande e label.

### 3. Stats Cards — Novo estilo

Em vez de 6 cards iguais com ícone circular, usar **4 mini-cards** com:
- Borda esquerda colorida (`border-l-4`)
- Valor em destaque (texto grande)
- Label pequeno abaixo
- Sem progress bar (mais limpo)

### 4. Dados utilizados (sem mudanças nos hooks)

Todos os dados já existem em `useRealtimeDashboard`:
- `metrics.todayAppointments`, `monthAppointments`, `monthRevenue`
- `weeklyAppointments`, `monthlyRevenue`
- User info de `useAuth()`
- QR code URL do link público

## Estilo Visual

- Cards com `rounded-2xl` e `border border-border/50`
- Bordas esquerdas coloridas nas variações primary (`border-primary`, `border-primary-400`, `border-primary-600`)
- Gradients sutis nos cards de destaque
- Tipografia: valores em `text-3xl font-bold`, labels em `text-xs text-muted-foreground`
- Animações Framer Motion mantidas (stagger entrance)

## O que NÃO muda

- Hooks existentes (`useRealtimeDashboard`, `useAuth`)
- Componentes de gráficos (`AppointmentsChart`, `RevenueChart`, `ServicesChart`, `OccupancyChart`) — reutilizados
- Tabs do `Index.tsx` (Visão Geral, Sucesso do Cliente, Desempenho, Avaliações)
- `BirthdayClients` e `InactiveClients` permanecem no final da página

