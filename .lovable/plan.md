

# Limpeza de Código Obsoleto e Não Utilizado

## Diagnóstico

Após a consolidação de páginas em abas, várias páginas e imports ficaram órfãos no sistema.

### 1. Imports mortos em `src/App.tsx` (importados mas nunca usados em rotas)
Estes componentes são importados mas **nenhuma rota os renderiza** — as rotas correspondentes usam `<Navigate>`:
- `AdvancedNotifications` (linha 24)
- `BarberPerformance` (linha 28)
- `Campaigns` (linha 29)
- `CustomerSuccess` (linha 23)
- `Inventory` (linha 33)
- `Reviews` (linha 36)
- `Gallery` (linha 37)
- `Waitlist` (linha 39)
- `GiftCards` (linha 41)
- `DynamicPricing` (linha 42)
- `Shifts` (linha 43)
- `TeamChat` (linha 44)

**Ação:** Remover os 12 imports.

### 2. Arquivos de página completamente órfãos (sem import em nenhum lugar do projeto)
Páginas que existem em `src/pages/` mas não são importadas nem referenciadas:
- `Integrations.tsx`
- `SubscriptionCreation.tsx`
- `Settings.tsx`
- `CommissionRules.tsx`
- `SalesReports.tsx`
- `Referrals.tsx`
- `OnlineBooking.tsx`
- `NotFound.tsx`
- `Notifications.tsx`
- `NotificationsPage.tsx`
- `ConversationsPage.tsx`

**Ação:** Deletar estes 11 arquivos.

### 3. Páginas com import mas sem rota ativa — candidatas a deleção
As 12 páginas do item 1 (AdvancedNotifications, Campaigns, etc.) são importadas mas nunca renderizadas. Suas funcionalidades já foram absorvidas pelas páginas consolidadas.

**Ação:** Deletar estes 12 arquivos após remover os imports.

### 4. Componente `src/components/ui/sidebar.tsx`
O arquivo está praticamente vazio (só tem um comentário). O sistema usa `src/components/Sidebar.tsx`.

**Ação:** Deletar `src/components/ui/sidebar.tsx`.

---

## Resumo das mudanças

| Ação | Quantidade |
|------|-----------|
| Imports removidos de App.tsx | 12 |
| Arquivos de página deletados | 23 |
| Componente UI deletado | 1 |
| **Total de arquivos removidos** | **24** |

### Arquivo editado:
- **`src/App.tsx`** — remover 12 imports não utilizados, manter todas as rotas e redirects intactos

### Arquivos deletados:
`AdvancedNotifications.tsx`, `BarberPerformance.tsx`, `Campaigns.tsx`, `CommissionRules.tsx`, `ConversationsPage.tsx`, `CustomerSuccess.tsx`, `DynamicPricing.tsx`, `Gallery.tsx`, `GiftCards.tsx`, `Integrations.tsx`, `Inventory.tsx`, `NotFound.tsx`, `Notifications.tsx`, `NotificationsPage.tsx`, `OnlineBooking.tsx`, `Referrals.tsx`, `Reviews.tsx`, `SalesReports.tsx`, `Settings.tsx`, `Shifts.tsx`, `SubscriptionCreation.tsx`, `TeamChat.tsx`, `Waitlist.tsx`, `src/components/ui/sidebar.tsx`

