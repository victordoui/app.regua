

# Redesign Completo VIZZU — Light Mode com Paleta Azul Oficial

Este é um redesign extenso que toca praticamente todos os arquivos visuais do projeto. Vou dividir em fases implementáveis.

---

## Fase 1 — Fundação: CSS Variables + Theme + Fonts

### `src/index.css`
- Substituir todas as CSS variables `:root` pela nova paleta azul light mode (conforme especificado no prompt)
- Adicionar as novas variáveis custom (`--bg`, `--surface`, `--accent`, `--text-primary`, `--shadow-card`, etc.)
- Remover o bloco `.dark {}` e converter `.light` para ser o padrão `:root`
- Mapear as variáveis do shadcn (`--background`, `--card`, `--primary`, `--border`, etc.) para os novos valores em HSL
- Remover o high-contrast dark mode
- Ajustar tipografia base: garantir Montserrat nos headings e Open Sans no body (já carregados no `index.html`)
- Remover regra `min-height: 44px` dos botões/links que causa problemas de layout

### `src/App.tsx`
- Mudar `defaultTheme="dark"` para `defaultTheme="light"` no ThemeProvider
- Opcionalmente remover `enableSystem={false}` já que será light-only

### `tailwind.config.ts`
- Adicionar cores custom da paleta azul Vizzu como extensões (blue-vizzu scale)
- Atualizar sombras para usar `rgba(34, 96, 184, ...)`
- Adicionar keyframe `fadeUp` e animação `pulse` para status dots

---

## Fase 2 — Sidebar Redesign

### `src/components/Sidebar.tsx`
- Background: `#FFFFFF` com `border-right: 1px solid rgba(34,96,184,0.10)` e sombra azul sutil
- Logo: quadrado 36×36 com gradiente `#2260B8 → #3A7FD8`, ícone "V" branco, texto "VIZZU" Montserrat 800
- Badge "PRO" pill com fundo accent-light
- Category labels: uppercase 9px, Open Sans 600, cor hint
- Nav items: Open Sans 13px 500, cor `--text-secondary`
- Nav item ativo: `background: rgba(34,96,184,0.14)`, cor accent, `font-weight: 600`, `box-shadow: inset 0 0 0 1px rgba(34,96,184,0.20)`
- Ícones 15×15, opacidade 0.5 normal / 1.0 ativo
- Badge numérico: fundo accent, cor branca
- Item "Sair": cor danger, hover danger-light
- Footer: card de plano com gradiente azul claro, botão upgrade gradiente, user row com avatar

---

## Fase 3 — Layout (Header/Topbar)

### `src/components/Layout.tsx`
- Topbar: `background: rgba(255,255,255,0.92)`, `backdrop-filter: blur(16px)`, `border-bottom` e `box-shadow` azul sutil, height 60px
- Barra de busca: fundo `--surface-2`, borda azul sutil, focus ring azul, placeholder hint
- Shortcut "⌘K" pill
- Lado direito: date pill, sino com dot danger, avatar gradiente azul
- Remover ThemeToggle (light-only)

---

## Fase 4 — Dashboard Redesign

### `src/components/Dashboard.tsx` + `src/components/dashboard/DashboardOverview.tsx`
- Page header: título Montserrat 24px 800, subtítulo Open Sans 13px muted
- Botão "+ Novo Agendamento": gradiente azul, border-radius 10px, sombra accent
- Tabs: container branco com border azul, tab ativo com fundo accent-light-2

### `src/components/dashboard/ProfileCard.tsx`
- Card branco com borda azul sutil e border-radius 16px
- Banda superior com gradiente azul levíssimo
- Avatar 62px circular com gradiente azul e borda branca
- Badge "Plano Ativo" verde com dot pulsante
- QR code estilizado

### `src/components/dashboard/StatMiniCard.tsx`
- Cards brancos com borda azul, border-radius 12px
- Hover: `translateX(3px)`, border mais forte, sombra maior
- Ícone 44×44 com fundo semântico
- Label uppercase 9px, valor Montserrat 28px 800

### Charts (`RevenueChart`, `OccupancyChart`, `ServicesChart`)
- Linha `#2260B8`, área com gradiente azul
- Grid `rgba(34,96,184,0.07)`
- Labels Open Sans, cor azul sutil
- Tooltips brancos com borda azul

### `src/components/dashboard/TodayScheduleCard.tsx`
- Hora Montserrat 13px 700, barra vertical 3px por status
- Status badges semânticos
- Row hover: surface-3

---

## Fase 5 — Componentes UI Base

### `src/components/ui/card.tsx`
- Background branco, borda `rgba(34,96,184,0.10)`, sombra azul sutil, border-radius 16px

### `src/components/ui/button.tsx`
- Variante primary: gradiente `#2260B8 → #3A7FD8`, sombra accent, hover brightness + translateY
- Ajustar todas as variantes para paleta azul

### `src/components/ui/badge.tsx`
- Badges semânticos com fundos light (success-light, warning-light, etc.)

### `src/components/ui/input.tsx`
- Border azul sutil, focus ring accent

---

## Fase 6 — Páginas Secundárias

Aplicar a paleta e tipografia nas demais páginas:
- `/appointments` — calendário com slots coloridos por profissional (tons de azul)
- `/clients` — tabela com avatares coloridos, busca e filtros
- `/barbers` — cards com barras de disponibilidade em azul
- `/services` — grid de cards agrupados por categoria
- `/reports` — gráficos com paleta azul (barras, donut, heatmap)
- `/cash` — interface PDV
- `/settings/company` — inputs com focus ring azul

---

## Fase 7 — Animações + Responsividade

- Adicionar `fadeUp` com stagger nas seções do dashboard
- Pulse animation no dot de status
- KPI hover `translateX(3px)`
- Skeleton shimmer antes dos dados
- Responsivo: sidebar colapsada 60px em tablet, bottom nav em mobile

---

## Resumo de Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Paleta completa, tipografia, remover dark mode |
| `src/App.tsx` | defaultTheme → "light" |
| `tailwind.config.ts` | Cores, sombras, animações |
| `src/components/Sidebar.tsx` | Redesign completo light |
| `src/components/Layout.tsx` | Topbar glassmorphism branca |
| `src/components/Dashboard.tsx` | Header + layout |
| `src/components/dashboard/*.tsx` | ProfileCard, StatMiniCard, TodayScheduleCard, CTACard |
| `src/components/charts/*.tsx` | Cores azul nos gráficos |
| `src/components/ui/card.tsx` | Estilo light |
| `src/components/ui/button.tsx` | Gradiente azul |
| `src/components/ui/badge.tsx` | Badges semânticos |
| `src/components/ui/input.tsx` | Focus ring azul |
| `src/components/ui/theme-toggle.tsx` | Remover ou desabilitar |

**Nota**: Dada a extensão (30+ arquivos), sugiro implementar em 2-3 rodadas: primeiro a fundação (Fases 1-3), depois dashboard (Fases 4-5), depois o restante (Fases 6-7).

