

# Plano: Redesenhar cards da segunda linha do Dashboard

## Alterações

### 1. `src/components/dashboard/DashboardOverview.tsx`
- Na segunda grid (linha 71), mudar de `lg:grid-cols-3` para `lg:grid-cols-[1fr_1fr_1fr]` com `items-start` para que os cards alinhem pelo topo e se ajustem ao conteúdo verticalmente (sem forçar mesma altura)

### 2. `src/components/dashboard/MonthRevenueDonut.tsx` — Redesenhar "Receita do Mês"
- Usar Recharts `PieChart` + `Pie` (donut) em vez do SVG manual
- Manter o layout: valor total no topo, donut + legenda lado a lado, barra de progresso da meta embaixo
- Tornar o donut responsivo com `ResponsiveContainer`
- Usar cores via CSS variables (`hsl(var(--primary))`, `hsl(var(--success))`, `#F97316`)

### 3. `src/components/dashboard/ProfessionalsPanel.tsx` — Renomear + redesenhar
- Título: "Profissionais" → "Ranking de Profissionais"
- Adicionar posição numérica (1º, 2º, 3º...) com destaque dourado/prata/bronze nos top 3
- Mover a estrela e rating para ficar mais visível
- Adicionar uma barra de progresso compacta representando performance relativa
- Manter avatar com gradiente e status online

### 4. `src/components/dashboard/RecentTransactionsPanel.tsx` — Redesenhar
- Aumentar padding interno e espaçamento entre linhas para melhor legibilidade
- Aumentar fonte do nome do cliente para `text-sm` e do valor para `text-sm font-bold`
- Badges de status ligeiramente maiores (`text-[11px]` em vez de `text-[10px]`)
- Manter a estrutura de tabela mas com linhas mais respiradas

### 5. Ajuste de altura dos cards
- Todos os 3 cards da segunda linha usam `h-fit` (auto-height) para que se ajustem ao conteúdo real sem espaço vazio

