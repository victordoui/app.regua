## Objetivo

Três frentes: (1) botão "Voltar ao meu negócio" sempre cair num contexto válido, (2) auditar as consultas/permissões usadas pelo Super Admin, (3) garantir sidebar/topbar idênticas ao Admin em todas as telas do Super Admin.

## O que foi verificado agora

- O botão em `src/components/Sidebar.tsx` navega fixo para `/` (e para `/superadmin` no sentido inverso). Não há redirect automático de super_admin em `App.tsx` nem gate de onboarding, então não há loop de rota — mas o destino pode ser um painel vazio.
- No banco: o único usuário com papel `super_admin` (`1bb82282-…`) **não tem** registro em `profiles`, nem em `barbershop_settings`, nem assinatura. Ou seja, ao clicar em "Voltar ao meu negócio" ele cai no dashboard de um negócio que não existe — dados vazios, saudação sem nome, hooks de assinatura retornando `null`.
- Políticas RLS: `profiles` só tem `profiles_owner_manage` (dono) e leitura pública de profissionais ativos. **Não existe política de leitura para super_admin**, então a tela "Usuários do Sistema" (`usePlatformUsers`) enxerga praticamente nenhum perfil e as estatísticas (total de usuários, órfãos) ficam incorretas.
- `platform_subscriptions`, `platform_support_tickets` e demais tabelas de plataforma já têm política de super admin.
- Filtro inválido `role='barber'` já foi corrigido para `'barbeiro'`; não há outras ocorrências no código.

## Plano

### 1. Troca de contexto confiável
- Em `Sidebar.tsx`, trocar o destino fixo por uma decisão baseada no contexto real do usuário:
  - se o super admin possui negócio próprio (existe `barbershop_settings` para o `user.id`) → volta para `/`;
  - se não possui → em vez de mandar para um painel vazio, exibir o rótulo "Sair do painel da plataforma" e levar para `/profile`, ou mostrar no dashboard um aviso "Você não tem um negócio vinculado a esta conta" com atalho de volta para `/superadmin`.
- Usar `navigate(..., { replace: false })` mantendo a sessão intacta (sem reload) e preservar o estado de colapso da sidebar na troca.
- Adicionar um pequeno hook (`useHasOwnBusiness`) com React Query e cache, para não consultar a cada render.

### 2. Auditoria de consultas e permissões
- Migration para permitir que super admins leiam perfis e papéis de toda a plataforma:
  - política de SELECT em `public.profiles` usando `public.is_super_admin(auth.uid())`;
  - conferir/garantir os GRANTs de Data API nas tabelas `platform_*` usadas pelas telas.
- Revisar cada hook de `src/hooks/superadmin/` e páginas `src/pages/superadmin/` procurando: filtros por colunas inexistentes, `.single()` onde pode não haver linha (trocar por `.maybeSingle()`), e `select('*')` desnecessário em tabelas grandes (restringir colunas).
- Rodar checagem automatizada no navegador percorrendo as 13 rotas do Super Admin, coletando erros de console e respostas HTTP 4xx/5xx, e corrigir o que aparecer.

### 3. Consistência visual sidebar/topbar
- Confirmar que `SuperAdminLayout` apenas encapsula o `Layout` padrão (já é o caso) e que **todas** as páginas do Super Admin usam esse layout — verificar página por página, incluindo `TicketDetail`.
- Ajustar o cálculo de item ativo para as rotas aninhadas (ex.: `/superadmin/support/:id` deve manter "Tickets de Suporte" destacado e a categoria aberta), já que hoje `/superadmin` é excluído da regra de prefixo.
- Garantir que o mesmo estilo "pill" branco do Admin se aplica aos itens do menu Plataforma, inclusive no modo recolhido, e que a Topbar (busca, data, tema, notificações) aparece igual.
- Registro visual comparando Admin × Super Admin nas telas principais para confirmar cores e destaque.

## Detalhes técnicos

- Arquivos afetados: `src/components/Sidebar.tsx`, `src/components/superadmin/SuperAdminLayout.tsx`, páginas em `src/pages/superadmin/`, hooks em `src/hooks/superadmin/`, novo hook de contexto de negócio.
- Uma migration: política de SELECT em `profiles` para super admin + revisão de GRANTs.
- Verificação final: navegação automatizada por todas as rotas do Super Admin com captura de console e rede.
