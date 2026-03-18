

# Redesign Completo — Dark Mode SaaS Profissional

## Objetivo
Transformar todo o sistema (exceto Login) em um dashboard dark mode profissional inspirado na imagem de referência, usando a paleta azul VIZZU como cor primária.

## Mudanças Principais

### 1. CSS Variables — Dark Mode como padrão (`src/index.css`)

Reescrever as variáveis `:root` para que o modo padrão seja dark, baseado nas specs fornecidas:

| Variável | Valor (HSL) | Hex Aprox. |
|---|---|---|
| `--background` | `0 0% 10%` | `#1A1A1A` |
| `--card` | `0 0% 16%` | `#282828` |
| `--foreground` | `0 0% 100%` | `#FFFFFF` |
| `--muted-foreground` | `0 0% 69%` | `#B0B0B0` |
| `--border` | `0 0% 25%` | `#404040` |
| `--input` | `0 0% 16%` | `#282828` |
| `--primary` | gradient `#4FA3FF → #1F4FA3` (base: `213 100% 65%`) |
| `--muted` | `0 0% 13%` | `#212121` |

O `.dark` class mantém os mesmos valores (já é dark por padrão). O light mode (`:root` sem `.dark`) recebe os valores atuais do light mode como fallback, mas o tema padrão será forçado como `dark`.

Sombras atualizadas para dark mode: `rgba(0,0,0,0.3)` base.

### 2. Forçar Dark Mode como padrão (`src/App.tsx`)

Alterar `ThemeProvider` para `defaultTheme="dark"` e `forcedTheme="dark"` (ou remover toggle). Manter `ThemeToggle` funcional caso o usuário queira light mode futuro, mas o padrão será dark.

### 3. Sidebar (`src/components/Sidebar.tsx`)

- Background: `bg-[#1A1A1A]` (igual ao fundo principal, sem borda separadora forte)
- Item ativo: fundo `bg-[#282828]` com texto/ícone `text-primary` (#4FA3FF)
- Itens inativos: `text-[#B0B0B0]`
- Category labels: `text-[#808080]` uppercase
- Borda direita sutil: `border-[#282828]`
- User footer com avatar circular

### 4. Header/Layout (`src/components/Layout.tsx`)

- Background: `bg-[#1A1A1A]`
- Search input: `bg-[#282828] border-[#404040]` text white, placeholder `#B0B0B0`
- Ícones: `text-[#B0B0B0]` hover `text-white`
- Botão "Create" estilo: gradient primary azul, rounded-full

### 5. Cards (`src/components/ui/card.tsx`)

- Background: `bg-[#282828]`
- Border: `border-[#333333]/50`
- Shadow: `0px 4px 10px rgba(0,0,0,0.3)`
- Hover: sombra levemente mais forte
- `border-radius: 12px`

### 6. StatusCards (`src/components/ui/status-cards.tsx`)

- Background `#282828`, border-left colorido mantido
- Texto de valor em branco ou cor de destaque
- Label em `#B0B0B0`
- Shadow dark mode

### 7. Tabs (`src/components/ui/tabs.tsx`)

- TabsList: `bg-[#1A1A1A]` ou `bg-[#212121]`
- Tab ativa: `bg-[#282828]` text white, shadow sutil
- Tab inativa: `text-[#B0B0B0]`

### 8. Buttons (`src/components/ui/button.tsx`)

- Default/primary: `bg-gradient-to-r from-[#4FA3FF] to-[#1F4FA3]` text white
- Secondary: `bg-[#282828] text-[#4FA3FF]`
- Outline: `border-[#404040] text-white hover:bg-[#282828]`
- Ghost: `text-[#B0B0B0] hover:bg-[#282828] hover:text-white`
- border-radius `8px`

### 9. Input (`src/components/ui/input.tsx`)

- `bg-[#282828] border-[#404040] text-white placeholder:text-[#808080]`

### 10. PageHeader (`src/components/ui/page-header.tsx`)

- Title: `text-white`
- Subtitle: `text-[#B0B0B0]`
- Icon container: `bg-[#282828] text-primary`

### 11. SearchFilters (`src/components/ui/search-filters.tsx`)

- Input dark themed
- Filter chips: `bg-[#282828] text-[#B0B0B0] border-[#404040]`

### 12. Tabelas (se houver `table.tsx`)

- Header: `bg-[#1A1A1A] text-white`
- Rows alternadas: `#282828` / `#2E2E2E`
- Text: `text-[#B0B0B0]`

### 13. Popover, Dialog, DropdownMenu, Select, Sheet

Estes componentes shadcn herdam de `--popover` e `--card`, então a mudança nas CSS variables cuida da maior parte. Verificar que não há classes hardcoded de light mode.

## Arquivos a editar (~12 arquivos)

1. `src/index.css` — variáveis dark mode como padrão
2. `src/App.tsx` — `defaultTheme="dark"`
3. `src/components/Sidebar.tsx` — cores dark
4. `src/components/Layout.tsx` — header dark
5. `src/components/ui/card.tsx` — dark card style
6. `src/components/ui/button.tsx` — gradient primary
7. `src/components/ui/input.tsx` — dark input
8. `src/components/ui/tabs.tsx` — dark tabs
9. `src/components/ui/page-header.tsx` — dark header
10. `src/components/ui/status-cards.tsx` — dark cards
11. `src/components/ui/search-filters.tsx` — dark filters
12. `src/components/ui/table.tsx` — dark table rows

## O que NÃO muda
- `src/pages/Login.tsx` — mantém design atual
- Lógica de dados, hooks, rotas — zero alterações
- Estrutura de páginas (PageHeader + Tabs + StatusCards + SearchFilters) — mantida

## Resultado
Interface dark mode profissional, coesa, com paleta azul VIZZU, inspirada na referência Canto Dashboard.

