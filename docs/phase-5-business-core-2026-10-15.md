# Fase 5 — operação essencial do negócio

Data: 15 de outubro de 2026.

## Homologado na conta de teste

- O onboarding completo foi executado em uma conta de trial ativa, sem
  confirmação de e-mail: dados da empresa, serviço, colaborador, horários e
  conclusão foram persistidos.
- O fluxo voltou para a visão geral ao final do onboarding.
- O limite de um colaborador do plano de teste foi aplicado na interface após
  o primeiro cadastro.
- O painel vazio agora orienta o primeiro agendamento e não afirma crescimento
  de receita quando não existe atendimento no período.

## Correção realizada

O onboarding enviava apenas os campos que ele edita. O salvamento das
configurações tratava os campos opcionais de SEO/compartilhamento como
obrigatórios e chamava `trim()` em valores ausentes. A persistência agora
aceita esses campos ausentes e os normaliza como `null`.

## Ainda a homologar nesta fase

- Criar cliente e agendamento, incluindo conflito de horário e alteração de
  status.
- Validar caixa, comissão, cupons, fidelidade e relatórios com dados reais de
  homologação.
- Verificar permissões do colaborador com um login delegado.
- Remover ou substituir os componentes demonstrativos que ainda não fazem
  parte das telas ativas do painel.
