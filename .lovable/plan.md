

# Remover botão "Criar" e badge "Ao Vivo"

## Alterações

### 1. `src/components/Layout.tsx`
Remover linhas 148-156 (botão "+ Criar") do header. Também remover o import `Plus` se não for mais usado.

### 2. `src/components/dashboard/DashboardOverview.tsx`
Remover linhas 44-58 (header com badge "Ao Vivo" e botão "Novo Agendamento"). Remover imports não utilizados: `Badge`, `Button`, `Plus`, `Wifi`, `useNavigate`, e `isConnected` do hook.

