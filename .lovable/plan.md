
# Plano: Controle de Acesso por Hierarquia de Cargos

## Resumo
Implementar restricao de acesso real baseada nos 4 papeis do sistema. Atualmente, qualquer usuario autenticado (admin, barbeiro, cliente) consegue acessar todas as rotas do dashboard. O objetivo e que cada papel veja apenas o que lhe pertence.

---

## Hierarquia de Papeis

```text
+--------------------------------------------------+
| SUPER ADMIN (Dono da plataforma - voce)          |
| Acesso: TUDO + painel /superadmin/*              |
+--------------------------------------------------+
         |
+--------------------------------------------------+
| ADMIN (Dono de barbearia)                        |
| Acesso: Dashboard completo, financeiro,          |
| configuracoes, barbeiros, clientes, etc.         |
+--------------------------------------------------+
         |
+--------------------------------------------------+
| BARBEIRO (Funcionario)                           |
| Acesso: Agendamentos, Clientes, Chat da Equipe, |
| Meu Perfil, Turnos/Escalas                       |
+--------------------------------------------------+

+--------------------------------------------------+
| CLIENTE (Consumidor final)                       |
| Acesso: Area mobile /b/:userId/* apenas          |
| (Agendamento, Historico, Fidelidade, Perfil)     |
+--------------------------------------------------+
```

---

## O que sera implementado

### 1. ProtectedRoute com suporte a lista de roles permitidos
Atualmente o `ProtectedRoute` aceita apenas `requiredRole` (um unico papel). Sera atualizado para aceitar `allowedRoles` (lista de papeis), permitindo definir quais cargos podem acessar cada rota. O super_admin sempre tera acesso a tudo.

### 2. Definicao das rotas por papel

**Rotas do BARBEIRO** (acesso limitado):
- `/` (Dashboard simplificado - sera redirecionado)
- `/appointments` (Agendamentos)
- `/clients` (Clientes)
- `/team-chat` (Chat da Equipe)
- `/shifts` (Turnos/Escalas)
- `/profile` (Meu Perfil)
- `/conversations` (Conversas)
- `/advanced-notifications` (Notificacoes)

**Rotas exclusivas do ADMIN** (tudo que o barbeiro nao ve):
- Dashboard completo (`/`)
- `/barbers`, `/services`, `/waitlist`
- `/reports`, `/billing`, `/commissions`, `/coupons`, `/gift-cards`, `/dynamic-pricing`
- `/subscriptions`, `/subscriptions/new`, `/loyalty`, `/referrals`
- `/settings/company`, `/inventory`, `/gallery`, `/integrations`
- `/users`, `/settings`, `/cash`, `/sales-reports`
- `/campaigns`, `/customer-success`, `/barber-performance`, `/reviews`
- `/commission-rules`, `/booking`, `/upgrade`

**CLIENTE**: Sera redirecionado automaticamente para a area mobile ao acessar `/`.

### 3. Sidebar filtrada por papel
A `Sidebar` passara a filtrar as categorias e itens de menu conforme o papel do usuario. Barbeiros verao apenas as categorias relevantes (Operacoes parcial, Comunicacao parcial, e Meu Perfil).

### 4. Redirecionamento inteligente no ProtectedRoute
- Se um **cliente** tentar acessar `/`, sera redirecionado para a area mobile
- Se um **barbeiro** tentar acessar uma rota exclusiva de admin, sera redirecionado para `/appointments`
- Se um usuario sem papel tentar acessar qualquer rota, sera redirecionado para `/login`

### 5. Dashboard simplificado para Barbeiro
Quando um barbeiro acessar `/`, vera um dashboard simplificado mostrando apenas seus agendamentos do dia, proximos horarios e chat, sem dados financeiros ou metricas de gestao.

---

## Detalhes Tecnicos

### Arquivo: `src/components/ProtectedRoute.tsx`
- Adicionar prop `allowedRoles?: AppRole[]`
- Super admin sempre passa (acesso total)
- Se `allowedRoles` definido, verificar se `userRole` esta na lista
- Redirecionamento inteligente: cliente para area mobile, barbeiro para `/appointments`

### Arquivo: `src/App.tsx`
- Rotas de admin receberao `allowedRoles={['admin']}`
- Rotas compartilhadas receberao `allowedRoles={['admin', 'barbeiro']}`
- Rotas de super admin mantidas com `requiredRole="super_admin"`

### Arquivo: `src/components/Sidebar.tsx`
- Importar `useRole` (ja importa)
- Usar `isAdmin`, `isBarbeiro` para filtrar `menuStructure`
- Barbeiro vera: Dashboard (so agenda do dia), Agendamentos, Clientes, Conversas, Chat da Equipe, Turnos, Meu Perfil
- Admin vera tudo como ja esta

### Arquivo: `src/pages/Index.tsx` (Dashboard)
- Verificar role e exibir versao simplificada para barbeiros
- Barbeiro ve: agendamentos do dia, proximos horarios
- Admin ve: dashboard completo como esta hoje

### Arquivos modificados
- `src/components/ProtectedRoute.tsx` - Logica de allowedRoles e redirecionamento
- `src/App.tsx` - Adicionar allowedRoles em cada rota
- `src/components/Sidebar.tsx` - Filtrar menu por papel
- `src/pages/Index.tsx` - Dashboard condicional por papel
