

# Reorganizar Sidebar — Agrupar páginas de configuração e compactar

## O que muda

### 1. Reorganizar categorias do menu (`src/components/Sidebar.tsx`)

Unificar "Meu Negócio", "Meu Perfil" e "Usuários" em uma única categoria chamada **"Configurações"** (ou "Conta"), posicionada no **topo da sidebar**, logo após o Dashboard:

```text
── Dashboard
   └─ Painel
── Configurações
   └─ Meu Negócio
   └─ Meu Perfil
   └─ Usuários
── Operações
   └─ Agenda
   └─ Clientes
   └─ Profissionais
   └─ Serviços
── Comunicação
   └─ Conversas
── Financeiro
   └─ Insights / Contas / Comissões / Promoções / Caixa
── Engajamento
   └─ Planos / Rewards
```

Remover as categorias separadas "Meu Negócio" e "Administração".

### 2. Compactar espaçamento vertical (`src/components/Sidebar.tsx`)

- Reduzir padding dos category labels de `pt-4 pb-1.5` para `pt-2 pb-1`
- Reduzir padding dos itens de `py-2` para `py-1.5`
- Reduzir `mb-1` das categorias para `mb-0`
- Resultado: itens mais "colados" verticalmente

### Arquivo editado
- `src/components/Sidebar.tsx` (reorganização + compactação)

