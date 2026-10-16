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
- Um cliente de homologação foi criado e ficou disponível imediatamente no
  formulário de agenda.
- Um agendamento futuro foi salvo com cliente, serviço e colaborador reais e
  ficou visível no calendário. A tentativa inicial em um horário já passado
  foi corretamente recusada pelo servidor.
- O caixa carregou o serviço configurado no onboarding, sem catálogo
  demonstrativo; nenhuma venda financeira foi finalizada durante a revisão.
- Cupons e fidelidade abriram em estado vazio coerente, sem dados fictícios.
  As áreas de comissão e relatórios refletiram corretamente o agendamento
  pendente: uma marcação, zero atendimento concluído e receita zerada.
- Na continuação da homologação, esse mesmo agendamento foi concluído. Os
  relatórios passaram a mostrar 1 atendimento concluído e R$ 35,00 de receita
  mensal; as comissões mostraram R$ 14,00 para o colaborador, conforme a regra
  padrão de 40%.

## Correção realizada

O onboarding enviava apenas os campos que ele edita. O salvamento das
configurações tratava os campos opcionais de SEO/compartilhamento como
obrigatórios e chamava `trim()` em valores ausentes. A persistência agora
aceita esses campos ausentes e os normaliza como `null`.

## Ainda a homologar nesta fase

- Validar o bloqueio de conflito de horário pelo fluxo autenticado da agenda.
- Definir e validar quando um atendimento concluído deve gerar lançamento no
  caixa; hoje agenda e caixa são fluxos separados.
- Verificar permissões do colaborador com um login delegado.
- Remover ou substituir os componentes demonstrativos que ainda não fazem
  parte das telas ativas do painel.
