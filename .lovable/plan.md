

# Compactar espaçamento vertical da Sidebar

## Problema
Os itens do menu (ex: "Meu Negócio" e "Meu Perfil") têm espaçamento vertical excessivo entre si.

## Mudanças em `src/components/Sidebar.tsx`

1. **Category labels** (linha 158): Reduzir `pt-2 pb-1` → `pt-1 pb-0.5`
2. **Menu items** (linha 173): Reduzir `py-1.5` → `py-1`
3. **Nav container** (linha 154): Reduzir `py-2` → `py-1`
4. **Collapsed divider** (linha 164): Reduzir `my-2` → `my-1`
5. **Gap entre ícone e texto** (linha 172): Reduzir `gap-3` → `gap-2`

Resultado: itens muito mais colados, visual compacto tipo sidebar de SaaS profissional.

