

# Plano: Pagina de Vendas Publica

## Objetivo

Criar uma pagina publica de vendas (`/vendas` ou `/planos`) acessivel sem login, que apresenta os planos da plataforma Na Regua de forma atrativa. Os dados dos planos vem da tabela `platform_plan_config` (editaveis pelo Super Admin em "Planos e Precos"). Ao clicar em "Assinar", o visitante e redirecionado para `/cadastro` com o plano pre-selecionado.

## O que sera feito

### 1. Nova pagina `src/pages/public/SalesPage.tsx`

Pagina publica com layout moderno contendo:

- **Hero Section**: Titulo chamativo, subtitulo explicativo e CTA principal
- **Cards de Planos**: Carregados dinamicamente de `platform_plan_config` (apenas planos ativos)
  - Nome do plano (display_name)
  - Preco mensal e anual (se disponivel)
  - Limites: max barbeiros, max agendamentos/mes
  - Lista de features com icones de check/x
  - Badge "Popular" no plano Pro
  - Botao "Comecar Agora" que redireciona para `/cadastro?plano={plan_type}`
- **Secao de beneficios**: 3-4 cards com os diferenciais do sistema (agendamento online, gestao financeira, fidelidade, etc.)
- **FAQ simples**: Perguntas frequentes sobre o app
- **Footer com CTA final**: Ultimo incentivo para cadastro

### 2. Atualizar `src/pages/public/SignupPage.tsx`

- Ler o query param `?plano=pro` da URL
- Pre-selecionar o plano correspondente no step 2 do wizard

### 3. Rota no `src/App.tsx`

- Adicionar rota publica `/vendas` apontando para `SalesPage`

### 4. Link na tela de Login

- Adicionar link "Conheca nossos planos" na pagina de Login apontando para `/vendas`

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/public/SalesPage.tsx` | Criar - pagina de vendas publica |
| `src/pages/public/SignupPage.tsx` | Modificar - ler query param do plano |
| `src/App.tsx` | Modificar - adicionar rota `/vendas` |
| `src/pages/Login.tsx` | Modificar - adicionar link para `/vendas` |

## Detalhes tecnicos

### SalesPage.tsx

- Usa `useQuery` para buscar planos ativos de `platform_plan_config` (mesmo padrao do `usePlanConfig`)
- Nao requer autenticacao (rota publica)
- Ao clicar no botao de assinar, faz `navigate('/cadastro?plano=' + plan.plan_type)`
- Usa os mesmos labels de features do Super Admin (`FEATURE_LABELS`) para consistencia
- Layout responsivo com grid de 1 a 4 colunas

### SignupPage.tsx - Alteracao

```text
// No useEffect ou ao montar:
const searchParams = new URLSearchParams(window.location.search);
const preSelectedPlan = searchParams.get('plano');
if (preSelectedPlan) {
  setFormData(f => ({ ...f, selectedPlan: preSelectedPlan }));
}
```

### Fluxo do visitante

```text
1. Visitante acessa /vendas (via link, Google, redes sociais, etc.)
2. Ve os planos com precos e recursos (dados do Super Admin)
3. Clica em "Comecar Agora" no plano desejado
4. E redirecionado para /cadastro?plano=pro
5. O formulario ja vem com o plano pre-selecionado
6. Completa o cadastro normalmente
```

### Controle pelo Super Admin

Tudo que o Super Admin edita em "Planos e Precos" (`/superadmin/plans`) reflete automaticamente na pagina de vendas:
- Nomes, precos, limites e features
- Ativar/desativar planos (planos inativos nao aparecem na pagina de vendas)
- Ordem de exibicao (sort_order)

