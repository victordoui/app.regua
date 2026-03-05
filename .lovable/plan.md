

# Switch estilo Uiverse.io com cor azul

Redesign do Switch com o estilo animado do Uiverse.io, incluindo ícones de checkmark/cross e efeito bounce, usando azul (`primary`) no lugar do verde.

## Alterações em `src/components/ui/switch.tsx`

- **Track**: `w-[46px] h-6`, fundo cinza quando off, `bg-primary` quando on
- **Thumb**: `h-[18px] w-[18px]` branco com sombra sutil, transição bounce `cubic-bezier(0.27, 0.2, 0.25, 1.51)`
- **Ícones SVG dentro do thumb**: checkmark (azul, scale 0→1 on check) e cross (cinza, scale 1→0 on check)
- **Effect line**: barra branca decorativa que desliza junto com o thumb
- Manter compatibilidade com Radix `SwitchPrimitives` e a API existente

