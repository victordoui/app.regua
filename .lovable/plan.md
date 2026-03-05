

# Diminuir switch verticalmente

Reduzir as proporções do switch para ficar mais estreito e compacto.

## Alterações em `src/components/ui/switch.tsx`

| Elemento | Atual | Novo |
|---|---|---|
| Track | `h-8 w-[56px]` | `h-6 w-[44px]` |
| Thumb | `h-[24px] w-[24px]` | `h-[18px] w-[18px]` |
| Thumb unchecked left | `left-[4px]` | `left-[3px]` |
| Thumb checked left | `left-[calc(100%-28px)]` | `left-[calc(100%-21px)]` |
| Effect line | `w-[12px] h-[4px]` | `w-[9px] h-[3px]` |
| Effect unchecked left | `left-[10px]` | `left-[7px]` |
| Effect checked left | `left-[calc(100%-20px)]` | `left-[calc(100%-15px)]` |
| Checkmark icon | `w-[14px]` | `w-[10px]` |
| Cross icon | `w-[8px]` | `w-[6px]` |

Mantém estilo Uiverse.io com ícones e bounce, apenas escala menor.

