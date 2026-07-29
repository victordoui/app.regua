## 1. Faturamento x agendamentos cancelados — auditoria (já verificada)

Verifiquei o código: **cancelados já não entram no faturamento** em nenhum ponto.

| Local | Como calcula | Situação |
|---|---|---|
| `useRealtimeDashboard` (receita do dia/mês) | filtra `status === 'completed'` | OK |
| `useRealtimeDashboard` (gráfico 6 meses) | query `.eq('status','completed')` | OK |
| `useSalesReports` (Relatórios/vendas) | query `.eq('status','completed')` | OK |
| `useBarberPerformance` | soma só quando `status === 'completed'` | OK |
| `Reports.tsx` | soma sobre `completed` | OK |

Ação nesta etapa: nenhuma correção de lógica necessária. Vou apenas adicionar um teste unitário simples sobre o cálculo de receita (completed vs. cancelled/pending) para travar esse comportamento contra regressões futuras.

## 2. Realtime cross-context — validação em navegador

Teste automatizado com Playwright em duas sessões simultâneas:

1. Sessão A: admin logado em `/appointments` na data do agendamento de teste.
2. Sessão B: cliente `qa.cliente.e2e@naregua.com` no portal.
3. Cliente **remarca** → conferir que o card na agenda admin muda de horário **sem refresh**.
4. Cliente **cancela** → conferir que o card fica cinza/riscado com selo CANCELADO **sem refresh**.
5. Conferir que os KPIs do Painel não somam o cancelado.

Se o admin não atualizar sozinho, a causa provável é o canal realtime de `useAppointments` (filtro `user_id`) não receber o evento das RPCs; nesse caso a correção será garantir a publicação realtime da tabela e/ou re-invalidar as queries do dashboard no mesmo canal. Nenhum dado de teste será removido.

## 3. Botões de acesso rápido na tela de login

Adicionar, abaixo do formulário de login, uma seção "Acesso rápido para testes" com 4 botões que preenchem e enviam o login automaticamente:

- **Admin** — `admin@naregua.com`
- **Super Admin** — `superadmin@naregua.com`
- **Profissional** — `barbeiro@naregua.com`
- **Cliente** — `qa.cliente.e2e@naregua.com`

Detalhes:
- Senha padronizada `admin123456` para as três contas de staff (senhas de `superadmin@` e `barbeiro@` serão redefinidas para essa senha; a do cliente também será alinhada).
- Botões sempre visíveis (inclusive no app publicado), conforme escolhido.
- Cada botão reaproveita o fluxo `signIn` já existente, incluindo o redirecionamento por papel (super admin → `/superadmin`, cliente → portal, demais → `/`).
- Visual discreto: botões `outline` pequenos em grade 2x2, com rótulo do papel e um ícone.

## Detalhes técnicos

- Arquivo alterado: `src/pages/Login.tsx` (nova seção de botões + handler `quickLogin(email)`).
- Redefinição de senha das contas de teste via update administrativo no Supabase Auth.
- Novo teste: `src/hooks/revenue.test.ts` (ou similar) cobrindo a exclusão de cancelados do total.
- Scripts de verificação E2E ficam em `/tmp/browser/` (fora do repositório).

## Observação de segurança

Botões de login com credenciais fixas visíveis em produção permitem que qualquer visitante entre como admin/super admin. Vou implementar como pediu, mas recomendo removê-los (ou limitá-los ao preview) antes do lançamento real.
