
# Preparação para lançamento — foco no agendamento

## Diagnóstico confirmado (verificado nesta rodada)

| # | Problema | Evidência |
|---|---|---|
| 1 | Nenhuma tabela está na publicação `supabase_realtime` | `select tablename from pg_publication_tables where pubname='supabase_realtime'` retornou vazio. Todos os `.on('postgres_changes')` (useAppointments, useRealtimeAppointments, useRealtimeDashboard) nunca disparam |
| 2 | Sem proteção de duplicidade no banco | `pg_constraint` em `appointments`: só PK, FKs e check de status. A trava existe apenas dentro da RPC `book_group_appointments` |
| 3 | Status `no_show` é inválido no banco | `appointments_status_check` permite apenas pending/confirmed/completed/cancelled, mas o código usa `no_show` |
| 4 | Cliente não consegue cancelar de fato | `ClientAppointments.tsx` faz `update` direto; RLS de `appointments` dá ao cliente somente `SELECT` (`appointments_client_read`). O update afeta 0 linhas e a UI mostra sucesso |
| 5 | Código morto e inseguro | `PublicBookingPage.tsx` + `ClientBookingFlow.tsx` não estão roteados em `App.tsx`, buscam serviços/profissionais sem filtrar por barbearia e inserem usando `barbershop_settings.limit(1)` |

O fluxo ativo do cliente é `/b/:userId/agendar` → `ClientBooking` → `GroupBookingFlow` → RPC `book_group_appointments`, que já valida horário comercial, bloqueios, conflitos com buffer e usa advisory lock. Essa base é boa e será preservada.

## O que será feito

### 1. Banco de dados (migration única)
- Adicionar `appointments` (e `appointment_services`, `blocked_slots`) à publicação `supabase_realtime` + `REPLICA IDENTITY FULL`.
- Índice único parcial impedindo duas marcações ativas para o mesmo profissional/data/hora:
  `unique (user_id, barbeiro_id, appointment_date, appointment_time) where status <> 'cancelled'`.
- Ampliar o check de status para incluir `no_show`.
- Índices de desempenho: `(user_id, appointment_date)` e `(barbeiro_id, appointment_date)`.
- Nova função `security definer` `cancel_client_appointment(_appointment_id, _reason)`: valida que o autor é o cliente dono (via `client_profiles`), que o cancelamento online está habilitado e que respeita `cancellation_hours_before`, e então grava `status='cancelled'`. Sem abrir política de UPDATE ampla para clientes.
- Nova função `security definer` `reschedule_client_appointment(_appointment_id, _date, _time)` reaproveitando as mesmas validações de disponibilidade da RPC de criação.
- Trigger `updated_at` em `appointments` (hoje não existe).

### 2. Fluxo do cliente (front)
- `ClientAppointments.tsx`: trocar o `update` direto pelas RPCs, tratar erros nomeados (`CANCELLATION_DISABLED`, `TOO_LATE_TO_CANCEL`, `SLOT_UNAVAILABLE`) com mensagens claras em português, e assinar realtime para refletir mudanças feitas pelo admin.
- `GroupBookingFlow.tsx`: mapear todos os códigos de erro da RPC para mensagens legíveis, revalidar disponibilidade imediatamente antes do envio, bloquear duplo clique e impedir seleção de horário já passado no dia corrente.
- Fuso horário: padronizar todo cálculo de data/hora em `America/Sao_Paulo` (a RPC já usa; o front usa `new Date()` local). Centralizar helpers em `src/lib/bookingAvailability.ts` para evitar deslocamento de dia/mês.

### 3. Agenda administrativa
- Confirmar que, com a publicação corrigida, criar/alterar/cancelar reflete sem recarregar.
- `useAppointments`: invalidar também as chaves de dashboard e disponibilidade; tratar erro de violação do índice único com mensagem "Horário já ocupado".
- Criação pelo admin passa a checar conflito antes de inserir (mesma regra da RPC), evitando erro cru do banco.

### 4. Limpeza e robustez
- Remover `src/pages/PublicBookingPage.tsx`, `src/components/booking/ClientBookingFlow.tsx` e os passos em `src/components/booking/public/*` que só eles usam (código morto e cross-tenant).
- Estados de carregamento, vazio e erro nas telas do fluxo; `ErrorBoundary` já existe e será aplicado às rotas do cliente.
- Metadados de `index.html` revisados para produção.

### 5. Testes
- Testes unitários em `src/lib/bookingAvailability.test.ts` e `groupBooking.test.ts` cobrindo sobreposição com buffer, virada de mês/ano e fuso.
- Verificação end-to-end via navegador: criar agendamento pelo portal do cliente, ver aparecer na agenda admin sem reload, tentar duplicar o horário, cancelar e confirmar liberação do slot.
- Ao final, relatório com aprovados / corrigidos / pendentes, revisão de RLS e veredito de lançamento.

## Fora de escopo nesta rodada
Reescrita visual de páginas, novas funcionalidades e integrações de pagamento/notificação além da verificação de que não quebram.

## Observação técnica
A migration é o primeiro passo e precisa da sua aprovação; as alterações de código vêm em seguida, na mesma sequência acima.
