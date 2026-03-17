

# Aprimoramento Completo do Modo Claro

## Diagnóstico

O modo claro atual tem problemas de refinamento visual:
- Background `210 40% 98%` (azulado frio) cria pouco contraste com cards brancos
- Cards, inputs e tabs parecem "achatados" — falta profundidade e hierarquia visual
- Sidebar e header se misturam com o conteúdo — sem separação clara
- StatusCards e PageHeader funcionam mas carecem de polish (sombras, espaçamentos, bordas)
- Botões primários com `hover:-translate-y-0.5` e `active:scale-95` criam movimento desnecessário em contexto SaaS admin
- Tipografia h1 usa `text-primary` globalmente, o que nem sempre é adequado

## Alterações Planejadas

### 1. Variáveis CSS do modo claro (`src/index.css`)
- **Background**: Trocar de `210 40% 98%` para `220 14% 96%` — cinza neutro mais limpo
- **Muted**: Ajustar para `220 14% 93%` — melhor contraste com background
- **Border**: Tornar mais visível `220 13% 87%` para definir melhor os limites dos cards
- **Muted-foreground**: Escurecer levemente `220 9% 44%` para melhor legibilidade
- **Sombras**: Refinar `--shadow-subtle` e `--shadow-elegant` para mais profundidade suave
- **Sidebar**: Dar fundo branco puro `0 0% 100%` com borda mais definida

### 2. Componente Card (`src/components/ui/card.tsx`)
- Adicionar `shadow-subtle` padrão em vez de `shadow-sm`
- Border `border-border/60` (mais visível no claro)

### 3. Sidebar (`src/components/Sidebar.tsx`)
- Background `bg-card` (branco) em vez de `bg-background`
- Borda direita mais definida `border-border`
- Item ativo: fundo mais suave `bg-primary/8` com texto `text-primary` em vez de fundo sólido primary

### 4. Header/Layout (`src/components/Layout.tsx`)
- Background `bg-card` para header (branco) para separar do conteúdo
- Borda inferior mais definida `border-border`
- Search input: borda visível `border-border`

### 5. Botões (`src/components/ui/button.tsx`)
- Remover `hover:-translate-y-0.5` e `active:scale-95` do variant default — manter limpo para SaaS admin
- Manter transição de cor e sombra apenas

### 6. StatusCards (`src/components/ui/status-cards.tsx`)
- Adicionar `shadow-sm` mais definido
- Background `bg-card` explícito

### 7. Tabs (`src/components/ui/tabs.tsx`)
- TabsList: `bg-muted/70` mais sutil
- TabsTrigger ativo: `shadow-sm` mais pronunciado

### 8. PageHeader (`src/components/ui/page-header.tsx`)
- Ícone container: `bg-primary/8` mais sutil
- Título: `text-foreground` em vez de herdar `text-primary` do h1 global

### 9. Regra global h1 (`src/index.css`)
- Remover `text-primary` do h1 global — deixar cada componente decidir a cor do título

## Resultado Esperado
Interface mais limpa, com maior hierarquia visual entre fundo, cards e conteúdo. Sensação de profissionalismo SaaS moderno com elementos bem definidos e espaçados.

## Arquivos a editar
- `src/index.css` (variáveis + regra h1)
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/page-header.tsx`
- `src/components/ui/status-cards.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Layout.tsx`

