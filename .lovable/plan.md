

# Aplicar paleta VIZZU em todo o sistema

## Escopo

Substituir todas as cores avulsas do Tailwind (green, orange, purple, pink, amber, yellow, etc.) por variações da paleta VIZZU azul em todos os componentes internos. A tela de Login **não será alterada**.

## Regra de mapeamento de cores

| Cor original | Substituto VIZZU |
|---|---|
| `green-500/600` (sucesso, concluído, receita) | `emerald-500` para status semânticos de sucesso — **mantemos verde para sucesso/dinheiro** pois é universalmente reconhecido, mas padronizamos para `emerald` |
| `red-500/600` (erro, cancelado) | `destructive` (já usa a variável do tema) |
| `purple-500`, `indigo-500` | `primary` / `primary-600` |
| `pink-500` (aniversários, corações) | `primary-400` |
| `orange-500` (alertas, inativos) | `amber-500` para alertas semânticos — **mantemos amber para warnings** |
| `yellow-400/500` (estrelas, trophies) | `amber-400` (padrão para ratings) |
| `blue-500` (genérico) | `primary` |
| `amber-500 to-orange-500` (SuperAdmin) | `primary-800 to-primary` (gradient VIZZU dark) |

**Filosofia**: Cores semânticas (verde=sucesso, vermelho=erro, amber=alerta) permanecem pois são padrão UX. Cores decorativas/de marca (purple, pink, indigo, orange em ícones/badges) passam para a paleta VIZZU.

## Arquivos a alterar

### 1. `src/components/dashboard/DashboardOverview.tsx`
- `case "green": return "from-green-500 to-green-600"` → `"from-primary-400 to-primary-600"`
- `text-green-600` / `text-orange-600` trend colors → manter (semânticos)
- Badge `bg-green-500` "Ao Vivo" → `bg-primary`

### 2. `src/components/dashboard/TodayMetricsPanel.tsx`
- `from-green-500 to-green-600` → `from-primary-400 to-primary-600`
- `bg-green-50` → `bg-primary-50 dark:bg-primary/10`
- `from-amber-500 to-amber-600` → `from-primary-600 to-primary-800`
- `bg-amber-50` → `bg-primary-50 dark:bg-primary/10`

### 3. `src/components/dashboard/BarberPerformanceContent.tsx`
- `text-green-500` (DollarSign) → `text-primary-400`
- `text-purple-500` (TrendingUp) → `text-primary-600`
- `text-yellow-500` (Trophy) → `text-primary-400`
- `text-blue-500` → `text-primary`

### 4. `src/components/dashboard/BirthdayClients.tsx`
- `text-pink-500` (Cake icon) → `text-primary-400`
- `bg-pink-500` (badge/avatar) → `bg-primary`

### 5. `src/components/dashboard/InactiveClients.tsx`
- `text-orange-500` (UserX) → `text-primary-600`
- `bg-orange-500/10 text-orange-500` → `bg-primary/10 text-primary`
- `text-red-500 border-red-500` (badge >60d) → `text-destructive border-destructive`

### 6. `src/components/dashboard/RecentActivities.tsx`
- `text-green-500` / `bg-green-500/10` (completed, payment) → `text-primary-400` / `bg-primary-400/10`
- `text-red-500` / `bg-red-500/10` (cancelled) → `text-destructive` / `bg-destructive/10`

### 7. `src/components/dashboard/BarberOccupancyCard.tsx`
- `text-green-600` / `bg-green-500` → `text-primary` / `bg-primary`
- `text-amber-600` / `bg-amber-500` → `text-primary-600` / `bg-primary-600`
- `text-red-600` / `bg-red-500` → `text-destructive` / `bg-destructive`
- `text-green-600` revenue → `text-primary`

### 8. `src/components/dashboard/CustomerSuccessContent.tsx`
- `bg-yellow-100 text-yellow-800` → `bg-primary-100 text-primary-800`
- `bg-blue-100 text-blue-800` → `bg-primary-200 text-primary`
- `bg-green-100 text-green-800` → `bg-primary-50 text-primary-600`
- Stars `fill-yellow-400 text-yellow-400` → `fill-primary-400 text-primary-400`

### 9. `src/components/superadmin/SuperAdminSidebar.tsx`
- `from-amber-500 to-orange-500` → `from-primary-800 to-primary`
- "Na Régua Platform" → "VIZZU Platform"

### 10. `src/pages/superadmin/SuperAdminDashboard.tsx`
- `PLAN_COLORS.pro: '#8b5cf6'` → `'#2E6FD3'`
- `PLAN_COLORS.enterprise: '#f59e0b'` → `'#0F2F6B'`

### 11. `src/pages/Users.tsx`
- `from-green-500 to-green-600` → `from-primary-400 to-primary-600`
- `from-orange-500 to-orange-600` → `from-primary-600 to-primary-800`
- `from-purple-500 to-purple-600` → `from-primary to-primary-800`

### 12. `src/pages/CompanySettings.tsx`
- `from-purple-500 to-pink-500` (Instagram) → `from-primary to-primary-600`

### 13. `src/pages/public/SalesPage.tsx`
- Plan gradients: `from-purple-500` → `from-primary`, `from-amber-500 to-orange-500` → `from-primary-800 to-primary`

### 14. `src/pages/public/SignupPage.tsx`
- `from-amber-500 to-orange-500` Popular badge → `from-primary to-primary-600`

### 15. `src/components/appointments/AppointmentTableView.tsx`
- `bg-amber-50/50` / `bg-amber-500` new badge → `bg-primary-50/50` / `bg-primary`

### 16. `src/pages/superadmin/TicketDetail.tsx`
- `bg-amber-500/10 text-amber-600` → `bg-primary-600/10 text-primary-600`

