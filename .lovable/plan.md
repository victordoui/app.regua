

# Mover Cabeçalho Analítico e Filtros para o Final da Página

## O que será feito

Mover o bloco do "Painel Analítico" (título + subtítulo + filtros de período Hoje/Semana/Mês/Ano + botões PDF/Excel) que atualmente fica logo abaixo do KPI Strip para o **final** da aba Visão Geral, após a última linha de cards.

## Alteração: `src/components/dashboard/DashboardOverview.tsx`

- Recortar as linhas 77-111 (bloco "Filtros de período e exportação") da posição atual
- Colar após a Linha 4 (Transações + Profissionais + Receita do Mês), no final do `<div className="space-y-7">`

A ordem final fica:
1. KPI Strip
2. Ocupação + Faturamento + Calendário/Agenda
3. Comparativo Mensal + Funil de Conversão
4. Análise por Serviço + Previsão de Receita
5. Transações + Profissionais + Receita do Mês
6. **Painel Analítico (título + filtros + exportação)** ← movido para cá

1 arquivo, ~0 linhas adicionadas/removidas (apenas reposicionamento).

