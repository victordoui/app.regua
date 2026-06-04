## Objetivo
Corrigir o comportamento de clique/expansão da sidebar, remover as linhas divisórias claras entre categorias e replicar o estilo da imagem de referência para o item ativo (pílula branca com texto azul escuro).

## Mudanças em `src/components/Sidebar.tsx`

### 1. Remover linhas separadoras
- Remover `border-t border-sidebar-border/60` e `mt-1 pt-1` das categorias.
- Substituir por um espaçamento simples (`mt-0.5`) sem borda.
- Remover também o `border-b border-sidebar-border` do bloco da logo (manter só padding).

### 2. Corrigir cliques / expansão
- Hoje o `useEffect` que abre a categoria ativa depende de `menuStructure.length`, o que faz com que ao clicar para fechar manualmente, ele reabra quando a rota corresponde. Ajustar para:
  - Inicializar `openCategories` no `useState` com a categoria ativa (uma vez).
  - Remover o `useEffect` que reabre automaticamente, OU torná-lo apenas reativo à mudança de `location.pathname` (abrir nova categoria ativa sem fechar outras nem reabrir as fechadas manualmente).
- Garantir que o `CollapsibleTrigger asChild` envolve apenas um `<button>` (já está) e que o toggle não conflite com `navigate`.

### 3. Estilo "ativo" igual à imagem
Imagem de referência mostra:
- **Categoria aberta com filho ativo**: fundo azul levemente mais claro que o sidebar, texto branco, ícone branco, chevron branco.
- **Sub-item ativo**: fundo **branco** sólido, cantos arredondados (`rounded-md`), texto azul escuro (sidebar background color), ícone azul escuro, sem badge override.
- **Sub-item inativo**: texto branco com 70-80% opacidade, hover sutil com fundo `white/5`.

Atualizar classes:
```tsx
// Categoria (parent) com filho ativo
hasActive ? 'bg-sidebar-accent/40 text-white' : 'text-white/85 hover:bg-white/5'

// Sub-item ativo (pílula branca)
active
  ? 'bg-white text-sidebar shadow-sm font-semibold'
  : 'text-white/75 hover:bg-white/10 hover:text-white'
```
- Para garantir o texto azul no item ativo, usar `text-[hsl(var(--sidebar-background))]` ou criar um token `--sidebar-active-foreground`.
- Badge no item ativo: trocar para `bg-sidebar text-white` para contrastar com o fundo branco.

### 4. Item único (Conversas) e Super Admin
- Aplicar o mesmo estilo de pílula branca quando ativo.
- Manter Super Admin com tom âmbar (sem alteração).

## Fora de escopo
- Não alterar paleta global, tipografia, rotas ou comportamento de outras páginas.
- Sem alterações em `index.css` além de, se necessário, adicionar a variável `--sidebar-active-foreground` (opcional — pode-se usar a cor existente do sidebar via HSL).

## Resultado esperado
- Sidebar sem linhas divisórias claras.
- Categorias expandem/colapsam de forma estável ao clicar.
- Item ativo aparece como pílula branca com texto azul escuro, idêntico à referência.
