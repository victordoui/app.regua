

# Ajuste do Switch para corresponder à referência Bootstrap

Analisando a imagem, o switch Bootstrap tem:

- **Unchecked**: track com borda cinza, fundo transparente, thumb circular cinza pequeno à esquerda
- **Checked**: track preenchido azul, thumb circular branco à direita
- **Proporções**: track mais largo que alto, thumb bem centralizado verticalmente

O código atual já segue esse estilo, mas `h-4.5` e `w-4.5` não são classes válidas do Tailwind (não existem por padrão). Preciso corrigir para valores válidos e ajustar as proporções para ficarem idênticas à referência.

## Alterações em `src/components/ui/switch.tsx`

- **Track**: manter `h-6 w-11` com borda e transparência no unchecked
- **Thumb**: trocar `h-4.5 w-4.5` por `h-[18px] w-[18px]` (valor arbitrário válido no Tailwind)
- Manter translate e cores como estão

