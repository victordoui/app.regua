

# Plano: Ajustar KPI cards + Adicionar abas ao Painel

## Problemas identificados

1. **KPI Strip**: O grid CSS tem classes conflitantes (`grid-cols-1 sm:grid-cols-2 grid-cols-[repeat(auto-fit,...)]`), fazendo os 4 cards não ficarem em linha. A fonte cinza do label é muito apagada.

2. **Sub-páginas removidas**: As rotas `/customer-success`, `/barber-performance` e `/reviews` foram removidas na consolidação, mas os componentes ainda existem (`CustomerSuccessContent`, `BarberPerformanceContent`, `ReviewsContent`). Precisam voltar como abas dentro do Painel.

## Alterações

### 1. `src/components/dashboard/KpiStrip.tsx`
- Corrigir grid para `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — garante 4 cards na mesma linha em desktop
- Melhorar contraste: label de `text-muted-foreground` para `text-foreground/70` e aumentar tamanho de `text-[11px]` para `text-xs`
- Tornar os valores com cor mais forte (`text-foreground` em todos)

### 2. `src/components/dashboard/DashboardOverview.tsx`
- Adicionar sistema de abas (Tabs) com 4 abas: **Visão Geral**, **Sucesso do Cliente**, **Desempenho dos Profissionais**, **Avaliações**
- "Visão Geral" mostra o conteúdo atual (KpiStrip, Heatmap, Revenue, etc.)
- As outras 3 abas renderizam os componentes existentes: `CustomerSuccessContent`, `BarberPerformanceContent`, `ReviewsContent`
- Estilo das abas: pill/segmented seguindo o padrão do sistema

### 3. `src/App.tsx`
- Adicionar redirects para as rotas antigas: `/customer-success` → `/?tab=sucesso-cliente`, `/barber-performance` → `/?tab=desempenho`, `/reviews` → `/?tab=avaliacoes`

## Resultado
- 4 KPI cards alinhados na mesma linha, com texto mais legível
- Painel com 4 abas navegáveis sem sair da página

