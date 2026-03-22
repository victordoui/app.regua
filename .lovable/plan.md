

# Reorganizar Dashboard — Visão Geral e Desempenho

## Duas alterações

### 1. Mover Avaliações para aba "Desempenho dos Profissionais"

Remover a seção de Avaliações (ReviewsContent) da aba "Visão Geral" e adicioná-la ao final da aba "Desempenho dos Profissionais".

**Arquivos:**
- `DashboardOverview.tsx` — remover linhas 82-87 (seção Avaliações) da aba overview
- `BarberPerformanceContent.tsx` — importar e renderizar `ReviewsContent` ao final, com título "Avaliações"

### 2. Reorganizar seções da Visão Geral (sem repetição)

Reordenar as seções para um fluxo lógico e limpo, removendo o título "Dashboard Analítico" (fica tudo integrado). Também renomear referências de "Barbeiros" para "Profissionais" nos labels.

**Nova ordem na aba Visão Geral:**

1. **KPI Strip** — métricas rápidas do dia
2. **Linha 1:** Ocupação por Horário + Faturamento Mensal + Mini Calendário/Agenda do Dia
3. **Linha 2:** Comparativo Mensal + Funil de Conversão
4. **Linha 3:** Análise por Serviço + Previsão de Receita
5. **Linha 4:** Transações Recentes + Ranking de Profissionais + Receita do Mês (donut)

Isso remove a duplicação do cabeçalho analítico separado — os 4 gráficos analíticos ficam integrados no fluxo, entre a linha principal e as transações/ranking. O header com filtros de período e botões PDF/Excel é movido para o topo da seção (abaixo do KPI Strip).

**Arquivo:** `DashboardOverview.tsx` — reordenar os componentes na aba overview, integrar os gráficos do `AnalyticsDashboard` inline (ou manter o componente mas reposicionar).

### Resumo de arquivos

| Arquivo | Mudança |
|---|---|
| `DashboardOverview.tsx` | Remover Avaliações, reordenar seções analíticas antes de transações/ranking |
| `BarberPerformanceContent.tsx` | Adicionar ReviewsContent ao final |

