# Fase 1 — cadastro, trial e controle de acesso

Concluída em 15 de outubro de 2026.

## Entregas

- Cadastro de empresário sem confirmação de e-mail mantido para o lançamento inicial.
- Trial de 7 dias criado automaticamente e associado ao empresário.
- Validação da assinatura adicionada às rotas protegidas de empresário e funcionário.
- Estados `suspended`/`paused`, `expired`, `cancelled`, `pending_payment` e assinatura ausente bloqueiam o uso.
- Empresário bloqueado é direcionado à tela de planos com o motivo visível.
- Funcionário bloqueado recebe uma mensagem para procurar o gestor do negócio.
- Superadmin ignora o bloqueio comercial para conseguir administrar a plataforma.
- Política RLS permite ao funcionário ler somente a assinatura da empresa vinculada.
- A tela de upgrade permanece acessível durante o bloqueio para permitir regularização.

## Evidências

- Conta de QA criada em 15/10/2026 com perfil `admin` ativo.
- Assinatura `trial`, `active`, gratuita, de 15/10/2026 a 22/10/2026.
- Teste remoto temporário alterou o trial de QA para `suspended`.
- A navegação foi redirecionada para `/upgrade?motivo=suspended` e exibiu o aviso correto.
- O trial foi restaurado para `active` e o onboarding voltou a abrir normalmente.
- Política remota confirmada como `platform_subscriptions_business_read` para `authenticated`.
- 59 testes aprovados.
- `npx tsc --noEmit`, `npm run lint` e `npm run build` aprovados.

## Ressalvas e próximos testes

- A conclusão dos cinco passos do onboarding será validada junto aos recursos essenciais da Fase 5.
- A recuperação de senha por e-mail depende do SMTP e será homologada na Fase 6.
- O fluxo de logout será repetido na jornada completa da Fase 7.
- O histórico remoto de migrations continua divergente; a migration desta fase foi aplicada por SQL
  controlado, sem executar `supabase db push`.
