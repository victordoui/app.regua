

# Redesign do Dashboard — Estilo Premium Dark Mode

## Visão Geral

Redesenhar o `DashboardOverview` e seus subcomponentes para seguir o estilo da imagem de referência: KPI cards grandes com ícones em gradiente azul, gráficos estilizados com a paleta VIZZU, ProfileCard compacto e elegante, e agenda do dia com visual timeline.

## Arquivos a editar

### 1. `src/components/dashboard/DashboardOverview.tsx` — Novo layout de grid

Reorganizar o layout em 4 seções:
- **Topo**: 4 KPI cards grandes em grid `grid-cols-2 lg:grid-cols-4` (Agendamentos Hoje, Receita do Mês, Clientes Totais, Taxa de Ocupação)
- **Meio**: 2 colunas — Gráfico de Receita (AreaChart, não BarChart) + Gráfico de Serviços (donut)
- **Inferior**: 3 colunas — Agenda do Dia + Atividades Recentes + ProfileCard/CTA
- **Base**: Aniversariantes + Inativos (mantém)

Remover `StatMiniCard` individual e usar novos KPI cards grandes.

### 2. `src/components/dashboard/StatMiniCard.tsx` → Redesign como `KPICard`

Transformar em card grande estilo referência:
- Fundo `bg-[#282828]` com `rounded-xl`
- Ícone em circle com gradiente azul (`bg-gradient-to-r from-[#4FA3FF] to-[#1F4FA3]`)
- Valor grande (`text-3xl font-bold text-white`)
- Label em `text-[#B0B0B0] text-sm`
- Subtítulo com indicador de tendência (seta verde/vermelha + percentual)
- Sem border-left, visual mais limpo e amplo

### 3. `src/components/dashboard/ProfileCard.tsx` — Compactar

- Manter avatar + nome + badge de plano
- Adicionar barra de progresso azul "uso do plano" ou "agendamentos restantes"
- Remover QR code da card (deixar em settings)
- Background com gradiente sutil `from-[#282828] to-[#1F1F1F]`

### 4. `src/components/dashboard/TodayScheduleCard.tsx` — Visual timeline

- Manter lógica de dados
- Redesenhar visual: timeline vertical com dot indicator colorido por status
- Linha de conexão entre agendamentos (`border-l-2 border-[#404040]`)
- Horário à esquerda, info à direita
- Status dot: verde (concluído), azul (confirmado), amarelo (pendente), vermelho (cancelado)
- Max height com scroll suave

### 5. `src/components/charts/RevenueChart.tsx` — AreaChart com gradiente

- Trocar `BarChart` → `AreaChart` com fill gradiente azul (transparente → `#4FA3FF`)
- Stroke `#4FA3FF`, strokeWidth 2
- Grid lines mais sutis (`stroke: #333333`)
- Tooltip dark estilizado
- Remover borda do card (já herda do sistema)

### 6. `src/components/charts/OccupancyChart.tsx` — Refinamento

- Manter `LineChart`
- Stroke primário com `#4FA3FF`, meta com `#404040` tracejada
- Área preenchida sutil sob a linha de ocupação
- Dots com glow effect (`filter: drop-shadow`)

### 7. `src/components/charts/ServicesChart.tsx` — Donut refinado

- Paleta: `#4FA3FF`, `#1F4FA3`, `#6BB8FF`, `#0D3A8F`, `#404040`
- Inner radius maior (60) para visual donut mais elegante
- Legend inline abaixo com dots coloridos
- Texto central com total de serviços

### 8. `src/components/dashboard/CTACard.tsx` — Card com gradiente azul

- Background: `bg-gradient-to-br from-[#1F4FA3]/30 to-[#4FA3FF]/10`
- Borda sutil `border-[#4FA3FF]/20`
- Botão primário gradiente
- Manter conteúdo (relatórios)

## Resultado

Dashboard premium dark mode com KPIs visuais impactantes, gráficos com paleta azul consistente, e agenda do dia em formato timeline. Hierarquia visual clara entre métricas, gráficos e listas operacionais.

