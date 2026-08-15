# VIZZU — checklist de lançamento

Última revisão técnica: 15 de agosto de 2026.

## Validado no código e no Supabase

- [x] Cadastro com plano **Teste gratuito** configurável e duração padrão de 7 dias.
- [x] Perfil do proprietário criado como administrador; membros de equipe usam perfis separados.
- [x] Fluxos de recuperação de senha, upgrade e redirecionamento de assinaturas expiradas.
- [x] Agendamentos transacionais com verificação de conflito, horário comercial, bloqueios, serviços múltiplos e recorrência.
- [x] Isolamento de dados entre negócios validado para o proprietário.
- [x] Dados públicos da página do cliente separados das configurações privadas do negócio.
- [x] Funções de equipe, comunicação, lembretes e checkout publicadas no Supabase.
- [x] Checkout Stripe exige token de usuário, controla origem e evita registrar e-mail ou URL temporária nos logs.
- [x] Webhook Stripe valida assinatura, ativa novo plano/upgrade e acompanha mudança ou cancelamento de assinatura.
- [x] Pagamento PIX simulado removido do cadastro; não há liberação por confirmação local.
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit` e `npm run build` aprovados na revisão.

## Necessário antes de produção

- [ ] Definir o domínio oficial em `SITE_URL`/`APP_URL` ou `ALLOWED_ORIGINS` nas funções Supabase.
- [ ] Configurar SMTP, URLs de redirecionamento e expiração de OTP inferior a uma hora no Supabase Auth.
- [ ] Ativar proteção contra senhas vazadas no Supabase Auth.
- [ ] Configurar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` de produção.
- [ ] Criar endpoint Stripe para `checkout.session.completed`, `customer.subscription.updated` e `customer.subscription.deleted`.
- [ ] Configurar credenciais de WhatsApp, push e segredo do cron de lembretes.
- [ ] Criar um funcionário de homologação e validar permissões delegadas.
- [ ] Executar um pagamento de homologação e confirmar ativação, upgrade, cancelamento e bloqueio de acesso.
- [ ] Atualizar o PostgreSQL conforme recomendação do Security Advisor do Supabase.
- [ ] Revisar e fazer merge da PR na `main`, depois repetir o smoke test no ambiente publicado.

## Evidências de publicação

- Repositório: `victordoui/app.regua`.
- Branch de revisão: `codex/signup-plan-flow`.
- Pull request: `#1 — Harden VIZZU launch readiness`.
- O arquivo `.env` local não é incluído nos commits de revisão.
