

# Redesign da Sidebar e Barra Superior no estilo da imagem de referência

A imagem mostra um layout limpo com: sidebar branca com ícones simples e texto, sem categorias colapsáveis; barra superior com campo de busca centralizado, ícone de notificação e avatar do usuário com dropdown.

## Alterações

### 1. `src/components/Sidebar.tsx` - Sidebar simplificada

Redesign completo para o estilo flat da imagem:
- **Logo** no topo: "Na Régua" com ícone, sem badge de role
- **Menu flat** (sem categorias/accordions): lista simples de itens com ícone + texto
- Itens visíveis para admin: Dashboard, Agenda, Clientes, Barbeiros, Serviços, Relatórios, Configurações
- Item ativo: fundo azul claro com texto azul (como "Agenda" na imagem)
- Itens inativos: texto cinza, hover sutil
- **Log out** fixo no rodapé da sidebar
- Manter lógica de filtro por role (BARBER_PATHS) e collapse/mobile
- Remover animações framer-motion pesadas, manter transições CSS simples
- Sidebar fixa, branca, sem backdrop-blur

### 2. `src/components/Layout.tsx` - Barra superior redesenhada

- **Campo de busca** centralizado (ou à esquerda) com ícone de lupa e placeholder "Buscar"
- **Direita**: ícone de refresh/sync, avatar do usuário com dropdown (manter lógica existente)
- Remover TrialBanner e ThemeToggle da header (mover ThemeToggle para settings ou dropdown)
- Remover botão de notificações separado (integrar no dropdown ou manter discreto)
- Header branca/clean, sem bordas pesadas

### 3. Estilo visual

| Elemento | Atual | Novo |
|---|---|---|
| Sidebar fundo | `bg-card/95 backdrop-blur` | `bg-card` sólido |
| Menu | Categorias colapsáveis | Lista flat simples |
| Item ativo | `bg-secondary` | `bg-primary/10 text-primary font-medium` |
| Header | `justify-end` | Campo busca à esquerda, ações à direita |
| Header altura | `h-14` | `h-14` (mantém) |

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/components/Sidebar.tsx` | Menu flat, visual limpo, sem categorias |
| `src/components/Layout.tsx` | Campo de busca no header, layout simplificado |

A funcionalidade de permissões por role, navegação mobile, e collapse será preservada. Apenas o visual e a organização dos menus mudam.

