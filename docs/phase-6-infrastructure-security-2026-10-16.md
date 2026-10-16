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
- `slugify_booking_business` agora usa `search_path` vazio e permanece sem
  execução para os papéis `anon` e `authenticated`.
- O índice duplicado de idempotência de `platform_payments.provider_event_id`
  foi removido; o índice único original foi preservado.

## Riscos e pendências de lançamento

- O histórico de migrations local e remoto está divergente. Não executar
  `supabase db push` até reconciliar o histórico de forma controlada.
- As exposições GraphQL listadas pelo Advisor exigem revisão por tabela: os
  dados públicos de agendamento podem ser intencionais, mas dados internos
  devem ter privilégios mínimos além do RLS.
- A triagem confirmou RLS ativo nas cinco tabelas expostas para `anon`:
  `public_business_profile`, `professional_directory`, `business_hours` e
  `services` alimentam a reserva pública; `platform_plan_config` alimenta a
  página pública de planos. Revogar essas leituras agora quebraria esses
  fluxos. A redução da superfície deve ser feita depois por uma API pública
  limitada, com testes de allow/deny por tabela.
- As funções `SECURITY DEFINER` que criam ou alteram agendamentos foram
  inspecionadas e validam `auth.uid()` e a relação do cliente antes de agir.
  Elas continuam exigindo revisão de permissões por fluxo antes do go-live.
- Ainda dependem do responsável pelo produto: domínio oficial, URLs de
  redirecionamento, SMTP, proteção contra senha vazada, credenciais de
  WhatsApp/push e o segredo do webhook Stripe.

## Decisão desta fase

O ambiente é adequado para desenvolvimento e homologação autenticada. Não é
aprovado para produção até que as configurações externas e os riscos acima
tenham dono, prazo e evidência de resolução.
