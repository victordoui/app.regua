# Runbook de produção do VIZZU

Use este roteiro antes de liberar clientes reais. Não cole segredos no repositório nem no navegador.

## 1. Domínio e Supabase Auth

1. Defina o domínio HTTPS oficial do VIZZU em **Authentication > URL Configuration**.
2. Configure `Site URL` para esse domínio e inclua as rotas de redirecionamento de produção, login e recuperação de senha.
3. Configure um SMTP transacional verificado para mensagens de confirmação e recuperação.
4. Reduza a validade do OTP de e-mail para menos de uma hora.
5. Ative a proteção contra senhas vazadas.
6. Faça uma criação de conta real de homologação, confirme o e-mail e execute a recuperação de senha.

## 2. Stripe

1. Cadastre os segredos de produção das chaves Stripe no Supabase, sem expô-los ao frontend.
2. Cadastre o endpoint `stripe-webhook` no Stripe com o segredo de assinatura correspondente.
3. Assine, no mínimo, os eventos `checkout.session.completed`, `customer.subscription.updated` e `customer.subscription.deleted`.
4. Configure `SITE_URL`, `APP_URL` e `ALLOWED_ORIGINS` com o domínio oficial; remova origens de desenvolvimento da configuração de produção.
5. Execute uma assinatura de homologação e valide: redirecionamento, webhook, ativação do plano e bloqueio/liberação de acesso.

## 3. Comunicação e jobs

1. Configure os provedores e segredos de WhatsApp e push, se esses canais forem ofertados no lançamento.
2. Configure o agendamento do job de lembretes com uma credencial de serviço própria.
3. Valide convite de funcionário, confirmação de acesso e lembrete de agendamento em uma conta de homologação.

## 4. Homologação de lançamento

Execute e registre evidências para estas jornadas:

- Novo negócio: cadastro, `Teste gratuito` de sete dias, confirmação e onboarding.
- Conta existente: login, recuperação de senha e upgrade depois do vencimento.
- Dono: criação de equipe, serviços, horários e bloqueios de agenda.
- Cliente: agendamento de uma pessoa e de grupo, cancelamento e remarcação.
- Operação: agendamento recém-criado visível na agenda e isolamento entre dois negócios.
- Pagamento: plano pago ativado por webhook Stripe real.
- Mobile: telas de cadastro, agendamento e agenda em largura de 360 a 430 px.

## 5. Decisão de go-live

Libere somente após todos os itens acima passarem, os alertas críticos do Supabase serem revisados e o pull request de lançamento ser aprovado e mesclado na `main`.
