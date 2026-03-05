

# Switch mais alto para corresponder à imagem de referência

A imagem mostra um switch com proporções mais altas verticalmente — aproximadamente **32px de altura** com thumb de **24px**, comparado ao atual de 24px/18px.

## Alterações em `src/components/ui/switch.tsx`

| Elemento | Atual | Novo |
|---|---|---|
| Track altura | `h-6` (24px) | `h-8` (32px) |
| Track largura | `w-[46px]` | `w-[56px]` |
| Thumb | `h-[18px] w-[18px]` | `h-[24px] w-[24px]` |
| Thumb unchecked left | `left-[3px]` | `left-[4px]` |
| Thumb checked left | `left-[calc(100%-21px)]` | `left-[calc(100%-28px)]` |
| Effect line left unchecked | `left-[7.5px]` | `left-[10px]` |
| Effect line left checked | `left-[calc(100%-16.5px)]` | `left-[calc(100%-20px)]` |
| Effect line size | `w-[9px] h-[3px]` | `w-[12px] h-[4px]` |
| Checkmark icon | `w-[10px]` | `w-[14px]` |
| Cross icon | `w-[6px]` | `w-[8px]` |

Proporções escaladas uniformemente mantendo o estilo Uiverse.io com bounce e ícones.

