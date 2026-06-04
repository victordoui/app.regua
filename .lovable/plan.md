# Plano: Refino visual da Sidebar

Foco exclusivo no componente `src/components/Sidebar.tsx` e nas variáveis de cor `--sidebar-*` em `src/index.css`. Nada de mudanças em rotas, lógica ou outras páginas.

## 1. Cor da sidebar (azul mais claro)
Em `src/index.css`, ajustar os tokens da sidebar para um azul mais claro e moderno:

- `--sidebar-background`: de `224 72% 22%` (azul muito escuro) → `221 70% 38%` (azul médio, parecido com o `#2D4DBA` / tom intermediário entre primary e o atual).
- `--sidebar-border`: de `224 60% 30%` → `221 55% 48%` (acompanha o novo fundo).
- `--sidebar-accent`: manter `217 91% 45%` (continua funcionando como hover/realce).

Resultado: sidebar com presença mais leve, ainda azul VIZZU, sem virar pastel.

## 2. Logo maior e mais para cima
No bloco `Brand` da sidebar:

- Reduzir padding superior/inferior: `pt-6 pb-5` → `pt-3 pb-2` (sobe a logo).
- Aumentar a logo: `h-28 w-28` → `h-36 w-36` (≈ 144px), mantendo `object-contain`.
- Continuar sem borda inferior, sem contorno.

## 3. Botão de colapsar a sidebar (novo)
Adicionar um botão dedicado que permite recolher a sidebar para uma faixa estreita só com ícones (estilo "mini"), e expandir de volta.

- Estado controlado por `useState<boolean>` (`collapsed`), persistido em `localStorage` (`vizzu:sidebar-collapsed`).
- Largura da `<aside>`:
  - Expandida: `w-[248px]` (um pouco maior que os 234px atuais para acomodar fontes maiores).
  - Colapsada: `w-[68px]` (somente ícones centralizados).
- Botão de toggle: pequeno botão circular fixo na borda direita da sidebar (top ~72px), com ícone `PanelLeftClose` / `PanelLeftOpen` (lucide). Sempre visível, inclusive quando colapsada.
- Quando `collapsed = true`:
  - Esconder labels, chevrons e badges textuais; manter apenas os ícones, centralizados.
  - Categorias com múltiplos itens viram um botão simples que, ao clicar, navega para o primeiro item da categoria (sem abrir submenu) — ou, opcionalmente, abre um popover lateral. Para manter simples nesta iteração: navega para o primeiro item.
  - O footer mostra só o avatar (sem nome/cargo) e o botão "Upgrade" vira só o ícone `Sparkles`.
- Conteúdo principal: o layout que envolve a sidebar (App shell) usa `margin-left` baseado na largura. Verificar onde está aplicado o offset (`ml-[234px]` provavelmente em `App.tsx` ou um layout wrapper) e trocar por uma variável CSS `--sidebar-w` setada pela própria sidebar via `document.documentElement.style.setProperty`, para manter o offset sincronizado sem prop-drilling.

## 4. Tipografia da sidebar (maior e mais legível)
Aumentar levemente todos os tamanhos dentro da sidebar:

- Categoria (parent) e item único: `text-sm` (14px) → `text-[15px]`, `font-semibold` mantido.
- Subitem: `text-[13px]` → `text-[14px]`.
- Ícones de categoria: `h-[18px] w-[18px]` → `h-5 w-5`.
- Ícones de subitem: `h-4 w-4` → `h-[18px] w-[18px]`.
- Padding vertical dos botões: `py-2.5` → `py-3` (mais respiração).
- Footer: nome do usuário `text-sm` → `text-[15px]`; cargo `text-[11px]` → `text-xs`.
- Botão "Fazer Upgrade": `text-[13px]` → `text-sm`, altura `h-9` → `h-10`.

## 5. Detalhes finais
- Garantir que, ao colapsar, o item "Super Admin" mostre só o `Shield` centralizado.
- Tooltip nativo (atributo `title`) em cada botão quando `collapsed`, para acessibilidade.
- Nenhum separador/linha clara adicional — mantém o visual limpo já definido.

## Arquivos afetados
- `src/index.css` — 3 tokens `--sidebar-*`.
- `src/components/Sidebar.tsx` — logo, fontes, novo estado `collapsed`, botão de toggle, variantes condicionais.
- Wrapper de layout (provavelmente `src/App.tsx` ou similar) — ajustar offset para usar `--sidebar-w` em vez de largura fixa.

## Fora de escopo
- Outras páginas, tipografia global do app, mobile bottom-nav, paletas semânticas, comportamento de rotas.
