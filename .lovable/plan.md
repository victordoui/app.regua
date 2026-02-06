

# Plano: Criar Assinante, Adicionar Assinante e Fluxo de Cadastro Publico

## Contexto

Atualmente, a tabela `platform_subscriptions` existe mas so pode ser gerenciada pelo Super Admin. Falta:
1. Um botao para o Super Admin **criar assinatura manualmente** (adicionar um novo assinante)
2. Uma **pagina publica de cadastro** onde o barbeiro (dono da barbearia) pode se registrar, escolher um plano e assinar para ter acesso ao app Na Regua

## O que sera feito

### Parte 1: Botao "Novo Assinante" na pagina de Gestao de Assinantes

Na pagina `SubscribersManagement.tsx`, adicionar um botao "Novo Assinante" que abre um dialog para o Super Admin criar manualmente uma assinatura:
- Campos: Email do usuario, Plano (trial/basic/pro/enterprise), Data de inicio, Data de termino, Notas
- Ao salvar, insere na tabela `platform_subscriptions` e registra no audit log

### Parte 2: Nova pagina publica de cadastro para barbeiros

Criar uma pagina publica `/cadastro` onde donos de barbearia podem:
1. **Criar conta** (email + senha + nome da barbearia)
2. **Escolher um plano** (carregado da tabela `platform_plan_config`)
3. **Confirmar assinatura** (inicia como trial ou com o plano escolhido)

Apos o cadastro, o usuario recebe a role `admin` e uma entrada em `platform_subscriptions`.

### Parte 3: Novas sugestoes na Sidebar do Super Admin

Adicionar dois novos itens ao menu:
- **Onboarding de Assinantes** (em "Gestao de Assinantes") - para acompanhar novos cadastros
- **Relatorios de Crescimento** (em "Visao Geral") - metricas de aquisicao

---

## Arquivos a criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/public/SignupPage.tsx` | Pagina publica de cadastro com fluxo em etapas |
| `src/components/superadmin/NewSubscriberDialog.tsx` | Dialog para Super Admin criar assinante manualmente |

## Arquivos a modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/superadmin/SubscribersManagement.tsx` | Adicionar botao "Novo Assinante" + importar dialog |
| `src/hooks/useSuperAdmin.ts` | Adicionar mutation `createSubscription` |
| `src/App.tsx` | Adicionar rota `/cadastro` publica |
| `src/components/superadmin/SuperAdminSidebar.tsx` | Adicionar novos itens de menu sugeridos |

## Migracoes SQL necessarias

Uma migracao para:
- Adicionar politica RLS que permita INSERT na `platform_subscriptions` para usuarios autenticados (para o proprio user_id no auto-cadastro)
- Criar funcao `create_subscriber_with_subscription` (security definer) que cria o perfil + subscription de forma atomica

---

## Detalhes Tecnicos

### NewSubscriberDialog.tsx

```typescript
// Dialog com formulario:
// - Input: user_id (UUID ou email para buscar)
// - Select: plan_type (trial, basic, pro, enterprise)
// - Input: start_date, end_date
// - Textarea: notes
// Ao salvar: insere em platform_subscriptions + audit log
```

### SignupPage.tsx - Fluxo em 3 etapas

```text
Etapa 1: Criar Conta
  - Nome completo
  - Nome da barbearia
  - Email
  - Senha
  - Telefone

Etapa 2: Escolher Plano
  - Cards com os planos carregados de platform_plan_config
  - Destaque no plano "Pro" como mais popular
  - Opcao de iniciar com Trial gratuito

Etapa 3: Confirmacao
  - Resumo dos dados
  - Termos de uso
  - Botao "Criar Minha Conta"
```

### Fluxo tecnico do cadastro

```text
1. Usuario preenche dados pessoais
2. Chama supabase.auth.signUp() para criar conta
3. Insere perfil na tabela profiles
4. Insere role 'admin' na tabela user_roles
5. Insere subscription na tabela platform_subscriptions
   (via funcao security definer para garantir atomicidade)
6. Redireciona para /onboarding
```

### Hook useSuperAdmin.ts - Nova mutation

```typescript
const createSubscription = useMutation({
  mutationFn: async (data: {
    user_id: string;
    plan_type: PlanType;
    start_date: string;
    end_date?: string;
    notes?: string;
  }) => {
    // Buscar limites do plano em platform_plan_config
    const { data: planConfig } = await supabase
      .from('platform_plan_config')
      .select('*')
      .eq('plan_type', data.plan_type)
      .single();

    // Inserir subscription
    const { error } = await supabase
      .from('platform_subscriptions')
      .insert({
        user_id: data.user_id,
        plan_type: data.plan_type,
        status: 'active',
        start_date: data.start_date,
        end_date: data.end_date,
        max_barbers: planConfig?.max_barbers || 3,
        max_appointments_month: planConfig?.max_appointments_month || 100,
        features: planConfig?.features || {},
        notes: data.notes,
      });

    if (error) throw error;

    // Audit log
    await supabase.from('platform_audit_logs').insert([{
      super_admin_id: user?.id || '',
      action: 'activate_subscription',
      target_user_id: data.user_id,
      details: { plan_type: data.plan_type },
    }]);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
    toast({ title: 'Assinante criado com sucesso!' });
  },
});
```

### Sidebar - Novos itens sugeridos

| Grupo | Novo Item | Icone | Rota |
|-------|-----------|-------|------|
| Visao Geral | Crescimento | TrendingUp | `/superadmin/growth` |
| Gestao de Assinantes | Novo Assinante | UserPlus | abre dialog inline |

---

## Resumo

| Item | Valor |
|------|-------|
| Arquivos criados | 2 |
| Arquivos modificados | 4 |
| Migracoes SQL | 1 |
| Paginas publicas novas | `/cadastro` |
| Funcionalidades | Criar assinante (SA), Auto-cadastro de barbeiro, Novos menus |

