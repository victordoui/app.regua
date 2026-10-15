# Fase 3 — nomenclatura e equipe

Concluída em 15 de outubro de 2026.

## Vocabulário adotado

- `super_admin`: Administrador da Plataforma.
- `admin`: Gestor do Negócio.
- `barbeiro`: Colaborador nas áreas internas de equipe e acesso.
- Equipe de atendimento: cadastro operacional de quem presta serviços.
- Profissional: mantido na agenda e no agendamento público, onde é o termo natural para o cliente.

Os identificadores técnicos não foram alterados para evitar quebra de banco, RLS,
funções e integrações durante o lançamento.

## Entregas

- Navegação, perfil, gestão de acessos, equipe, onboarding, limites de plano e superadmin atualizados.
- Gestão de usuários renomeada para “Equipe e acessos”.
- Cadastro operacional renomeado para “Equipe de atendimento”.
- Limite de colaboradores reforçado dentro da Edge Function `manage-team-access`.
- Convites e reativações acima do limite retornam `PLAN_LIMIT_REACHED` mesmo fora da interface.
- Mensagem de upgrade adicionada para o gestor quando o limite é atingido.

## Ressalva

O envio do convite depende do SMTP previsto para a Fase 6. O código de convite,
ativação e desativação está pronto, mas o recebimento real do e-mail será homologado após essa configuração.
