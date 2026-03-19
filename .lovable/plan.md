

# Plano: Sidebar — todos os itens em negrito (font-semibold)

## Problema
Atualmente os itens inativos usam `font-medium` e só o ativo usa `font-semibold`. O usuário quer que **todos** os itens fiquem em negrito permanentemente, como na referência.

## Alteração

### `src/components/Sidebar.tsx` (linha 139)
- Trocar `font-medium` por `font-semibold` na classe base do botão
- Remover o `font-semibold` condicional do estado ativo (já estará na base)
- Também aumentar a opacidade dos ícones inativos de `opacity-60` para `opacity-80` para combinar com o peso visual do texto em negrito

Resultado: todos os itens do menu sempre exibidos em `font-semibold` (negrito), igual à referência.

