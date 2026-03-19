

# Plano: Recriar card "Faturamento Mensal" + remover subtítulo

## Alterações

### 1. `src/components/dashboard/HeroSection.tsx`
- Remover a linha 20-22 (o parágrafo "Dashboard Analítico — Visão geral de performance e métricas do sistema")

### 2. `src/components/dashboard/RevenueLineChart.tsx`
- Recriar o card usando Recharts (`AreaChart`) em vez do SVG estático atual
- Usar os dados reais passados via prop `data` para renderizar barras ou área
- Incluir: header com título + botão "Últimos 6 meses", legenda (Receita / Meta), gráfico responsivo com grid, tooltip formatado em R$, eixos X (meses) e Y (valores formatados em k)
- Manter o visual consistente com o design system (cores `hsl(var(--primary))`, `hsl(var(--success))` para meta, `bg-card`, `border-border`)
- Usar `ResponsiveContainer` + `AreaChart` com gradiente de preenchimento para manter o estilo visual atual mas com dados dinâmicos

