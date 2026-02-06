

# Plano: Pagina "Meu Perfil" com informacoes da assinatura

## Objetivo

Criar uma pagina dedicada "Meu Perfil" (`/profile`) para o admin (dono da barbearia) que mostra dados pessoais e informacoes da sua assinatura na plataforma. No Super Admin, exibir essas mesmas informacoes ao consultar detalhes de um assinante.

## Alteracoes

### 1. Nova pagina `src/pages/Profile.tsx`

Pagina com duas secoes principais:

**Secao 1 - Dados Pessoais**
- Nome completo (do profiles/auth)
- Email
- Telefone
- Botao para editar

**Secao 2 - Minha Assinatura**
- Card com o plano atual (trial/basic/pro/enterprise) com badge colorido
- Status da assinatura (ativo, suspenso, etc.)
- Data de inicio e termino
- Tempo restante da assinatura (ex: "Expira em 45 dias")
- Barra de progresso visual do tempo consumido
- Limites do plano: max barbeiros, max agendamentos/mes
- Lista de funcionalidades incluidas (campo `features` da tabela)
- Uso atual vs limite (quantos barbeiros cadastrados, quantos agendamentos no mes)

Os dados serao carregados de `platform_subscriptions` (filtrado pelo user_id do usuario logado) e cruzados com `platform_plan_config` para exibir nome e detalhes do plano.

### 2. Novo hook `src/hooks/useMySubscription.ts`

Hook dedicado que:
- Busca a assinatura ativa do usuario logado em `platform_subscriptions`
- Busca os detalhes do plano em `platform_plan_config`
- Calcula dias restantes e percentual consumido
- Conta barbeiros cadastrados e agendamentos do mes para mostrar uso atual

### 3. Sidebar - Adicionar "Meu Perfil" em Administracao

No arquivo `src/components/Sidebar.tsx`, adicionar na categoria "administracao":
- Novo item: icone `UserCircle`, label "Meu Perfil", path `/profile`

### 4. Layout header - Atualizar link do dropdown

No `src/components/Layout.tsx`, o dropdown do avatar ja tem "Meu Perfil" mas aponta para `/settings`. Atualizar para apontar para `/profile`.

### 5. Rota no App.tsx

Adicionar rota protegida `/profile` apontando para a nova pagina.

### 6. Super Admin - Detalhes do assinante

Na pagina `SubscribersManagement.tsx`, ao clicar em um assinante na tabela, abrir um dialog/drawer lateral com as mesmas informacoes de plano e uso que o admin ve no seu perfil, porem em modo somente leitura. Isso reutiliza um componente compartilhado de exibicao de assinatura.

### 7. Componente compartilhado `src/components/subscriptions/SubscriptionInfoCard.tsx`

Componente reutilizavel que recebe dados da assinatura e exibe:
- Badge do plano com cor
- Status
- Datas e tempo restante
- Barra de progresso
- Limites e uso

Sera usado tanto na pagina Profile (admin) quanto no dialog do Super Admin.

---

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/Profile.tsx` | Criar |
| `src/hooks/useMySubscription.ts` | Criar |
| `src/components/subscriptions/SubscriptionInfoCard.tsx` | Criar |
| `src/components/Sidebar.tsx` | Modificar - adicionar "Meu Perfil" |
| `src/components/Layout.tsx` | Modificar - link do dropdown |
| `src/App.tsx` | Modificar - adicionar rota `/profile` |
| `src/pages/superadmin/SubscribersManagement.tsx` | Modificar - adicionar dialog de detalhes |

## Detalhes tecnicos

### useMySubscription.ts

```typescript
// Busca platform_subscriptions onde user_id = usuario logado
// Busca platform_plan_config onde plan_type = assinatura.plan_type
// Conta barbeiros: select count from barbers where user_id
// Conta agendamentos do mes: select count from appointments where user_id and month
// Retorna: subscription, planConfig, usage, daysRemaining, progressPercent
```

### SubscriptionInfoCard - Campos exibidos

| Campo | Fonte |
|-------|-------|
| Nome do plano | platform_plan_config.display_name |
| Tipo | platform_subscriptions.plan_type |
| Status | platform_subscriptions.status |
| Inicio | platform_subscriptions.start_date |
| Termino | platform_subscriptions.end_date |
| Max barbeiros | platform_subscriptions.max_barbers |
| Max agendamentos | platform_subscriptions.max_appointments_month |
| Features | platform_subscriptions.features |
| Preco | platform_plan_config.price_monthly |

