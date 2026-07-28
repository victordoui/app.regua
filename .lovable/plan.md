## Objetivo

Validar, com login real no preview, o ciclo completo de agendamento: criar, tentar duplicar, remarcar, cancelar — conferindo atualização instantânea (realtime) na agenda admin e na lista do cliente.

## Credenciais

- Admin: `admin@naregua.com` (senha fornecida no chat, usada apenas no login, nunca registrada em log/screenshot).
- Cliente: se não houver um login de cliente, criarei um cadastro de teste pelo próprio fluxo público `/b/:userId/cadastro`.

## Roteiro do teste

1. **Sessão admin** — login em `/login`, capturar dashboard e agenda (`/appointments`) para confirmar que a query de agendamentos carrega sem o erro PGRST200 de `barbeiro_id`.
2. **Criar** — novo agendamento pela agenda admin (cliente, serviço, profissional, data/hora futura). Confirmar que aparece no calendário sem recarregar a página.
3. **Duplicar** — tentar criar outro agendamento no mesmo profissional/horário. Esperado: bloqueio pelo índice único / verificação de conflito, com mensagem amigável em português (`translateBookingError`), sem registro duplicado no banco.
4. **Sessão cliente** — em contexto de navegador separado, entrar no portal `/b/:userId/login`, abrir "Meus agendamentos" e confirmar que o agendamento criado pelo admin aparece.
5. **Remarcar** — usar o `ClientRescheduleDialog` para mover o horário; conferir se os slots ofertados respeitam horário de funcionamento/buffer e se a agenda admin reflete a mudança em tempo real (aba admin aberta em paralelo).
6. **Cancelar** — cancelar pelo portal do cliente; conferir status `cancelled`, respeito à regra de horas mínimas de cancelamento, e atualização instantânea na agenda admin.
7. **Conferência no banco** — consultas de leitura em `appointments` / `appointment_services` para confirmar que cada passo gravou exatamente o esperado e que não sobrou duplicidade.
8. **Limpeza** — remover os registros de teste criados (agendamento e, se aplicável, cliente de teste), deixando a base como estava.

## Entrega

Relatório final com: passo a passo executado, screenshots de cada etapa, erros de console/rede encontrados, o que passou e o que falhou, e correções recomendadas (ou aplicadas, se forem bugs bloqueantes do fluxo de agendamento).

## Detalhes técnicos

- Playwright headless em `/tmp/browser/e2e-agendamento/`, viewport 1280x1800, dois `browser_context` (admin e cliente) para validar realtime cruzado.
- Senha lida de variável de ambiente dentro do script; nunca impressa nem capturada em screenshot.
- Verificações de banco por consultas somente-leitura; a limpeza final usa remoção dos registros criados no teste.
- Se algum passo falhar por bug de código, corrijo e re-executo o passo antes de fechar o relatório.
