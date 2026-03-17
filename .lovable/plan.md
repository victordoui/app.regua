

# Redesign Completo — Padrão Visual SaaS Profissional

## Problema Atual
As páginas têm layouts inconsistentes: espaçamentos diferentes, headers sem padrão, cards de métricas com estilos variados, e falta de uma estrutura visual unificada. Isso dá a impressão de desalinhamento.

## Referência Visual (imagem "Todos os Chamados")
A referência mostra um padrão claro:
1. **Header**: Ícone + Título bold + subtítulo descritivo + botões de ação à direita
2. **Abas** (pill style — já implementado)
3. **Status Cards**: Linha horizontal de cards com label no topo, número grande colorido, ícone à direita
4. **Busca + Filtros**: Barra de busca full-width + chips de filtro com ícones abaixo
5. **Contagem**: "X registro(s)" antes do grid
6. **Grid de Cards**: Cards com informações estruturadas, badges coloridos, bordas sutis

## Estratégia de Implementação

### Fase 1 — Componente Base `PageHeader`
Criar `src/components/ui/page-header.tsx` — componente reutilizável com:
- Ícone + título + subtítulo opcional
- Slot para botões de ação à direita
- Espaçamento padronizado

### Fase 2 — Componente `StatusCards`
Criar `src/components/ui/status-cards.tsx` — barra horizontal de métricas:
- Layout horizontal scrollável em mobile
- Número grande + label + ícone por card
- Suporte a cores por card (como na referência: azul, amarelo, verde, vermelho)

### Fase 3 — Componente `SearchFilters`
Criar `src/components/ui/search-filters.tsx` — busca + filtros chips:
- Input de busca full-width com ícone
- Linha de filtros abaixo como chips/buttons com ícones e dropdowns

### Fase 4 — Redesign das Páginas (13 páginas)

Cada página seguirá esta estrutura:

```text
┌─────────────────────────────────────────────┐
│  [Icon] Título da Página                    │
│  Descrição breve              [+ Ação] [CSV]│
├─────────────────────────────────────────────┤
│  [Aba 1] [Aba 2] [Aba 3]                   │
├─────────────────────────────────────────────┤
│  [Total] [Status1] [Status2] [Status3]      │  ← Status Cards
├─────────────────────────────────────────────┤
│  🔍 Buscar...                               │
│  [Filtro1 ▾] [Filtro2 ▾] [Filtro3 ▾]       │
├─────────────────────────────────────────────┤
│  X registro(s)                              │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │ Card │ │ Card │ │ Card │                 │
│  └──────┘ └──────┘ └──────┘                │
└─────────────────────────────────────────────┘
```

**Páginas a redesenhar:**

| Página | Mudanças Principais |
|---|---|
| **Index.tsx** (Dashboard) | PageHeader com ícone BarChart3, manter tabs e conteúdo interno |
| **Clients.tsx** | PageHeader + StatusCards (Total, Com Email, Com Telefone) + SearchFilters + grid melhorado |
| **Services.tsx** | PageHeader + StatusCards (Total, Ativos, Inativos) + SearchFilters + grid |
| **BarberManagement.tsx** | PageHeader + StatusCards (Total, Ativos, Com Ausência) + grid padronizado |
| **Appointments.tsx** | PageHeader + manter estrutura calendar/sidebar |
| **Billing.tsx** | PageHeader + StatusCards (Saldo, Receitas, Despesas) + tabs |
| **Commissions.tsx** | PageHeader + StatusCards mantidos + tabs |
| **Reports.tsx** | PageHeader + tabs + conteúdo |
| **Loyalty.tsx** | PageHeader + StatusCards + tabs |
| **Coupons.tsx** | PageHeader + tabs |
| **Conversations.tsx** | PageHeader + tabs |
| **AdvancedNotifications.tsx** | PageHeader + tabs |
| **Cash.tsx** | PageHeader + layout melhorado |
| **CompanySettings.tsx** | PageHeader + tabs |

### Fase 5 — Refinamentos Visuais Globais
- Cards com `hover:shadow-md transition-all` padronizado
- Borders mais sutis (`border-border/40`)
- Espaçamento consistente (`p-6` em todas as páginas)
- Loading states com skeleton padronizado
- Empty states com ilustração e texto centralizado

## Detalhes Técnicos

### `page-header.tsx`
```tsx
// Props: icon, title, subtitle, children (ações)
// Render: flex justify-between, ícone em container bg-primary/10
```

### `status-cards.tsx`
```tsx
// Props: items[] com { label, value, icon, color, suffix? }
// Render: flex gap-4 overflow-x-auto, cada card com border-l-4 colorido
```

### `search-filters.tsx`
```tsx
// Props: searchValue, onSearch, filters[], resultCount
// Render: Input full-width + flex wrap gap-2 de filter chips
```

## Escopo
- 3 novos componentes reutilizáveis
- ~14 páginas redesenhadas
- 0 mudanças em lógica/dados — apenas visual/layout

