

# Fase 2 — Remover Topbar + Ajustar Layout

## Mudanças em `src/components/Layout.tsx`

### 1. Remover o header/topbar completamente
- Deletar todo o bloco `<header>` (linhas 104-183)
- Remover o mobile menu overlay (linhas 191-224)
- Remover imports não mais necessários: `DropdownMenu*`, `Avatar`, `Bell`, `Search`, `Input`, `ThemeToggle`, `Badge`, `TrialBanner`, `Menu`, `X`, `Settings`, `UserCircle`, `ChevronDown`
- Remover states e funções ligados ao header: `mobileMenuOpen`, `unreadCount`, `fetchUnreadCount`, `setupRealtimeSubscription`, `handleSignOut`, `getUserInitials`, `getUserName`, `handleNavigate`, `formatDate`
- Manter apenas: `useAuth` (se necessário para outros componentes), `Sidebar`, e o children

### 2. Ajustar content area
- Content `<main>` recebe padding `p-[28px] pb-[40px]`
- Sidebar fixa a 234px → content usa `ml-[234px]` no desktop para compensar a sidebar fixa

### 3. Layout simplificado resultante
```
<div className="flex h-screen bg-white">
  <Sidebar />
  <main className="flex-1 ml-[234px] overflow-auto p-[28px] pb-[40px]">
    {children}
  </main>
</div>
```

### 4. Ajustar Sidebar width
- Em `src/components/Sidebar.tsx`, alterar `sidebarWidth` de 240 para 234 quando expandido (linha 144)
- O modo colapsado (68px) permanece igual

### Responsividade
- `ml-[234px]` apenas em `md:` breakpoint e acima
- No mobile, `ml-0` (sidebar vira overlay como já funciona)

### Arquivos editados
- `src/components/Layout.tsx` — simplificação radical
- `src/components/Sidebar.tsx` — width 240→234

