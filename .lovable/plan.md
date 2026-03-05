

# Ajustar Switch para especificações exatas

O switch atual já está limpo (sem ícones, sem efeitos), mas as dimensões não batem com as especificações pedidas. Ajustes necessários:

## Alterações em `src/components/ui/switch.tsx`

| Propriedade | Atual | Novo |
|---|---|---|
| Track largura | `w-[44px]` | `w-[48px]` |
| Track altura | `h-6` (24px) | `h-[26px]` |
| Thumb tamanho | `h-5 w-5` (20px) | `h-5 w-5` (20px) ✓ já correto |
| Thumb unchecked | `left-[2px]` | `left-[3px]` |
| Thumb checked | `left-[calc(100%-22px)]` | `left-[calc(100%-23px)]` |
| Track `rounded` | `rounded-full` | `rounded-[999px]` (equivalente, mas explicita o pedido) |

Também adicionar `relative` ao Root (necessário para `absolute` do thumb funcionar — pode já estar herdado do Radix, mas convém garantir).

Dimensões finais: track 48x26px, thumb 20x20px circular, 3px de padding interno.

