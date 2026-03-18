

# Plano: Restaurar "Sucesso do Cliente" como aba no Painel

## Alteração

### `src/components/dashboard/DashboardOverview.tsx`
- Adicionar sistema de 2 abas: **Visão Geral** e **Sucesso do Cliente**
- Importar `Tabs, TabsList, TabsTrigger, TabsContent` e `useSearchParams`
- **Aba "Visão Geral"**: conteúdo atual (HeroSection, KpiStrip, grids, Desempenho, Avaliações) — tudo menos CustomerSuccessContent
- **Aba "Sucesso do Cliente"**: renderiza `CustomerSuccessContent`
- Remover a seção inline de "Sucesso do Cliente" (linhas 54-59) da visão geral
- Manter Desempenho e Avaliações inline na aba Visão Geral

### `src/App.tsx`
- Atualizar redirect de `/customer-success` para `/?tab=sucesso-cliente`

