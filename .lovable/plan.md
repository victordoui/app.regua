

# Padronizar Abas no Estilo do Sistema de Referência

## O que muda

A imagem de referência mostra abas com **ícone à esquerda**, **texto**, e um estilo de **fundo preenchido na aba ativa** (não sublinhado). As abas ficam dentro de uma barra com fundo sutil, estilo "pill/segmented control".

Atualmente, o sistema usa abas com sublinhado (underline style). Vamos mudar para o estilo da referência: abas com **fundo arredondado** na aba ativa, dentro de um container com fundo `muted`.

## Páginas afetadas (todas que usam TabsList)

1. **Index.tsx** — Dashboard (4 abas: Visão Geral, Sucesso do Cliente, Desempenho, Avaliações)
2. **Appointments.tsx** — Agenda (3 abas: Agenda, Lista de Espera, Turnos)
3. **Conversations.tsx** — Comunicação (3 abas)
4. **Coupons.tsx** — Promoções (3 abas)
5. **CompanySettings.tsx** — Meu Negócio (3 abas top + 3 abas internas)
6. **Reports.tsx** — Relatórios (abas internas)
7. **Commissions.tsx** — Comissões (2 abas)
8. **Loyalty.tsx** — Fidelidade (abas internas)
9. **Billing.tsx** — Financeiro (3 abas)
10. **Referrals.tsx** — Indicações (3 abas internas)
11. **Inventory.tsx** — Estoque (2 abas)
12. **AdvancedNotifications.tsx** — Notificações (4 abas)
13. **CustomerSuccess.tsx** — Sucesso do Cliente (3 abas)

## Alteração central: componente `tabs.tsx`

Em vez de editar 13+ páginas individualmente, vou alterar o componente base `src/components/ui/tabs.tsx` para mudar o estilo de **underline** para **pill/segmented** — fundo `muted` no container, fundo `background` + sombra na aba ativa, bordas arredondadas.

### Estilo atual (underline):
```
TabsList: border-b, bg-transparent
TabsTrigger: border-b-2, border-transparent → border-primary quando ativo
```

### Novo estilo (pill/segmented como referência):
```
TabsList: bg-muted, rounded-lg, p-1, gap-1
TabsTrigger: rounded-md → bg-background shadow-sm text-foreground quando ativo
```

Isso mantém todos os ícones e textos já existentes nas páginas, mudando apenas a aparência visual das abas globalmente.

## Appointments.tsx — Remover badge "Ao Vivo" restante

Na linha 89, ainda existe um badge `Ao Vivo` que não foi removido anteriormente. Será removido junto.

