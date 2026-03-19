

# Plano: Ajustes visuais do Painel + Sidebar

## Resumo
Melhorar o dashboard com subtítulo "Dashboard Analítico", corrigir espaçamentos das divs para preencher melhor o espaço, remover a linha separadora abaixo da logo na sidebar, aumentar a logo, e aumentar fontes gerais.

## Alterações

### 1. `src/components/dashboard/HeroSection.tsx`
- Título principal: de `text-[22px]` para `text-[26px]`
- Adicionar subtítulo descritivo: "Dashboard Analítico — Visão geral de performance e métricas do sistema"
- Subtítulo existente: de `text-xs` para `text-sm`

### 2. `src/components/dashboard/DashboardOverview.tsx`
- Remover `max-w-[1280px]` para usar toda a largura disponível
- Reduzir `space-y-7` para `space-y-5` (espaçamento mais compacto entre seções)
- Grid principal `lg:grid-cols-[2fr_2fr_1fr]` → `lg:grid-cols-[1fr_1fr_280px]` para equilibrar melhor
- Reduzir `gap-6` para `gap-4` nos grids de cards

### 3. Dashboard panels — aumentar fontes dos títulos
Nos arquivos: `OccupationHeatmap.tsx`, `RevenueLineChart.tsx`, `MonthRevenueDonut.tsx`, `RecentTransactionsPanel.tsx`, `ProfessionalsPanel.tsx`, `TodayAppointmentsPanel.tsx`, `MiniCalendarPanel.tsx`
- Título de cada painel: de `text-[13px]` para `text-[15px]`

### 4. `src/components/dashboard/KpiStrip.tsx`
- Labels: de `text-sm` para `text-[15px]`
- Valores: de `text-2xl` para `text-3xl`
- Reduzir `gap-5` para `gap-4`

### 5. `src/components/Sidebar.tsx`
- **Remover a linha** `border-b border-border` do container da logo (linha 115)
- **Aumentar a logo**: de `h-20 w-20` para `h-24 w-24`
- **Aumentar fonte dos itens**: de `text-[13px]` para `text-[14px]`
- **Aumentar labels de categoria**: de `text-[10px]` para `text-[11px]`

### 6. `src/components/dashboard/OccupationHeatmap.tsx` e `RevenueLineChart.tsx`
- Remover `min-h-[300px]` (deixar o conteúdo definir a altura naturalmente, evitando caixas maiores que o conteúdo)

### 7. `src/components/dashboard/MonthRevenueDonut.tsx`, `RecentTransactionsPanel.tsx`, `ProfessionalsPanel.tsx`
- Remover `min-h-[260px]` para conteúdo preencher corretamente

