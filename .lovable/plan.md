

# Categorias colapsáveis na Sidebar

## Mudanças em `src/components/Sidebar.tsx`

### 1. Adicionar estado para controlar categorias abertas/fechadas

- Novo state: `openCategories` — um `Set<string>` inicializado com todas as categorias abertas por padrão
- Função `toggleCategory(category)` para abrir/fechar
- Categorias que contêm a rota ativa ficam sempre abertas automaticamente

### 2. Tornar os labels de categoria clicáveis

- O label da categoria (ex: "Configurações", "Operações") vira um botão com um ícone `ChevronDown` que rotaciona quando fechado
- Ao clicar, alterna a visibilidade dos itens daquela categoria
- Animação suave de abertura/fechamento usando `AnimatePresence` + `motion.div` (já importado)

### 3. Condicionar renderização dos itens

- Os itens de cada categoria só renderizam se `openCategories.has(category.category)`
- No modo colapsado (`isCollapsed`), todas as categorias mostram apenas ícones (sem collapsible)

### Comportamento

- Todas as categorias iniciam abertas
- A categoria da rota ativa nunca fecha automaticamente
- Clicar no label alterna abrir/fechar
- ChevronDown rotaciona 180° quando fechado

### Arquivo editado
- `src/components/Sidebar.tsx`

