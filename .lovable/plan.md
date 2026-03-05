
# Plano: Switch estilo iOS

## O que muda

Redesenhar `src/components/ui/switch.tsx` para o estilo Apple/iOS:

- **Track maior**: `h-[31px] w-[51px]` (proporcoes iOS reais)
- **Ativo**: fundo verde (`#34C759`), thumb branco desliza para direita
- **Inativo**: fundo cinza claro (`#E9E9EA`), thumb branco na esquerda
- **Thumb**: circulo branco com `shadow-sm` sutil, cresce levemente ao pressionar (`:active` scale)
- **Transicao**: `duration-200` com `ease-in-out` suave
- **Border**: sem borda visivel, apenas sombra interna sutil no track inativo

## Arquivo modificado

| Arquivo | Alteracao |
|---|---|
| `src/components/ui/switch.tsx` | Redesign completo estilo iOS |
