# Fase 2 — Administração da Plataforma

Concluída em 15 de outubro de 2026.

## Entregas

- Central de usuários com busca e filtros por papel, assinatura e banimento.
- Exibição de empresa, perfil, plano, pagamento, dias restantes do trial e data de cadastro.
- Ações de suspender/reativar assinatura, banir/desbanir, encerrar sessões e excluir acesso.
- Operações privilegiadas concentradas na Edge Function `manage-platform-user`.
- Validação de JWT e de papel `super_admin` novamente no servidor.
- Proteção contra autoalteração e contra alteração de outro superadmin.
- Exclusão exige digitação do e-mail; remove a identidade de autenticação e preserva os dados históricos.
- Revogação de sessões executada por função SQL disponível apenas para `service_role`.
- Todas as ações geram registro em `platform_audit_logs`.

## Evidências

- Edge Function publicada como ativa, versão 2, com `verify_jwt=true`.
- Requisição sem autenticação recusada com HTTP 401.
- RPC `revoke_platform_user_sessions` permite execução somente a `postgres` e `service_role`.
- A central foi aberta no navegador com papel temporário de superadmin e exibiu 8 contas reais.
- O menu mostrou suspensão, banimento, remoção de banimento, encerramento de sessões e exclusão.
- A elevação temporária da conta de QA foi removida; ela terminou somente como `admin`.
- Nenhuma ação destrutiva foi executada contra contas existentes durante a inspeção.
- 60 testes, TypeScript, lint e build aprovados antes do fechamento.

## Limites conhecidos

- O primeiro superadmin definitivo ainda precisa ser associado à conta indicada pelo proprietário.
- A exclusão preserva dados históricos por desenho; limpeza definitiva exige política de retenção e LGPD.
- A homologação destrutiva completa deve usar uma segunda conta descartável criada especificamente para QA.
