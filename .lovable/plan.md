

# Redesenhar Header conforme referência

A imagem mostra um header limpo com: logo à esquerda, campo de busca centralizado, e à direita um ícone de tema (meio-lua) + avatar do usuário com seta dropdown.

## Alterações

### 1. `src/components/Layout.tsx` - Reestruturar header

Layout atual: `justify-end` com TrialBanner, ThemeToggle, Bell, Avatar, Menu empilhados à direita.

Novo layout (3 colunas):
- **Esquerda**: Logo "Na Régua" (visível no header, complementa a sidebar)
- **Centro**: Campo de busca com ícone de lupa, borda arredondada, placeholder "Buscar"
- **Direita**: ThemeToggle (ícone atualizado) + Avatar com chevron dropdown

Remover: Bell button separado (mover para dentro do dropdown ou manter no sidebar), TrialBanner do header (mover para outro local ou manter discreto).

Header classes: `justify-between` com 3 grupos flex.

### 2. `src/components/ui/theme-toggle.tsx` - Toggle com ícone único

Trocar dropdown por botão simples que alterna entre claro/escuro com um clique. Ícone: meio-lua (Moon) no tema claro, sol (Sun) no tema escuro. Estilo clean, sem dropdown, apenas toggle direto.

Usar `resolvedTheme` do `useTheme()` para saber o tema atual e alternar.

### 3. Estilo do Avatar no header

Avatar com borda sutil + ChevronDown ao lado, como na referência. O dropdown existente já funciona, só ajustar o trigger visual.

### 4. Campo de busca

Input com ícone `Search` à esquerda, `bg-muted/50`, `rounded-full` ou `rounded-lg`, largura `max-w-md`, centralizado. Funcionalidade de busca pode ser placeholder por agora.

