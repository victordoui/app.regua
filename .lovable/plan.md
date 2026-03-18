

# Ajustar Layout do Dashboard — Visual SaaS Premium

## Resumo
Ajustar proporções, espaçamentos e alturas dos componentes do dashboard para eliminar o aspecto "achatado/wide" e criar um visual mais equilibrado e premium.

## Arquivos a editar (7 arquivos)

### 1. `src/components/dashboard/DashboardOverview.tsx`
- Envolver todo o conteúdo em um container com `max-w-[1280px] mx-auto`
- Aumentar `space-y-6` para `space-y-7`
- Alterar grid principal de `lg:grid-cols-[1fr_1fr_300px]` para `lg:grid-cols-[2fr_2fr_1fr]` com `gap-6`
- Grid inferior: `gap-6`

### 2. `src/components/dashboard/KpiStrip.tsx`
- Alterar grid de `lg:grid-cols-4` para `grid-cols-[repeat(auto-fit,minmax(240px,1fr))]`
- Aumentar `gap-4` para `gap-5`
- Card: adicionar `min-h-[130px]`, aumentar padding para `p-6`, mudar layout para `flex flex-col justify-between`
- Valor principal: manter `text-[28px]`
- Label: `text-[11px]`

### 3. `src/components/dashboard/OccupationHeatmap.tsx`
- Adicionar `min-h-[300px]` ao container
- Aumentar padding: `px-5 pb-5`
- Grid: aumentar `gap-1.5` para `gap-[6px]`, row height de `36px` para `40px`
- Header padding: `px-5 pt-4 pb-3`

### 4. `src/components/dashboard/RevenueLineChart.tsx`
- Adicionar `min-h-[300px]` ao container
- Aumentar SVG height de `200` para `240`
- Aumentar padding: `px-5 pb-5`

### 5. `src/components/dashboard/MiniCalendarPanel.tsx`
- Aumentar padding de `p-4` para `p-5`
- Aumentar tamanho das células do dia de `w-[26px] h-[26px]` para `w-[30px] h-[30px]`

### 6. `src/components/dashboard/RecentTransactionsPanel.tsx`, `ProfessionalsPanel.tsx`, `MonthRevenueDonut.tsx`
- Adicionar `min-h-[260px]` ao container de cada um
- Aumentar padding do header: `px-5 pt-4 pb-3`
- Aumentar padding interno das linhas/conteúdo

### 7. `src/components/dashboard/HeroSection.tsx`
- Aumentar `mb-2` para `mb-4` para mais respiro antes dos KPIs

## Regras mantidas
- Sem alteração de cores, fontes ou identidade visual
- Apenas proporção, espaçamento e layout

