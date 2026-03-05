

# Switch com thumb oval (não redondo)

A segunda imagem mostra um switch com thumb mais largo/oval em vez de perfeitamente circular. O thumb atual é `18x18px` (círculo). Vou mudar para um formato mais oval/pill.

## Alterações em `src/components/ui/switch.tsx`

| Elemento | Atual | Novo |
|---|---|---|
| Thumb dimensões | `h-[18px] w-[18px] rounded-full` | `h-[16px] w-[24px] rounded-full` |
| Thumb unchecked left | `left-[3px]` | `left-[3px]` |
| Thumb checked left | `left-[calc(100%-21px)]` | `left-[calc(100%-27px)]` |

O thumb fica mais largo horizontalmente (24px) e ligeiramente mais baixo (16px), criando o formato oval/pill da imagem de referência. Posição checked ajustada para compensar a largura maior.

