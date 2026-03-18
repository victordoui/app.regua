

# Plano: Sidebar estilo clean com badges circulares + Upgrade compacto

## Referência da imagem
A sidebar de referência tem:
- Labels de seção em azul claro (uppercase, sem linha divisória ao lado)
- Items com ícones em cinza suave, texto em cinza escuro, sem background no hover pesado
- Item ativo com fundo azul arredondado e texto branco
- Badges circulares coloridos (laranja/vermelho) à direita dos items
- Espaçamento generoso entre items, visual limpo e arejado
- Sem card de upgrade pesado — apenas um botão compacto

## Alterações em `src/components/Sidebar.tsx`

### 1. Labels de seção — estilo clean
- Remover a linha divisória (`h-px bg-border`) ao lado do label
- Mudar cor do label para `text-primary/60` (azul suave como na referência)
- Aumentar ligeiramente o tamanho para `text-[10px]`

### 2. Items do menu — mais arejados
- Aumentar padding vertical dos items para `py-2.5`
- Ícones com opacidade mais suave: `opacity-60` no estado normal (não 0.45)
- Remover `mb-px`, usar espaçamento natural
- Badge: trocar de `bg-primary` para badge circular colorido estilo referência (`bg-orange-400 text-white` ou `bg-red-400`), formato circular `w-5 h-5 rounded-full`

### 3. Upgrade card — compacto
- Remover o card com título e descrição
- Substituir por um botão simples e menor: uma linha só, com ícone Sparkles + "Upgrade", `text-xs`, altura `h-8`, estilo outline ou ghost com destaque primário
- Reduz drasticamente o espaço ocupado no footer

### 4. Logo — reduzir tamanho
- De `h-32 w-32` para `h-20 w-20` para dar mais espaço à navegação

## Resultado
Sidebar visualmente alinhada com a referência: clean, arejada, labels em azul suave, badges circulares, e upgrade compacto no footer.

