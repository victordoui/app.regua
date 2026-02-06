

# Plano: Indentar sub-itens da Sidebar do Super Admin

## Problema

Os sub-itens (Dashboard, Metricas Financeiras, etc.) aparecem no mesmo nivel visual que os titulos dos grupos (Visao Geral, Gestao de Assinantes), dando a impressao de que sao paginas independentes e nao sub-paginas.

## Solucao

Adicionar indentacao (padding-left) nos sub-itens e uma pequena margem superior para criar o efeito de "escadinha", deixando claro que sao filhos do grupo.

## Alteracoes no arquivo `src/components/superadmin/SuperAdminSidebar.tsx`

### 1. Adicionar margem superior no CollapsibleContent

Mudar de `mt-0` para `mt-0.5` para dar um pequeno respiro entre o titulo do grupo e os sub-itens.

### 2. Aumentar o padding-left dos sub-itens

Mudar o `px-4` dos Links para `pl-9 pr-4`, alinhando os sub-itens mais a direita do que o titulo do grupo (que tem `px-3`). Isso cria o efeito visual de hierarquia.

| Elemento | Antes | Depois |
|----------|-------|--------|
| CollapsibleContent `mt` | `mt-0` | `mt-0.5` |
| Sub-item padding | `px-4` | `pl-9 pr-4` |

### Resultado visual esperado

```text
  [icon] Visao Geral          v
           [icon] Dashboard
           [icon] Metricas Financeiras
  [icon] Gestao de Assinantes  v
           [icon] Assinantes
           [icon] Assinaturas Expirando
```

## Resumo

| Item | Valor |
|------|-------|
| Arquivo modificado | `src/components/superadmin/SuperAdminSidebar.tsx` |
| Linhas alteradas | 2 |

