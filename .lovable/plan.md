

# Redesign Completo — Sidebar + Top Bar + Fundo Unificado

## Objetivo
Unificar visualmente a sidebar, barra superior e área de conteúdo para que compartilhem a mesma cor de fundo escuro, criando o efeito imersivo da referência (estilo Canto dashboard). Atualmente o header usa `bg-card/80` (diferente da sidebar) e o conteúdo usa `bg-background`, criando separações visuais indesejadas.

## Mudanças

### 1. `src/components/Layout.tsx` — Header e fundo unificados
- Remover `bg-card/80 backdrop-blur-sm shadow-sm` do header
- Usar `bg-background` transparente no header para que se funda com o fundo
- Adicionar borda inferior sutil (`border-b border-border/30`) no lugar do shadow
- A barra de busca ganha estilo mais arredondado com fundo `bg-card` (levemente diferente do fundo)
- Data atual exibida ao lado dos ícones (como na referência: "17 Mar, 2026")
- Botão "Criar" (primary, rounded-full) à direita, levando para `/appointments`

### 2. `src/components/Sidebar.tsx` — Unificação visual
- Remover o gradient escuro separado (`dark:from-[#0F2F6B] dark:to-[#1A3A7A]`)
- Usar `bg-background` para que a sidebar tenha exatamente a mesma cor do fundo principal
- Manter a borda direita sutil `border-r border-border/30`
- Labels de categoria em uppercase, tracking-widest, cor muted (como "MAIN MENU" / "PREFERENCE" na referência)
- Item ativo: fundo `bg-primary text-primary-foreground rounded-lg` com barra lateral esquerda colorida
- Itens inativos: `text-muted-foreground hover:text-foreground`

### 3. `src/index.css` — Variáveis CSS
- Ajustar `--background` dark para coincidir com o tom da sidebar: `220 65% 10%`
- Ajustar `--card` dark para um tom levemente mais claro: `220 60% 14%` (cards se destacam do fundo)
- Manter as demais variáveis

### 4. Conteúdo principal (`main`)
- O `main` usa `bg-background` por padrão — com a unificação de cor, ele automaticamente compartilha o tom da sidebar
- Cards internos (`bg-card`) ficam levemente mais claros, criando o contraste necessário

## Resultado Visual
```text
┌──────────┬──────────────────────────────────────────┐
│          │  [Search...]    🔔 🌙  Mar 17  [Criar]  │
│  VIZZU   ├──────────────────────────────────────────│
│          │                                          │
│ OPERAÇÕES│   ┌────────┐ ┌────────┐ ┌────────┐      │
│ ▎Agenda  │   │ Card 1 │ │ Card 2 │ │ Card 3 │      │
│  Clientes│   └────────┘ └────────┘ └────────┘      │
│  ...     │                                          │
│          │   Tudo na mesma cor de fundo escuro       │
│ ADMIN    │   Cards em bg-card (levemente mais claro)│
│  Perfil  │                                          │
└──────────┴──────────────────────────────────────────┘
```

Sidebar, header e fundo compartilham `bg-background`. Cards se destacam com `bg-card`.

## Arquivos alterados
- `src/index.css` — variáveis dark mode (background e card)
- `src/components/Layout.tsx` — header redesenhado, data atual, botão Criar
- `src/components/Sidebar.tsx` — cores unificadas, item ativo com fundo primary

