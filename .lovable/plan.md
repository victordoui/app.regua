

# Remover Subtítulos e Padronizar Títulos das Páginas

## Objetivo
Remover todas as linhas `<p>` de subtítulo das páginas e padronizar todos os `<h1>` para o mesmo tamanho: `text-xl md:text-2xl font-bold text-foreground` (estilo da página Clientes).

## Páginas afetadas (~20 arquivos)

Cada página terá:
1. A linha `<p className="text-...text-muted-foreground">...</p>` removida
2. O `<h1>` padronizado para `className="text-xl md:text-2xl font-bold text-foreground"`

### Lista de arquivos e mudanças:

| Arquivo | Título | Subtítulo a remover |
|---|---|---|
| `Clients.tsx` | Clientes | "Gerencie sua base de clientes" |
| `Index.tsx` | Painel Administrativo | "Visão completa do seu negócio..." |
| `Conversations.tsx` | Comunicação | "Gerencie conversas, notificações..." |
| `Coupons.tsx` | Promoções | "Gerencie cupons, gift cards..." |
| `CompanySettings.tsx` | Meu Negócio | subtítulo existente |
| `Appointments.tsx` | Agenda | subtítulo existente |
| `Services.tsx` | Serviços e Combos | "Gerencie serviços individuais..." |
| `Settings.tsx` | Configurações | "Gerencie as configurações..." |
| `Reports.tsx` | Relatórios | "Visualize os dados e métricas..." |
| `Loyalty.tsx` | Fidelidade & Indicações | "Programa de pontos..." |
| `Commissions.tsx` | Comissões | "Calcule e gerencie..." |
| `Inventory.tsx` | Estoque | "Gerencie produtos..." |
| `Waitlist.tsx` | Lista de Espera | "Gerencie clientes aguardando..." |
| `SalesReports.tsx` | Relatórios de Vendas | "Análise detalhada..." |
| `Subscriptions.tsx` | Assinaturas | "Gerencie planos de assinatura..." |
| `SubscriptionCreation.tsx` | Criar / Editar Plano | "Configure novos planos..." |
| `Campaigns.tsx` | Campanhas | subtítulo existente |
| `Referrals.tsx` | se houver subtítulo |
| `BarberManagement.tsx` | se houver subtítulo |
| `Billing.tsx` | se houver subtítulo |

Também verificarei páginas superadmin (`SubscribersManagement`, `ExpiringSubscriptions`, etc.) para consistência.

## Regra de padronização
```tsx
// ANTES (variações)
<h1 className="text-3xl font-bold tracking-tight">Título</h1>
<p className="text-muted-foreground">Subtítulo descritivo</p>

// DEPOIS (padrão único)
<h1 className="text-xl md:text-2xl font-bold text-foreground">Título</h1>
```

## Escopo
- Apenas títulos de cabeçalho de página (não labels de cards, stats ou conteúdo interno)
- Páginas públicas e de login mantidas como estão (têm layout diferente)

