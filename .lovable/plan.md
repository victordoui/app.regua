
# Plano: Melhorar Sidebar do Super Admin com icones nos grupos e espacamento reduzido

## Objetivo

Alinhar o visual da sidebar do Super Admin com o padrao da sidebar do Admin/Barbeiro, adicionando icones nos titulos dos grupos colapsaveis e reduzindo o espacamento entre os itens.

## Alteracoes no arquivo `src/components/superadmin/SuperAdminSidebar.tsx`

### 1. Adicionar icone em cada grupo do menu

Cada grupo colapsavel passara a ter um icone ao lado do titulo, seguindo o mesmo padrao visual da sidebar principal:

| Grupo | Icone |
|-------|-------|
| Visao Geral | LayoutDashboard |
| Gestao de Assinantes | Users |
| Marketing e Comunicacao | Send |
| Configuracoes | Settings |
| Suporte | Headphones |
| Auditoria | ScrollText |

### 2. Atualizar a interface MenuGroup

Adicionar campo `icon` na interface `MenuGroup`:

```typescript
interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}
```

### 3. Renderizar icone no CollapsibleTrigger

O botao do grupo passara a exibir o icone antes do titulo:

```typescript
<button className="flex items-center justify-between w-full px-3 py-1.5 ...">
  <div className="flex items-center gap-2">
    <group.icon className="h-4 w-4" />
    <span>{group.title}</span>
  </div>
  <ChevronDown ... />
</button>
```

### 4. Reduzir espacamento

| Elemento | Antes | Depois |
|----------|-------|--------|
| Espaco entre grupos (`space-y`) | `space-y-4` | `space-y-1` |
| Padding do trigger (`py`) | `py-2` | `py-1.5` |
| Padding dos sub-itens (`py`) | `py-2.5` | `py-2` |
| Margem superior dos sub-itens (`mt`) | `mt-1` | `mt-0` |
| Padding da nav | `p-4` | `p-3` |
| Padding do header | `p-6` | `p-4` |

## Resultado esperado

A sidebar do Super Admin ficara visualmente consistente com a sidebar principal, com icones em cada grupo e itens mais proximos entre si, semelhante a imagem de referencia.

## Resumo tecnico

| Item | Valor |
|------|-------|
| Arquivo modificado | `src/components/superadmin/SuperAdminSidebar.tsx` |
| Migracoes SQL | Nenhuma |
| Dependencias novas | Nenhuma |
