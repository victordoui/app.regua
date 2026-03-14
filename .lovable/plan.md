

# Aplicar cores VIZZU dentro do sistema

As variáveis CSS já estão com as cores VIZZU, mas muitos componentes usam cores Tailwind hardcoded (blue-500, purple-500, etc.) ao invés das variáveis da marca. O objetivo é unificar a identidade visual.

## Alterações

### 1. `src/components/Sidebar.tsx`
- Sidebar background: adicionar gradient sutil VIZZU no painel lateral (do dark `#0F2F6B` ao primary `#1F4FA3`) em modo expandido
- Item ativo: usar `bg-[#1F4FA3]/10 text-[#1F4FA3]` ao invés de `bg-secondary`
- Footer badge "VZ": manter gradient da marca

### 2. `src/components/Layout.tsx`
- Header: adicionar borda inferior com toque de cor VIZZU (`border-[#1F4FA3]/10`)
- Search input focus: usar cores da marca

### 3. `src/components/ui/button.tsx`
- Variante `barber`: trocar `from-blue-600 to-blue-700` por `from-[#1F4FA3] to-[#0F2F6B]`
- Variante `barber-outline`: trocar `border-blue-600 text-blue-600` por `border-[#1F4FA3] text-[#1F4FA3]`

### 4. `src/components/Dashboard.tsx`
- Stat cards: unificar ícones com tons da paleta VIZZU (usar shades de `#4FA3FF`, `#2E6FD3`, `#1F4FA3`, `#0F2F6B` ao invés de purple/pink/orange/indigo)
- Botão "Novo Agendamento": usar gradient VIZZU

### 5. `src/components/dashboard/DashboardOverview.tsx`
- `getStatColor()`: substituir cores aleatórias por tons da paleta VIZZU

### 6. `src/components/dashboard/TodayMetricsPanel.tsx`
- Cards de métricas: usar tons VIZZU ao invés de blue/green/purple hardcoded

### 7. `src/components/dashboard/RecentActivities.tsx`
- Ícones de atividade: mapear para tons da paleta VIZZU

### Nota
Cores semânticas de status (verde=concluído, amarelo=pendente, vermelho=cancelado) serão mantidas pois são convenções de UX universais.

