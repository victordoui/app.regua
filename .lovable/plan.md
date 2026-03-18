

# VIZZU Redesign Completo — Light Mode · Paleta Azul

Este é um redesign massivo que toca praticamente todos os aspectos visuais do sistema. Para ser executável de forma segura e iterativa, proponho dividir em **6 fases sequenciais** (cada fase = 1 prompt de implementação).

---

## Fase 1 — Fundação: Design Tokens + Light Mode Forçado + Tipografia

**Arquivos:** `src/index.css`, `src/App.tsx`, `index.html`

- Substituir todas as CSS variables em `:root` pelos novos tokens (brand, page, card, bordas, textos, status, radii)
- Remover a classe `.dark` e `.light` — usar apenas `:root` com light mode
- Alterar `ThemeProvider` em `App.tsx`: `defaultTheme="light"` 
- Atualizar Google Fonts link no `index.html` para incluir todos os pesos necessários
- Adicionar scrollbar customizada (4px azul)
- Adicionar animação `fadeUp` global

---

## Fase 2 — Layout: Remover Topbar + Ajustar Content Area

**Arquivos:** `src/components/Layout.tsx`

- Remover completamente o `<header>` (topbar) do Layout
- Mover notificações e perfil do header para a sidebar (footer)
- Content area: `padding: 28px 28px 40px`, sem header offset
- Sidebar fixa a 234px, content ocupa o restante

---

## Fase 3 — Sidebar: Redesign Completo

**Arquivo:** `src/components/Sidebar.tsx`

- Width fixo 234px, `bg-white`, `border-right: 1px solid #E2E8F0`
- Header: Logo + "VIZZU" todas letras `#2563EB`, Montserrat 800, sem badge PRO
- Barra de busca com ícone + placeholder "Buscar..." + `⌘K`
- Labels de seção: 9px uppercase `#94A3B8` com linha divisória `::after`
- Itens: 13px Open Sans 500, ícones 15px, hover `#EFF6FF`, ativo `bg #2563EB text white`
- Badge "12" pill azul na Agenda
- Footer: card upgrade com gradiente `#EFF6FF → #EDE9FE`, botão azul; user row com avatar gradiente
- Item "Sair" em vermelho `#E11D48`
- Modo colapsado 60px (tablet), bottom nav 5 ícones (mobile)

---

## Fase 4 — Dashboard: Hero + KPI Strip

**Arquivos:** `src/pages/Index.tsx`, `src/components/dashboard/DashboardOverview.tsx`

- Hero section: date pill + "Olá, [Nome] 👋" Montserrat 22px 800 + subtítulo + botões "Filtros" e "Novo Agendamento"
- 4 KPI cards em grid 4 colunas: barra colorida 3px no topo, ícone 44px com bg colorido, valor Montserrat 28px 800, tag de variação (pill verde/vermelho)
- Animação fadeUp escalonada nas seções

---

## Fase 5 — Dashboard: Main Grid (3 colunas)

**Arquivos:** novos componentes em `src/components/dashboard/`

- **Coluna 1:** Heatmap de Ocupação (5×7 grid, 6 intensidades de azul)
- **Coluna 2:** Gráfico de Faturamento Mensal (SVG linha + área + meta pontilhada verde)
- **Coluna 3:** Mini calendário (dia 17 ativo azul, dots de agendamento) + Agenda de Hoje (3 itens com barra colorida lateral)

---

## Fase 6 — Dashboard: Bottom Row (3 colunas)

**Arquivos:** novos componentes em `src/components/dashboard/`

- **Card 1:** Transações Recentes (tabela com status pills coloridos: Pago, Pendente, Cancelado, Em Atend.)
- **Card 2:** Profissionais (avatares gradientes circulares + dot online/offline + rating)
- **Card 3:** Receita do Mês (donut chart SVG 3 fatias + barra de meta + legenda)

---

## Observações Técnicas

- Todas as fontes usam classes Tailwind: `font-['Montserrat']` e `font-['Open_Sans']`
- Sombras sempre com `rgba(37,99,235,...)` — nunca cinza
- Fundo de página sempre `#FFFFFF`
- Nenhuma rota, autenticação ou lógica de negócio será alterada
- Os novos componentes do dashboard usam dados mockados inicialmente, conectados aos hooks existentes onde possível

**Recomendação:** Aprovar e implementar **Fase 1** primeiro, depois avançar fase por fase para manter controle e evitar regressões.

