# Fase 4 — assinaturas e pagamentos

Implementação concluída em 15 de outubro de 2026. A ativação por webhook
permanece bloqueada até a configuração de um segredo externo do Stripe.

## Entregas

- `stripe_price_id` centralizado em `platform_plan_config` para cada plano pago.
- Checkout consulta o plano ativo no banco; não usa mais preços gravados no código.
- Checkout exige JWT, recusa plano inválido/inativo/sem preço e valida que o preço Stripe é mensal, ativo e em BRL.
- `provider_event_id` ficou protegido por índice único para impedir a duplicação de pagamentos quando o Stripe reenvia um evento.
- Painel de planos permite configurar o Stripe Price ID de cada plano pago.
- URLs temporárias e mensagens internas do Stripe não são enviadas ao cliente.
- O webhook continua sendo a única origem de ativação, renovação e cancelamento de assinatura.

## Evidências

- Os planos Básico, Profissional e Enterprise possuem Price IDs associados no banco.
- A Edge Function `create-checkout` foi publicada com `verify_jwt=true`.
- Chamada sem autenticação é recusada com HTTP 401.
- A conta de QA abriu uma sessão `cs_test` do Stripe para o plano Básico e retornou ao VIZZU sem pagamento.
- Testes automatizados: 60 aprovados; TypeScript, lint e build aprovados.

## Bloqueio externo para fechar a homologação

O ambiente remoto possui `STRIPE_SECRET_KEY`, mas não possui
`STRIPE_WEBHOOK_SECRET`. Para concluir esta fase, cadastre no Supabase o segredo
do endpoint criado no Stripe apontando para:

`https://yjuqixthmwgnzkjummaf.supabase.co/functions/v1/stripe-webhook`

Eventos necessários: `checkout.session.completed`,
`customer.subscription.updated` e `customer.subscription.deleted`.

Depois disso, usar uma compra com cartão de teste do Stripe para validar
ativação, renovação, cancelamento, pagamento recusado e gravação em
`platform_payments`.
