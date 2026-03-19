

# Plano: Modo Escuro Completo — Corrigir cores hardcoded em todo o sistema

## Situação Atual
A infraestrutura de dark mode já existe (next-themes + variáveis CSS `.dark` + ThemeToggle no Topbar). Porém, **26 arquivos** ainda usam cores hardcoded (`bg-white`, `text-gray-*`, `bg-gray-*`, `border-gray-*`) que não respondem ao dark mode.

## Estratégia
Substituir todas as cores hardcoded por tokens semânticos já definidos no CSS:

| Hardcoded | Token semântico |
|-----------|----------------|
| `bg-white` | `bg-card` ou `bg-background` |
| `bg-gray-50/100` | `bg-secondary` ou `bg-muted` |
| `bg-gray-200` | `bg-muted` |
| `text-gray-400/500` | `text-muted-foreground` |
| `text-gray-700/800` | `text-foreground` |
| `border-gray-200` | `border-border` |
| `#F1F5F9` (SVG) | `hsl(var(--muted))` |
| `#94A3B8` (SVG) | `hsl(var(--muted-foreground))` |

## Arquivos a alterar

### Dashboard (6 arquivos)
1. **`HeroSection.tsx`** — `bg-white` → `bg-card`
2. **`KpiStrip.tsx`** — `bg-white` → `bg-card`
3. **`TodayAppointmentsPanel.tsx`** — `bg-white` → `bg-card`
4. **`MonthRevenueDonut.tsx`** — `bg-white` → `bg-card`, SVG fills (`#F1F5F9` → variável, text fills `#94A3B8` → variável, `hsl(222, 47%, 11%)` → `currentColor`)
5. **`RevenueLineChart.tsx`** — `bg-white` → `bg-card`, SVG grid lines e labels para variáveis dark-safe
6. **`OccupationHeatmap.tsx`** — `bg-white` → `bg-card`
7. **`MiniCalendarPanel.tsx`** — `bg-white` → `bg-card`, botões de navegação `bg-white` → `bg-card`
8. **`RecentTransactionsPanel.tsx`** — `bg-white` → `bg-card`
9. **`ProfessionalsPanel.tsx`** — `bg-white` → `bg-card`

### Login (1 arquivo)
10. **`Login.tsx`** — painel direito `bg-white` → `bg-background`, `text-gray-500/700` → `text-muted-foreground`/`text-foreground`, `bg-gray-100` → `bg-secondary`, tabs ativas `bg-white` → `bg-card`, inputs `bg-white` → `bg-input`, separador `border-gray-200` → `border-border`, `bg-white px-3` → `bg-background px-3`

### Booking (2 arquivos)
11. **`StepServiceSelection.tsx`** — `border-gray-200 hover:border-gray-300` → `border-border hover:border-border/80`
12. **`StepBarberSelection.tsx`** — `border-gray-200`, `bg-gray-200`, `text-gray-500` → tokens semânticos

### Outros componentes
13. **`CompanyPagePreview.tsx`** — `bg-gray-50`, `text-gray-800`, `border-white` → tokens
14. **`PixPayment.tsx`** — `bg-white` → `bg-card`
15. **`SeoMetaFields.tsx`** — `bg-white` no preview do WhatsApp → `bg-card`
16. **`PublicBookingPage.tsx`** — `bg-gray-100`, `bg-gray-50` → `bg-background`/`bg-secondary`
17. **`Users.tsx`** — `bg-gray-100/200`, `text-gray-500/800` → tokens semânticos
18. **`BarberRankingTable.tsx`** — `text-gray-400` → `text-muted-foreground`

### UI base
19. **`switch.tsx`** — `bg-white` no thumb é aceitável (contraste), manter

## SVG dark mode
Para os SVGs inline (MonthRevenueDonut, RevenueLineChart), usar `currentColor` onde possível e substituir fills hardcoded por variáveis CSS via `hsl(var(--...))`.

## Resultado
Todos os componentes do sistema responderão corretamente ao toggle de dark mode, sem elementos brancos "queimando" no fundo escuro.

