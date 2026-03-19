

# Plano: Adicionar dados de teste/demo ao Dashboard

## Resumo
Quando não há dados reais do Supabase (tudo zerado), o hook `useRealtimeDashboard` retornará dados mock realistas para que o painel pareça funcional e preenchido.

## Alterações

### 1. `src/hooks/useRealtimeDashboard.ts`
Após o fetch dos dados reais, se todos os valores forem zero (sem dados no banco), substituir pelos dados mock:

- **Métricas KPI**: todayAppointments=12, monthAppointments=187, monthRevenue=18450, totalClients=342, newClientsThisMonth=23, completedRate=87, occupancyRate=72, activeSubscriptions=3
- **monthlyRevenue** (6 meses): Out=12400, Nov=15800, Dez=14200, Jan=18900, Fev=16500, Mar=18450
- **weeklyAppointments** (7 dias): Dom=2, Seg=8, Ter=12, Qua=10, Qui=14, Sex=16, Sáb=18
- **recentActivities**: 5 atividades fictícias com nomes, horários e tipos variados

### 2. `src/components/dashboard/TodayAppointmentsPanel.tsx`
Quando `todayAppointments` do hook retornar vazio, exibir lista mock com 4 agendamentos fictícios (nomes, serviços, horários, valores) em vez de "Nenhum agendamento hoje".

### 3. `src/components/dashboard/RecentTransactionsPanel.tsx`
Quando `transactions` estiver vazio, exibir 5 transações mock com nomes de clientes, serviços, status variados (completed, confirmed, pending) e valores.

### 4. `src/components/dashboard/ProfessionalsPanel.tsx`
Quando `barbers` estiver vazio, exibir 5 profissionais mock com nomes, scores de performance variados (95, 88, 76, 62, 50) e ratings.

Todos os dados mock serão claramente realistas para um salão/barbearia brasileiro.

