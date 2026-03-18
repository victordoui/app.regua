

# Plano: Consolidar todas as abas em uma única página Painel + ajustar tipografia

## O que será feito

Remover o sistema de abas e exibir todo o conteúdo na mesma página, em seções empilhadas verticalmente. Ajustar a tipografia da "Visão Geral" para usar o mesmo padrão de tamanho/fonte da aba "Sucesso do Cliente" (`text-sm font-medium` para labels, `text-2xl font-bold` para valores).

## Alterações

### 1. `src/components/dashboard/DashboardOverview.tsx`
- Remover o componente `Tabs` e todas as `TabsContent`
- Exibir tudo em sequência vertical com separadores visuais (títulos de seção):
  1. **HeroSection** (já existe)
  2. **KpiStrip** (4 cards)
  3. **Grids de Visão Geral** (Heatmap, Revenue, Calendar, etc.)
  4. **Seção "Sucesso do Cliente"** — título `<h2>` + `CustomerSuccessContent`
  5. **Seção "Desempenho dos Profissionais"** — título `<h2>` + `BarberPerformanceContent`
  6. **Seção "Avaliações"** — título `<h2>` + `ReviewsContent`
- Remover imports de `Tabs`, `useSearchParams`, e os ícones das abas
- Cada seção terá um heading com ícone + título (`text-lg font-bold`)

### 2. `src/components/dashboard/KpiStrip.tsx`
- Ajustar tipografia dos cards para alinhar com o padrão do CustomerSuccess:
  - Label: de `text-xs` → `text-sm font-medium` (mesmo do CardTitle no CustomerSuccess)
  - Valor: de `text-[28px] font-extrabold` → `text-2xl font-bold`
  - Remover uppercase e tracking excessivo do label
  - Manter cores e ícones como estão

### 3. `src/App.tsx`
- Remover os redirects de `?tab=` que não serão mais necessários (as rotas legadas podem redirecionar para `/` diretamente)

## Resultado
Uma página Painel única e contínua com todas as informações visíveis sem trocar de aba, com tipografia consistente e legível em toda a página.

