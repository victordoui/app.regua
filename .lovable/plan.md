
# Plano: Banner Trial na Barra Superior + Botao de Upgrade no Perfil

## Objetivo
Duas melhorias para usuarios em periodo de teste (trial):
1. Exibir um banner/indicador na barra superior de navegacao mostrando "Acesso Trial" com dias restantes e link para assinar um plano pago.
2. Adicionar botao "Ativar Plano" na pagina Meu Perfil (SubscriptionInfoCard) para que o dono da barbearia possa fazer upgrade antes do trial expirar.

---

## O que sera implementado

### 1. Componente `TrialBanner` na barra superior (Layout.tsx)
Um componente compacto exibido no header, a esquerda do avatar, somente para usuarios com assinatura trial ativa. Mostrara:
- Icone de relogio + texto "Trial" com badge amarela
- Dias restantes (ex: "7 dias restantes")
- Botao "Assinar Plano" que direciona para uma pagina/dialog de escolha de plano

O componente usara o hook `useMySubscription` ja existente para obter os dados da assinatura e dias restantes.

### 2. Pagina de Upgrade (`/upgrade`) para selecao de plano
Uma pagina interna (protegida) onde o usuario trial pode visualizar os planos pagos (Basic, Professional, Enterprise) com precos e funcionalidades, e clicar para iniciar o checkout via Stripe (usando a edge function `create-checkout` ja existente).

Os dados dos planos serao buscados da tabela `platform_plan_config` para manter consistencia com o que o Super Admin configura.

### 3. Botao "Ativar Plano" no SubscriptionInfoCard
Quando a assinatura for do tipo `trial`, exibir um botao destacado "Ativar Plano Agora" que redireciona para `/upgrade`. Tambem sera exibido para planos expirados ou cancelados.

---

## Detalhes Tecnicos

### Novo arquivo: `src/components/TrialBanner.tsx`
- Usa `useMySubscription()` para verificar se o plano e trial
- Renderiza badge amarela com "Trial - X dias restantes" e botao "Assinar"
- Retorna `null` se nao for trial ou se estiver carregando

### Novo arquivo: `src/pages/Upgrade.tsx`
- Busca planos pagos de `platform_plan_config` (excluindo trial)
- Exibe cards com nome, preco, funcionalidades
- Botao "Assinar" chama `supabase.functions.invoke('create-checkout', { body: { plan_type } })`
- Redireciona para o checkout Stripe

### Arquivos modificados
- **`src/components/Layout.tsx`**: Importar e renderizar `TrialBanner` no header, entre o ThemeToggle e o botao de notificacoes
- **`src/components/subscriptions/SubscriptionInfoCard.tsx`**: Adicionar botao "Ativar Plano Agora" quando `plan_type === 'trial'` (ou status expirado/cancelado), usando `useNavigate` para ir a `/upgrade`
- **`src/App.tsx`**: Adicionar rota protegida `/upgrade` apontando para `Upgrade.tsx`

### Fluxo do usuario
1. Usuario trial faz login
2. Ve na barra superior: "Trial - 10 dias restantes | Assinar Plano"
3. Clica no botao ou vai em Meu Perfil > Minha Assinatura
4. Na pagina de Upgrade, escolhe um plano pago
5. E redirecionado ao Stripe Checkout
6. Apos pagamento, o webhook atualiza a assinatura automaticamente
