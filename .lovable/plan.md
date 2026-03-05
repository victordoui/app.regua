

# Ajustar largura do Switch para 50px

O componente já está quase correto, mas a largura `48px` pode estar visualmente parecendo circular por ser muito próxima da altura. O usuário pede `50px` de largura.

## Alteração em `src/components/ui/switch.tsx`

| Propriedade | Atual | Novo |
|---|---|---|
| Track largura | `w-[48px]` | `w-[50px]` |

Apenas uma linha muda: `w-[48px]` → `w-[50px]`. Thumb checked position ajustada de `left-[calc(100%-23px)]` → `left-[calc(100%-23px)]` (mantém, pois 50-20-3=27, mas `calc(100%-23px)` = 27px, correto).

Tudo mais já está conforme especificado: `rounded-[999px]` no track, `rounded-full` no thumb (= `border-radius: 50%`), `h-[26px]`, thumb `h-5 w-5` (20px).

