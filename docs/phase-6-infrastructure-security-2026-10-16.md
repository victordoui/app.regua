# Fase 6 — infraestrutura e segurança

Data: 16 de outubro de 2026.

## Verificado

- As Edge Functions publicadas estão ativas. As funções administrativas e de
  checkout exigem JWT; o webhook Stripe permanece sem JWT por exigir a
  assinatura do próprio Stripe.
- O checkout já possui chave de teste no ambiente remoto, mas o segredo de
  validação do webhook (`STRIPE_WEBHOOK_SECRET`) continua ausente. Portanto,
  nenhum plano deve ser liberado com base apenas no retorno do navegador.
- A função transacional de agendamento usa `search_path` fixo e valida os
  dados de empresa, serviço, colaborador, horários e conflito no banco.

## Riscos e pendências de lançamento

- O histórico de migrations local e remoto está divergente. Não executar
  `supabase db push` até reconciliar o histórico de forma controlada.
- O Advisor encontrou um índice duplicado em `platform_payments` para
  `provider_event_id`; é uma otimização segura, mas precisa ser removida em
  uma migration reconciliada para preservar a idempotência do webhook.
- `slugify_booking_business` não fixa `search_path`, alerta de segurança a
  corrigir junto com a revisão de funções existentes.
- As exposições GraphQL listadas pelo Advisor exigem revisão por tabela: os
  dados públicos de agendamento podem ser intencionais, mas dados internos
  devem ter privilégios mínimos além do RLS.
- Ainda dependem do responsável pelo produto: domínio oficial, URLs de
  redirecionamento, SMTP, proteção contra senha vazada, credenciais de
  WhatsApp/push e o segredo do webhook Stripe.

## Decisão desta fase

O ambiente é adequado para desenvolvimento e homologação autenticada. Não é
aprovado para produção até que as configurações externas e os riscos acima
tenham dono, prazo e evidência de resolução.
