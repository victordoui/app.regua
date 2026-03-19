

# Plano: Corrigir KPIs com dados fake + ajustar cards

## Problemas identificados

1. **KPIs mostram 0** — O `DashboardOverview` passa `metrics.monthRevenue` como `dayRevenue`, mas o hook retorna dados mock apenas após o fetch (durante loading, os valores são 0). O problema real é que os KPIs mostram 0 porque o `isEmpty` check depende de dados do Supabase — se a conexão falha ou demora, ficam zerados.
2. **Receita do Mês** — precisa de dados fake quando `monthRevenue` é 0
3. **Ranking de Profissionais** — já tem top 5 mock, está OK
4. **Ocupação por Horário e Faturamento Mensal** — têm `h-full` no RevenueLineChart causando espaço extra; ambos precisam usar `h-fit`
5. **KPI "Receita do Dia"** recebe `monthRevenue` (18450) em vez de um valor diário separado

## Alterações

### 1. `src/hooks/useRealtimeDashboard.ts`
- Adicionar campo `todayRevenue` à interface `DashboardMetrics`
- No mock: `todayRevenue: 2350`
- No cálculo real: somar `total_price` dos agendamentos de hoje com status `completed`
- Garantir que o estado inicial já tenha valores mock (em vez de zeros) para evitar flash de "0"

### 2. `src/components/dashboard/DashboardOverview.tsx`
- Mudar `dayRevenue={metrics.monthRevenue}` para `dayRevenue={metrics.todayRevenue}`

### 3. `src/components/dashboard/KpiStrip.tsx`
- No KPI "Novos Clientes", quando valor for 0, mostrar valor fake (23)
- Ajustar tag do "Novos Clientes" para mostrar `+23` em vez de `0`

### 4. `src/components/dashboard/RevenueLineChart.tsx`
- Mudar `h-full` para `h-fit` no container raiz para eliminar espaço vazio inferior

### 5. `src/components/dashboard/MonthRevenueDonut.tsx`
- Quando `monthRevenue` for 0, usar valor fake `18.450` para exibição

