

# Ajustar Layout do Dashboard — Visual SaaS Premium

## Objetivo
Remover aspecto "achatado/wide" e criar visual equilibrado com mais respiro vertical, cards mais proporcionais e sensação premium.

## Arquivos a editar (7 arquivos)

### 1. `DashboardOverview.tsx`
- Envolver conteúdo em `max-w-[1280px] mx-auto`
- Aumentar spacing para `space-y-7`
- Grid principal: `lg:grid-cols-[2fr_2fr_1fr]` com `gap-6`
- Grid inferior: `gap-6`

### 2. `KpiStrip.tsx`
- Grid: `grid-cols-[repeat(auto-fit,minmax(240px,1fr))]` com `gap-5`
- Cards: `min-h-[130px]`, `p-6`, layout `flex flex-col justify-between`
- Ícone: `w-12 h-12`
- Label: `text-[11px]`, valor mantém `text-[28px]`

### 3. `OccupationHeatmap.tsx`
- Container: `min-h-[300px]`
- Padding: `px-5 pb-5`, header `px-5 pt-4 pb-3`
- Grid: `gap-[6px]`, row height `40px`

### 4. `RevenueLineChart.tsx`
- Container: `min-h-[300px]`
- SVG height: `240`
- Padding: `px-5 pb-5`

### 5. `MiniCalendarPanel.tsx`
- Padding: `p-5`
- Células: `w-[30px] h-[30px]`

### 6. Painéis inferiores (`RecentTransactionsPanel.tsx`, `ProfessionalsPanel.tsx`, `MonthRevenueDonut.tsx`)
- Adicionar `min-h-[260px]` ao container
- Header padding: `px-5 pt-4 pb-3`

### 7. `HeroSection.tsx`
- Aumentar `mb-2` para `mb-4`

## Regras
- Sem alteração de cores, fontes ou identidade visual
- Apenas proporção, espaçamento e layout

