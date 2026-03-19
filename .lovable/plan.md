

# Mostrar números demo no KPI Strip quando valores são zero

## Problema
O hook `useRealtimeDashboard` só usa dados demo quando o banco está completamente vazio (`isEmpty`). Se existir qualquer dado (ex: 1 cliente antigo), `isEmpty = false` e as métricas de hoje ficam zeradas.

## Solução
No `KpiStrip.tsx`, usar valores de fallback demo quando os valores reais forem 0:

| KPI | Valor atual | Fallback demo |
|---|---|---|
| Agendamentos Hoje | 0 | 12 |
| Taxa de Conclusão | 0% | 87% |
| Novos Clientes | 0 | 23 |
| Receita do Dia | R$ 0 | R$ 2.350 |

### Alteração: `src/components/dashboard/KpiStrip.tsx`
- Adicionar lógica no início do componente: se todos os 4 valores forem 0, usar fallback demo
- Os valores de tag/foot permanecem iguais

Alteração mínima — 1 arquivo, ~6 linhas adicionadas.

