

# Adicionar aba "Desempenho dos Profissionais"

## O que será feito

Mover a seção "Desempenho dos Profissionais" (que hoje está inline na aba Visão Geral) para uma **aba própria** no `TabsList`, junto com "Visão Geral" e "Sucesso do Cliente".

## Alteração: `src/components/dashboard/DashboardOverview.tsx`

1. Adicionar nova `TabsTrigger` com valor `"desempenho"` e ícone `Users` + texto "Desempenho dos Profissionais"
2. Adicionar novo `TabsContent` com valor `"desempenho"` contendo o `<BarberPerformanceContent />`
3. Remover a seção inline de "Desempenho dos Profissionais" (linhas 78-83) da aba overview

A seção de "Avaliações" permanece na aba Visão Geral.

1 arquivo, ~8 linhas alteradas.

