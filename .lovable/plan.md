## Objetivo

Reestilizar a sidebar do VIZZU para se parecer com a referência (UNIG Facilities): fundo azul-marinho escuro, texto branco, categorias com sub-itens expansíveis (collapsible), separações visíveis entre seções, e avatar/perfil no rodapé clicável que abre um menu de perfil.

## Mudanças

### 1. `src/components/Sidebar.tsx` — redesign visual + interatividade

**Cor e estrutura**
- Fundo: azul-marinho escuro (`#0F1B3D` / token `--sidebar-bg` em HSL) com texto branco/cinza claro.
- Largura mantida em 234px.
- Logo VIZZU centralizado no topo, sobre fundo escuro (usar versão branca ou aplicar filtro/brilho).
- Cada **categoria** vira um item raiz com ícone + label + chevron, usando `Collapsible` (shadcn) — clica e expande mostrando os sub-itens indentados.
- Separadores sutis (`border-b border-white/5`) entre grupos de categorias.
- Item ativo: fundo branco translúcido (`bg-white/10`) com borda esquerda em accent ou texto destacado em branco puro; hover: `bg-white/5`.
- Badges (ex: Agenda "8") em laranja, mantendo padrão.

**Rodapé com menu de perfil**
- Avatar + nome + role vira um **botão clicável** que abre um `DropdownMenu` (shadcn) acima/lateral com itens:
  - Meu Perfil (→ `/profile`)
  - Configurações da Empresa (→ `/settings/company`)
  - Alternar tema (claro/escuro)
  - Sair (signOut)
- O botão "Fazer Upgrade" permanece logo acima do bloco do usuário.

### 2. Tokens de cor (`src/index.css` + `tailwind.config.ts`)

- Adicionar tokens semânticos da sidebar (em HSL) para suportar dark/light mode:
  - `--sidebar-background: 222 47% 14%` (navy)
  - `--sidebar-foreground: 0 0% 100%`
  - `--sidebar-muted: 215 20% 70%`
  - `--sidebar-active: 0 0% 100% / 0.10`
  - `--sidebar-border: 0 0% 100% / 0.06`
- Mapear no `tailwind.config.ts` em `colors.sidebar.{background,foreground,muted,active,border}` para uso via classes.

### 3. Sem alterações de lógica
- Rotas, permissões (`useRole`), `signOut`, `isActivePath` e estrutura do menu permanecem idênticas.
- Apenas apresentação + adição de Collapsible nas categorias e DropdownMenu no rodapé.

## Fora do escopo
- Mobile bottom nav, topbar, super admin sidebar, ou qualquer outra página.
- Mudanças de rotas, dados ou regras de negócio.
