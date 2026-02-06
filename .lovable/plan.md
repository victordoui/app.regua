
# Plano: Corrigir Erro de Cadastro + Integrar Pagamento (Stripe + PIX)

## Problema Atual

O erro "Erro de configuracao interna. Contate o suporte." acontece porque a tabela `barbershop_settings` nao tem uma constraint UNIQUE na coluna `user_id`, mas a funcao RPC `create_subscriber_with_subscription` usa `ON CONFLICT (user_id)`. Isso precisa ser corrigido primeiro.

## O que sera feito

### 1. Correcao do banco de dados (Migration)

Adicionar constraint UNIQUE na coluna `user_id` da tabela `barbershop_settings` para que o `ON CONFLICT` funcione corretamente.

```text
ALTER TABLE barbershop_settings ADD CONSTRAINT barbershop_settings_user_id_key UNIQUE (user_id);
```

### 2. Adicionar coluna de status de pagamento na subscription

Adicionar campo `payment_status` na tabela `platform_subscriptions` para rastrear se o plano foi pago:

```text
ALTER TABLE platform_subscriptions ADD COLUMN payment_status text DEFAULT 'pending';
-- Valores: 'pending', 'paid', 'free' (para trial)
```

### 3. Habilitar Stripe

Usar a integracao nativa do Lovable com Stripe para processar pagamentos com cartao de credito. Sera necessario configurar a chave secreta do Stripe.

### 4. Edge Function: `create-checkout` 

Criar edge function que:
- Recebe o `plan_type` e `user_id`
- Busca o preco do plano em `platform_plan_config`
- Cria uma Stripe Checkout Session para pagamento com cartao
- Retorna a URL de checkout para redirecionar o usuario
- Apos pagamento confirmado, atualiza `payment_status` na subscription

### 5. Edge Function: `stripe-webhook`

Criar edge function para receber webhooks do Stripe:
- Escuta o evento `checkout.session.completed`
- Atualiza `payment_status` para 'paid' na `platform_subscriptions`
- Ativa a subscription do usuario

### 6. Atualizar fluxo de cadastro (`SignupPage.tsx`)

Modificar o Step 3 (Confirmacao) para incluir a logica de pagamento:

```text
Fluxo atualizado:
1. Usuario preenche dados (Step 1)
2. Escolhe plano (Step 2)
3. Confirmacao + Pagamento (Step 3):
   - Se plano = "trial": cria conta diretamente (gratis)
   - Se plano pago: exibe opcoes de pagamento
     - Cartao (Stripe): redireciona para Stripe Checkout
     - PIX: exibe QR Code com valor do plano
```

### 7. Adicionar Step 4: Pagamento (novo step no wizard)

Novo step no wizard de cadastro que aparece apenas para planos pagos:

- Exibe o resumo do plano escolhido e valor
- Dois botoes: "Pagar com Cartao" e "Pagar com PIX"
- **Cartao**: Redireciona para Stripe Checkout, que ao completar volta para `/onboarding`
- **PIX**: Mostra o componente `PixPayment` ja existente com o valor do plano. Botao "Ja paguei" marca como pendente de confirmacao

### 8. Pagina de retorno do Stripe

Ao voltar do Stripe Checkout com sucesso, o usuario e redirecionado para `/onboarding` e a subscription ja esta ativa.

---

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| Migration SQL | Criar - UNIQUE constraint em barbershop_settings.user_id + payment_status |
| `supabase/functions/create-checkout/index.ts` | Criar - edge function Stripe Checkout |
| `supabase/functions/stripe-webhook/index.ts` | Criar - webhook Stripe |
| `supabase/config.toml` | Modificar - registrar novas edge functions |
| `src/pages/public/SignupPage.tsx` | Modificar - adicionar step de pagamento para planos pagos |

## Detalhes tecnicos

### Fluxo de pagamento no cadastro

```text
Usuario escolhe plano
        |
    Trial? ----Sim----> Cria conta gratis -> Onboarding
        |
       Nao
        |
    Step 4: Pagamento
        |
   +----+----+
   |         |
 Cartao     PIX
   |         |
 Stripe    QR Code
Checkout   PixPayment
   |         |
Webhook    "Ja paguei"
   |         |
 Ativa     Pendente
 sub.     confirmacao
   |         |
   +----+----+
        |
    Onboarding
```

### Stripe Checkout Session

```text
- line_items: [{ price_data com valor do plano }]
- mode: 'payment' (pagamento unico por enquanto)
- success_url: {origin}/onboarding?payment=success
- cancel_url: {origin}/cadastro?payment=cancelled
- metadata: { user_id, plan_type, subscription_id }
```

### PIX no cadastro

Reutilizar o componente `PixPayment` ja existente. A chave PIX e dados do comerciante virao de uma configuracao ou variavel de ambiente.

### Configuracao necessaria do usuario

- Chave secreta do Stripe (sera solicitada ao habilitar)
- Chave PIX para recebimento (pode ser configurada no Super Admin futuramente)
