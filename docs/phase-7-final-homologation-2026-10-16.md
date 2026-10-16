# Fase 7 — homologação final e decisão de lançamento

Data: 16 de outubro de 2026.

## Evidências aprovadas

- O servidor local responde em `http://127.0.0.1:8080` com HTTP 200.
- O cadastro de gestor, login sem confirmação de e-mail e criação automática
  de trial foram homologados na conta exclusiva de teste.
- O onboarding completo persistiu empresa, serviço, colaborador, horários e
  cliente. Um agendamento passou de pendente para concluído; a apuração exibiu
  1 atendimento concluído, R$ 35,00 de receita e R$ 14,00 de comissão (40%).
- A central de superadmin lista contas e já possui ações de suspensão,
  banimento, revogação de sessão e exclusão protegidas no servidor.
- Uma segunda empresa de homologação criou conta e trial próprios e não
  conseguiu ler o agendamento da primeira empresa; o isolamento retornou zero
  registros externos.
- O acesso da equipe reutiliza corretamente a vaga de um colaborador já
  cadastrado, sem exigir uma segunda vaga do plano. A função remota
  `manage-team-access` foi publicada na versão 5.
- A validação técnica passou: TypeScript, ESLint, 60 testes automatizados e
  build de produção.
- A suíte pgTAP do Supabase foi tentada no projeto remoto, mas não executou
  porque o Docker Desktop não está disponível neste ambiente. Os testes
  autenticados de conflito e isolamento foram executados diretamente contra o
  projeto remoto e tiveram resultado esperado.

## Itens que ainda impedem produção pública

1. Configurar `STRIPE_WEBHOOK_SECRET` e executar uma cobrança de teste com
   confirmação por webhook. Sem isso, pagamento e ativação de plano não estão
   homologados de ponta a ponta.
2. Configurar domínio oficial, URLs de redirecionamento e SMTP. O convite de
   colaborador cria o acesso por e-mail; sem SMTP não é possível comprovar a
   entrega nem a definição de senha.
3. Conciliar o histórico de migrations local/remoto antes de qualquer mudança
   estrutural adicional. Não executar `supabase db push` no estado atual.
4. Concluir a revisão de segurança registrada na Fase 6: exposição GraphQL
   por tabela, permissões das funções `SECURITY DEFINER`, proteção contra
   senha vazada, prazo de OTP e atualização do PostgreSQL.
5. Executar o teste final ainda não automatizado: convite/login de colaborador
   após SMTP estar ativo.
6. Executar a suíte pgTAP quando o Docker Desktop estiver disponível.

## Decisão

**Go para homologação privada; no-go para lançamento público pago.**

É seguro continuar testando cadastro, trial, onboarding, agenda, relatórios,
comissões e administração no ambiente atual. A abertura para clientes pagantes
deve esperar os cinco itens acima, principalmente o webhook assinado e SMTP.
