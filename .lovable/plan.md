

# Consolidação de Páginas em Abas + Fix Scroll da Sidebar

## 1. Comunicação → Página única com 3 abas

Consolidar **Conversas**, **Notificações** e **Chat Equipe** em uma única página `/conversations` com abas:

- **Aba "Conversas"** (default) — conteúdo atual de `Conversations.tsx`
- **Aba "Notificações"** — conteúdo atual de `AdvancedNotifications.tsx`
- **Aba "Chat Equipe"** — conteúdo atual de `TeamChat.tsx`

**Sidebar**: Categoria "Comunicação" passa a ter apenas 1 item: `Conversas` (`/conversations`).

**Rotas**: Adicionar redirects de `/advanced-notifications` e `/team-chat` para `/conversations`.

---

## 2. Outras páginas que podem ser consolidadas

### 2a. Financeiro: Cupons + Gift Cards + Preços Dinâmicos → "Promoções"
Três páginas relacionadas a descontos e precificação. Consolidar em `/coupons` com abas:
- **Aba "Cupons"** — conteúdo de `Coupons.tsx`
- **Aba "Gift Cards"** — conteúdo de `GiftCards.tsx`
- **Aba "Preços Dinâmicos"** — conteúdo de `DynamicPricing.tsx`

Sidebar: 3 itens → 1 item "Promoções".

### 2b. Meu Negócio: Empresa + Estoque + Galeria → Página única com abas
- **Aba "Empresa"** — `CompanySettings.tsx`
- **Aba "Estoque"** — `Inventory.tsx`
- **Aba "Galeria"** — `Gallery.tsx`

Sidebar: 3 itens → 1 item "Meu Negócio".

### 2c. Operações: Lista de Espera + Turnos → Abas dentro de "Agenda"
Ambas são auxiliares à gestão da agenda. Poderiam ser abas em `/appointments`:
- **Aba "Agenda"** — calendário atual
- **Aba "Lista de Espera"** — `Waitlist.tsx`
- **Aba "Turnos"** — `Shifts.tsx`

Sidebar: Remove 2 itens de Operações.

---

## 3. Fix: Scroll da sidebar subindo ao clicar

O problema é que ao clicar num item do menu, o `nav` com `overflow-y-auto` faz scroll para o topo. A causa provável é o re-render do componente ou o `button` causando scroll. 

**Fix**: Adicionar `e.preventDefault()` ou usar `scrollTop` preservation. A solução mais simples é adicionar CSS `scroll-behavior: auto` e garantir que o `nav` não resete posição no re-render, usando uma `ref` para manter a posição de scroll.

---

## Resumo do impacto na Sidebar

| Antes | Depois |
|---|---|
| Comunicação: 3 itens | Comunicação: 1 item (Conversas) |
| Financeiro: 7 itens | Financeiro: 5 itens (Promoções unifica 3) |
| Meu Negócio: 3 itens | Meu Negócio: 1 item |
| Operações: 6 itens | Operações: 4 itens |
| **Total sidebar: ~24** | **Total sidebar: ~16** |

## Arquivos alterados
- `src/pages/Conversations.tsx` — reescrita com 3 abas (extrai conteúdo dos outros)
- `src/pages/Coupons.tsx` — reescrita com 3 abas (Promoções)
- `src/pages/CompanySettings.tsx` — reescrita com 3 abas (Meu Negócio)
- `src/pages/Appointments.tsx` — adicionar abas Lista de Espera e Turnos
- `src/components/Sidebar.tsx` — remover itens consolidados, fix scroll
- `src/App.tsx` — adicionar redirects das rotas antigas

