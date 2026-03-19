

# Adicionar Filtros e Botões de Exportação ao Dashboard Analítico

## O que será feito

Redesenhar o cabeçalho do `AnalyticsDashboard` para incluir:

1. **Título + subtítulo** — "Dashboard Analítico" com descrição "Visão geral de performance e métricas do sistema"
2. **Filtros de período** — Botões pill/segmentados: Hoje, Semana, **Mês** (ativo por padrão), Ano
3. **Botões de exportação** — PDF e Excel com ícones, estilo outline

Layout: título à esquerda, filtros + exportação à direita, tudo numa linha horizontal (responsivo em mobile com wrap).

## Alteração

### `src/components/dashboard/AnalyticsDashboard.tsx`
- Adicionar estado `selectedPeriod` com `useState` (default: `'month'`)
- Substituir o header atual por um layout flex com:
  - Lado esquerdo: ícone + título + subtítulo abaixo
  - Lado direito: grupo de botões de período (Hoje/Semana/Mês/Ano) + botões PDF e Excel
- Os botões de período usam estilo pill (bg-primary quando ativo, outline quando inativo)
- Botões PDF/Excel com ícones `FileText` e `FileSpreadsheet` do lucide-react, estilo outline
- Os botões de exportação e filtros são visuais por enquanto (funcionalidade futura)

1 arquivo editado, ~40 linhas adicionadas.

