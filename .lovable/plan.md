## Objetivo

Hoje o Super Admin usa um shell próprio (`SuperAdminLayout` + `SuperAdminSidebar`) com aparência diferente: sidebar `bg-card`, largura fixa 64, sem colapso, sem topbar e sem menu de perfil. O acesso Admin usa `Layout` (Sidebar azul VIZZU + Topbar + colapso + dropdown de perfil). O plano é fazer o Super Admin usar exatamente o mesmo shell, apenas com o menu do Super Admin.

## O que muda

### 1. Sidebar unificada com menu por perfil
- Extrair a estrutura de menu do `Sidebar.tsx` para dados: manter o `fullMenuStructure` atual (Admin/Profissional) e adicionar um `superAdminMenuStructure` com os grupos hoje presentes em `SuperAdminSidebar`:
  - **Visão Geral**: Dashboard, Usuários do Sistema, Métricas Financeiras
  - **Gestão de Assinantes**: Assinantes, Assinaturas Expirando (badge), Histórico de Pagamentos
  - **Marketing & Comunicação**: Cupons, Mensagens em Massa, Templates de Email
  - **Configurações**: Planos e Preços
  - **Suporte**: Tickets (badge)
  - **Auditoria**: Logs
- Quando a rota atual começar com `/superadmin`, a sidebar mostra o menu Super Admin; caso contrário mostra o menu normal. Assim o super admin continua podendo operar a barbearia dele e alternar entre os dois contextos.
- Badges dinâmicos (`useTicketStats`, `useExpiringStats`) passam a alimentar os itens do menu, com o mesmo estilo de badge já usado na sidebar azul (pílula vermelha / invertida quando ativo).
- Manter todos os comportamentos atuais: colapso persistido, categorias expansíveis, item ativo em pílula branca, logo, botão de upgrade e dropdown de perfil.

### 2. Botão de troca de contexto
- No lugar do botão "Super Admin" amarelo atual: quando estiver no contexto normal, mostra "Painel da Plataforma" (leva a `/superadmin`); quando estiver em `/superadmin/*`, mostra "Voltar ao meu negócio" (leva a `/`). Estilo alinhado ao restante da sidebar (sem o amarelo destoante).

### 3. Layout do Super Admin
- `SuperAdminLayout` passa a renderizar o `Layout` padrão (Sidebar + Topbar + `main` com `--sidebar-w`), removendo a barra própria com `ThemeToggle` solto — o toggle de tema já existe na Topbar e no dropdown de perfil.
- `SuperAdminSidebar.tsx` é removido do uso (arquivo deletado após conferir que nenhuma outra tela o importa).
- Verificar cada página em `src/pages/superadmin/*` para que não fique com padding/duplicidade de cabeçalho após a troca de shell.

### 4. Paridade de qualidade nas telas do Super Admin
- Padronizar cabeçalho de página (título + subtítulo) nas 12 páginas do Super Admin usando o mesmo padrão visual das páginas Admin.
- Revisar estados de carregamento e vazio nas listagens (assinantes, pagamentos, tickets, logs) para não exibir tabela vazia sem mensagem.
- Garantir responsividade: no mobile o Super Admin passa a herdar o `MobileTopbar` do `Layout` em vez de ficar sem navegação.

### 5. Validação no navegador
- Login como Super Admin pelo botão de acesso rápido, navegar por todas as rotas `/superadmin/*`, conferir: sidebar azul idêntica, item ativo destacado, colapso funcionando, topbar presente, badges corretos, troca de contexto ida e volta, e ausência de erros no console.

## Detalhes técnicos

- Arquivos afetados: `src/components/Sidebar.tsx` (menus por contexto + badges), `src/components/superadmin/SuperAdminLayout.tsx` (passa a usar `Layout`), remoção de `src/components/superadmin/SuperAdminSidebar.tsx`, ajustes pontuais em `src/pages/superadmin/*`.
- Nenhuma mudança de banco, RLS ou regra de negócio; o `ProtectedRoute` e o `RoleContext` continuam iguais.
- Os hooks `useTicketStats` e `useExpiringStats` passam a ser chamados apenas quando o contexto Super Admin está ativo, para não gerar requisições desnecessárias em contas Admin.
