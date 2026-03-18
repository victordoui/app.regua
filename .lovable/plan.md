

# Replicar layout do PlanMate adaptado ao VIZZU

## Análise da Imagem de Referência
O dashboard PlanMate apresenta: (1) saudação personalizada com subtítulo, (2) 4 status cards horizontais com ícone colorido, título, valor grande e subtítulo, (3) dois gráficos lado a lado (linha + barras), (4) timeline/calendário na parte inferior. A fonte usada é **Inter** (padrão em dashboards SaaS modernos).

---

## Mudanças Planejadas

### 1. Adicionar fonte Inter (`index.html` + `tailwind.config.ts`)
- Adicionar `Inter:wght@400;500;600;700` ao Google Fonts já existente no `index.html`
- Configurar `fontFamily: { inter: ['Inter', 'sans-serif'] }` no Tailwind
- Aplicar `font-inter` como fonte base do dashboard (mantendo Montserrat/Open Sans nas demais páginas, ou migrando globalmente conforme preferência)

### 2. Redesenhar `DashboardOverview.tsx` — layout inspirado no PlanMate
- **Seção de boas-vindas**: Greeting personalizado ("Organize e cresça, [Nome]! 🔥") com subtítulo descritivo, substituindo o ProfileCard do topo
- **4 Status Cards horizontais** (grid 4 colunas): Agendamentos Hoje, Concluídos, Pendentes, Cancelados — cada um com ícone colorido em circle badge, título, valor grande e subtítulo "nas últimas 24h". Redesenhar o `StatMiniCard` ou criar novo componente `DashboardStatCard`
- **2 Gráficos lado a lado** (grid 2 colunas): RevenueChart + OccupancyChart (ou ServicesChart)
- **Seção inferior**: TodayScheduleCard em largura total (estilo timeline), seguido de RecentActivities + BirthdayClients

### 3. Criar componente `DashboardStatCard.tsx`
- Card com: ícone em círculo colorido (cor customizável), título em texto pequeno, valor numérico grande (font-bold), subtítulo em cinza
- Menu de 3 pontos (⋯) no canto superior direito (decorativo, como na referência)
- Estilo: fundo branco, border sutil, rounded-xl

### 4. Seção de boas-vindas (`WelcomeSection`)
- Nome do usuário extraído do `useAuth()`
- Título em font-bold grande + emoji
- Subtítulo descritivo em texto muted

### 5. Mover ProfileCard
- O ProfileCard atual sai do grid principal e pode ser acessado via header/dropdown (já existe lá)

---

## Arquivos Modificados
1. **`index.html`** — adicionar Inter ao Google Fonts
2. **`tailwind.config.ts`** — adicionar `fontFamily.inter`
3. **`src/components/dashboard/DashboardStatCard.tsx`** — novo componente de stat card estilo PlanMate
4. **`src/components/dashboard/DashboardOverview.tsx`** — redesenhar layout completo
5. **`src/index.css`** — (opcional) aplicar Inter como font-family base

## Resultado
Dashboard com visual clean inspirado no PlanMate: saudação pessoal, 4 cards de métricas horizontais, gráficos lado a lado, e seções operacionais abaixo — tudo adaptado ao contexto VIZZU (agendamentos, clientes, receita).

