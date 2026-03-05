

# Switch estilo Uiverse.io com cor verde

O switch atual já está no estilo Uiverse.io correto (com ícones checkmark/cross e bounce). A única mudança é trocar a cor do checked de azul (`bg-primary`) para verde.

## Alterações em `src/components/ui/switch.tsx`

| Elemento | Atual | Novo |
|---|---|---|
| Track checked | `bg-primary` (azul) | `bg-green-500` (verde) |
| Checkmark icon | `text-primary` (azul) | `text-green-500` (verde) |

Duas linhas alteradas, sem mudança estrutural.

