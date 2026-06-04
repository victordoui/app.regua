# Revisão de UI/UX — Sidebar, Navegação e Tipografia

## Objetivo
Elevar a qualidade visual do VIZZU padronizando tipografia, melhorando a sidebar (logo e fontes) e eliminando as abas do Painel — transformando-as em sub-rotas dentro da sidebar, igual ao padrão de "Meu Negócio".

---

## 1. Sidebar — Logo e Tipografia

**Logo:**
- Remover o contorno branco e o fundo `bg-white/5` ao redor da logo.
- Aumentar para `h-28 w-28` (atualmente `h-20 w-20`), centralizada, sem moldura.
- Manter a logo nas cores originais (sem `brightness-0 invert`).

**Fontes da sidebar (padronizadas):**
- Categorias (nível 1): `text-sm` (14px) `font-semibold`.
- Sub-itens (nível 2): `text-[13px]` `font-medium`.
- Ícones nível 1: `h-[18px] w-[18px]` (hoje 16px, parecem pequenos).
- Ícones nível 2: `h-4 w-4` (hoje 14px).
- Espaçamento vertical interno aumentado: `py-2.5` nos sub-itens.
- Badge: mantém `bg-red-500`, padronizada em `text-[10px]`.

**Footer:**
- Nome do usuário em `text-sm`, label de papel em `text-xs` (mais legível).
- Avatar: `w-9 h-9`.

---

## 2. Painel (Dashboard) — Abas viram sub-rotas

Hoje `/` (Painel) usa um `<Tabs>` interno com 3 abas: **Visão Geral**, **Desempenho**, **Sucesso do Cliente**. Vamos eliminá-las visualmente e transformá-las em itens da sidebar, igual ao padrão de "Meu Negócio".

**Nova estrutura da categoria "Dashboard" na sidebar:**
```text
Dashboard
 ├─ Visão Geral          → /
 ├─ Desempenho           → /dashboard/desempenho
 └─ Sucesso do Cliente   → /dashboard/sucesso-cliente
```

**Mudanças técnicas:**
- Adicionar rotas `/dashboard/desempenho` e `/dashboard/sucesso-cliente` em `App.tsx`, ambas renderizando `Layout` + o respectivo componente (`BarberPerformanceContent`, `CustomerSuccessContent`).
- Remover o bloco `<Tabs>` de `DashboardOverview.tsx`. A página `/` passa a renderizar somente o conteúdo de "Visão Geral".
- Atualizar `Sidebar.tsx` para que a categoria "Dashboard" tenha 3 sub-itens (deixa de ser categoria single-item, vira collapsible).
- Cada nova página reaproveita o bloco de "active tab indicator" (ícone + título + subtítulo) como cabeçalho da página, mantendo a consistência visual já existente.

---

## 3. Padronização Tipográfica Global

Criar uma escala única e aplicá-la em todo o sistema. Definir como utilitários em `index.css`:

| Token              | Tamanho | Peso | Uso                                  |
|--------------------|---------|------|--------------------------------------|
| `text-page-title`  | 22px    | 800  | Título principal da página           |
| `text-page-subtitle` | 13px  | 500  | Subtítulo da página (muted)          |
| `text-section`     | 16px    | 700  | Título de seção/card                 |
| `text-card-label`  | 13px    | 600  | Labels de KPI                        |
| `text-kpi`         | 28px    | 800  | Valor de KPI                         |
| `text-body`        | 14px    | 400  | Corpo padrão                         |
| `text-meta`        | 12px    | 500  | Metadata/timestamps                  |

**Aplicação inicial (escopo desta revisão):**
- `Topbar.tsx` — título/subtítulo da página.
- `DashboardOverview.tsx` — cabeçalho do "Painel Analítico" e indicadores de aba.
- `KpiStrip.tsx`, `StatMiniCard.tsx` — KPIs.
- Tabs internas remanescentes (ex.: Tabs em outras páginas) recebem `text-sm font-semibold` consistente.

Demais páginas serão ajustadas em iterações seguintes — esta etapa estabelece os tokens e aplica nas áreas de maior impacto visual (sidebar + dashboard + topbar).

---

## Arquivos afetados

- `src/components/Sidebar.tsx` — logo maior sem contorno, tipografia ajustada, categoria Dashboard vira collapsible com 3 sub-itens.
- `src/components/dashboard/DashboardOverview.tsx` — remove `<Tabs>`, deixa só Visão Geral.
- `src/App.tsx` — registra `/dashboard/desempenho` e `/dashboard/sucesso-cliente`.
- Novos arquivos: `src/pages/DashboardPerformance.tsx`, `src/pages/DashboardCustomerSuccess.tsx` (wrappers finos com `Layout` + cabeçalho + componente existente).
- `src/index.css` — utilitários tipográficos.
- `src/components/Topbar.tsx` — aplicar tokens.
- `src/components/dashboard/KpiStrip.tsx` — aplicar tokens.

## Fora do escopo
- Redesign de cada página interna (Clientes, Agenda, etc.) — fica para iteração seguinte usando os mesmos tokens.
- Mudança de paleta de cores.
- Mobile bottom nav.
