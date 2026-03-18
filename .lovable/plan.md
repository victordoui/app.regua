

# Adicionar Barra Superior com Busca

## Resumo
Remover a barra de busca da sidebar e criar um **Topbar** fixo no topo do conteúdo principal, com fundo branco, borda inferior e visual consistente com o sistema.

## Mudanças

### 1. Criar `src/components/Topbar.tsx`
Barra superior fixa com:
- **Busca** centralizada (input com ícone Search + atalho ⌘K) — mesma lógica de filtro que já existe na sidebar
- **Notificações** (ícone Bell) à direita
- **Avatar do usuário** com iniciais à direita
- Fundo branco, borda inferior `border-[hsl(var(--border))]`, altura ~56px
- Posicionada com `ml-[234px]` no desktop para alinhar com o conteúdo

### 2. Atualizar `src/components/Sidebar.tsx`
- **Remover** o bloco de busca (linhas 173-187)
- **Remover** o estado `searchQuery` e o `useEffect` do ⌘K
- **Remover** o `filteredMenu` — usar `menuStructure` diretamente na navegação

### 3. Atualizar `src/components/Layout.tsx`
- Importar e renderizar o `Topbar` acima do `<main>`
- Adicionar `pt-14` ao main para compensar a altura fixa do topbar

### Resultado Visual

```text
┌──────────┬──────────────────────────────────────┐
│          │  🔍 Buscar...  ⌘K     🔔  [AV]      │  ← Topbar
│  SIDEBAR │──────────────────────────────────────│
│  (sem    │                                      │
│  busca)  │         Conteúdo da página            │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

