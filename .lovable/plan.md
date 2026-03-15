

# Redesign Visual do Sistema VIZZU

## Problemas Identificados

1. **Sidebar**: Logo/ícone de 192x192px (`w-48 h-48`) ocupa espaço excessivo, empurrando tudo para baixo. Categorias com botões h-10 + sub-items com `ml-4 pl-8` criam indentação estranha. Estilo visual genérico sem identidade de marca.
2. **Tabs das páginas**: `TabsList` padrão com `bg-muted` e `h-10` fica "afundado" e sem destaque. `TabsContent` com `mt-2` cria espaçamento inconsistente.
3. **Corpo das páginas**: Layout `p-6` dentro de `p-4 lg:p-6` do `<main>` = padding duplo. Cards sem hierarquia visual clara. Header sem presença visual.

## Alterações (sem tocar na tela de Login nem fontes)

### 1. `src/components/Sidebar.tsx` — Redesign completo
- Logo reduzida: `w-12 h-12` expandido, `w-8 h-8` colapsado, com nome "VIZZU" ao lado
- Categorias: labels pequenos em uppercase como section dividers (não botões clicáveis)
- Sub-items diretamente visíveis (sem collapse), com indicador vertical ativo (barra lateral esquerda azul)
- Background: gradient sutil vertical `#0F2F6B → #1A3A7A` no dark mode, branco limpo no light
- Footer compacto com avatar + role + collapse toggle
- Menos padding, itens h-9, tipografia mais refinada

### 2. `src/components/Layout.tsx` — Header refinado
- Header com `h-16` e shadow sutil ao invés de border
- Barra de busca mais elegante com ícone refinado
- Remover padding duplo: `<main>` fica `p-0`, cada página controla seu padding

### 3. `src/components/ui/tabs.tsx` — Tabs modernizados
- `TabsList`: `bg-transparent` com border-bottom, sem background cinza
- `TabsTrigger`: estilo underline — `border-b-2 border-transparent` no inactive, `border-primary text-primary` no active
- Remover `rounded-md` e `shadow-sm` do trigger ativo
- `TabsContent`: `mt-4` ao invés de `mt-2`

### 4. `src/components/ui/card.tsx` — Cards mais limpos
- Remover `shadow-modern` e `hover:shadow-elegant` padrão (muito pesado para uso geral)
- Usar `shadow-sm` padrão e `hover:shadow-md` sutil
- Manter `rounded-xl` e `border-border/50`

### 5. `src/pages/Index.tsx` — Dashboard page cleanup
- Remover `p-6` redundante (Layout já provê padding)
- Ajustar espaçamento do header da página

### 6. `src/components/dashboard/DashboardOverview.tsx` — Stats cards refinados
- Cards com layout mais compacto e limpo

### 7. Demais páginas (`Reports.tsx`, `Commissions.tsx`, `Clients.tsx`, etc.)
- Remover `p-6` redundante do wrapper `<div className="flex-1 space-y-6 p-6">`
- Padronizar para `space-y-6` sem padding extra

### Visão do Resultado

```text
┌─────────┬────────────────────────────────────────┐
│ [icon]  │  Search...          🔔 🌙 [Avatar ▾]  │
│ VIZZU   ├────────────────────────────────────────┤
│         │                                        │
│ OPERAÇÕES│  Painel Administrativo                │
│ ▸ Agenda │  Visão completa do seu negócio        │
│   Client │                                       │
│   Profis │  Overview | Sucesso | Desemp | Aval   │
│   Serviç │  ────────────────────────────────────  │
│         │  [Stats Cards]  [Stats Cards]          │
│ FINANC  │  [Charts]       [Charts]               │
│ ▸ Insigh│                                        │
│   Contas│                                        │
│         │                                        │
│─────────│                                        │
│ VZ Admin│                                        │
│ ◁ ▷     │                                        │
└─────────┴────────────────────────────────────────┘
```

### Arquivos modificados
- `src/components/Sidebar.tsx`
- `src/components/Layout.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/card.tsx`
- `src/pages/Index.tsx`
- `src/components/dashboard/DashboardOverview.tsx`

