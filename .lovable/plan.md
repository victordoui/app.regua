

# Switch no formato pill/cápsula padrão iOS/Android

Simplificar o switch para o padrão moderno: track oval (pill shape) com thumb circular. Remover ícones e effect line extras.

## Alterações em `src/components/ui/switch.tsx`

**Track (Root):**
- Manter `h-6 w-[44px]` com `rounded-full` (já cria formato cápsula)
- Trocar timing function bounce por `ease-in-out` suave
- Manter cores: `bg-green-500` checked, `bg-[rgb(131,131,131)]` unchecked

**Thumb:**
- Mudar de oval `h-[16px] w-[24px]` para **circular `h-5 w-5`** (20x20px)
- Posições: `left-[2px]` unchecked, `left-[calc(100%-22px)]` checked
- Transição `ease-in-out` em vez de bounce
- Remover sombras complexas, usar shadow simples

**Remover:**
- Effect line (span decorativo)
- SVG checkmark e cross icons dentro do thumb

Resultado: switch limpo, pill shape horizontal com thumb circular deslizante.

