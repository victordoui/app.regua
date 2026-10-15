# Plano de lançamento do VIZZU

Início: 15 de outubro de 2026.

## Regra de execução

Cada fase termina com evidências, riscos conhecidos, alterações locais,
alterações remotas e um critério explícito de aprovação.

## Fase 0 — congelamento e organização

Status: concluída em 15 de outubro de 2026.

- Registrar checkout, branch, remoto, servidor e projeto Supabase ativos.
- Preservar alterações locais anteriores.
- Documentar o escopo do MVP e itens adiados.
- Auditar migrations sem reparar o histórico remotamente nesta fase.
- Registrar o baseline de segurança do banco.
- Remover segredos e exemplos de chaves reais da documentação.

Saída: [baseline técnico](./phase-0-baseline-2026-10-15.md).

## Fase 1 — cadastro, trial e controle de acesso

Status: concluída em 15 de outubro de 2026, com as ressalvas registradas no
[relatório da fase](./phase-1-access-trial-2026-10-15.md).

- Conta de homologação criada e acesso inicial ao onboarding validado.
- Cadastro sem confirmação de e-mail, login e criação automática do trial validados.
- Exibir dias restantes do trial.
- Aplicar bloqueio de assinatura em todas as rotas protegidas.
- Tratar `suspended`, `expired`, `cancelled` e `pending_payment`.
- Validar expiração e redirecionamento para upgrade.
- Manter confirmação de e-mail desativada somente durante a etapa inicial.

Pendências movidas para homologação final: logout, recuperação por e-mail e
conclusão dos cinco passos do onboarding, porque dependem respectivamente da
jornada completa e da configuração de SMTP prevista na Fase 6.

## Fase 2 — Administração da Plataforma

Status: concluída em 15 de outubro de 2026, com ações destrutivas disponíveis
somente para superadmin e protegidas por confirmação.

- Listagem transformada em central de contas e ações.
- Suspensão, banimento, revogação de sessões e exclusão segura implementados no servidor.
- Empresa, perfil, plano, situação financeira e dias de trial exibidos.
- Ações administrativas registradas em auditoria.
- Métricas da central calculadas a partir dos dados reais do Supabase.

Saída: [relatório da Fase 2](./phase-2-platform-administration-2026-10-15.md).

## Fase 3 — nomenclatura e equipe

Status: concluída em 15 de outubro de 2026.

- `admin` exibido como Gestor do Negócio.
- `barbeiro` exibido como Colaborador nas áreas de equipe e acesso.
- `super_admin` exibido como Administrador da Plataforma.
- Barbeiros renomeado para Equipe nas superfícies genéricas; “profissional” foi mantido nos fluxos de atendimento ao cliente quando descreve quem presta o serviço.
- Convite, ativação e desativação mantidos; limite do plano também validado no servidor.

Os identificadores internos permanecem inalterados no primeiro lançamento para
evitar uma migração estrutural desnecessária.

Saída: [relatório da Fase 3](./phase-3-terminology-team-2026-10-15.md).

## Fase 4 — assinaturas e pagamentos

- Homologar Stripe, preços, checkout e webhook.
- Testar pagamento aprovado, recusado, renovação, upgrade e cancelamento.
- Calcular métricas financeiras com dados reais.
- Garantir que o frontend nunca ative plano por conta própria.

## Fase 5 — recursos essenciais do negócio

- Homologar empresa, serviços, equipe, horários, agenda e clientes.
- Homologar caixa, comissões, relatórios, cupons e fidelidade.
- Remover mocks, mapas demonstrativos e números fictícios.

## Fase 6 — infraestrutura e segurança

- Configurar domínio, URLs, origens, SMTP, OTP e proteção de senhas.
- Revisar Edge Functions públicas e aplicar proteção contra abuso.
- Corrigir alertas críticos dos Supabase Advisors.
- Conciliar o histórico de migrations antes de qualquer `db push`.

## Fase 7 — homologação final

- Executar jornadas completas em desktop e mobile.
- Validar isolamento entre dois negócios.
- Executar TypeScript, lint, testes, build e smoke test publicado.
- Registrar evidências e decisão de go-live.

## Fase 8 — publicação e estabilização

- Publicar o commit aprovado.
- Repetir cadastro e pagamento em produção.
- Monitorar Auth, banco, funções e Stripe.
- Tratar apenas incidentes críticos durante a estabilização inicial.
