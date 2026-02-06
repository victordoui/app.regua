
# Plano: Tratamento de Erros no Cadastro + Mascara de Telefone e Validacao de Inputs Global

## Objetivo

1. Melhorar o tratamento de erros na SignupPage com mensagens amigaveis para diferentes cenarios de falha
2. Aplicar mascara de telefone padrao `(00)0000-0000` em todos os campos de telefone do sistema
3. Restringir campos de nome para aceitar somente letras e campos numericos para aceitar somente numeros

---

## 1. Utilitarios centralizados em `src/lib/utils.ts`

Atualizar a funcao `formatPhoneBR` para usar o formato fixo `(00)0000-0000` (sem espaco, 8 digitos apos o DDD):

```text
(00)0000-0000
- Somente numeros aceitos na digitacao
- Mascara aplicada automaticamente
- Max 10 digitos
```

Adicionar funcao utilitaria `formatNameOnly(value)` que remove qualquer caractere que nao seja letra ou espaco.

Atualizar o schema `guestContactSchema` para refletir o novo formato de telefone.

## 2. Tratamento de erros na `SignupPage.tsx`

Melhorar o bloco catch do `handleSignup` para mapear erros comuns:

| Erro | Mensagem amigavel |
|------|-------------------|
| `already registered` | Este email ja esta cadastrado. Tente fazer login. |
| `invalid email` | O email informado nao e valido. |
| `Password should be at least 6` | A senha deve ter pelo menos 6 caracteres. |
| `42P10` ou `ON CONFLICT` | Erro de configuracao interna. Contate o suporte. |
| `rate limit` | Muitas tentativas. Aguarde alguns minutos. |
| Erro generico | Ocorreu um erro inesperado. Tente novamente. |

Adicionar validacao nos campos:
- **Nome completo**: aceitar somente letras (a-zA-Z com acentos) e espacos
- **Telefone**: aplicar mascara `(00)0000-0000`, aceitar somente numeros
- **Nome da barbearia**: aceitar letras, numeros e caracteres basicos

## 3. Aplicar mascara de telefone em todos os formularios

Arquivos que possuem campos de telefone sem mascara e precisam ser atualizados:

| Arquivo | Campo |
|---------|-------|
| `src/pages/public/SignupPage.tsx` | phone |
| `src/pages/Settings.tsx` | phone, userPhone |
| `src/pages/Clients.tsx` | phone |
| `src/pages/CompanySettings.tsx` | phone |
| `src/pages/public/PublicProfile.tsx` | phone |
| `src/pages/BarberManagement.tsx` | phone |
| `src/pages/client/ClientProfile.tsx` | phone |
| `src/pages/Waitlist.tsx` | client_phone |
| `src/components/onboarding/OnboardingStepCompany.tsx` | phone |
| `src/components/onboarding/OnboardingStepBarbers.tsx` | phone |

Em cada um, o onChange do campo de telefone passara a usar `formatPhoneBR(e.target.value)` e o input tera `maxLength` e `inputMode="tel"`.

## 4. Restringir campos de nome para somente letras

Nos formularios onde o campo e claramente um nome de pessoa (nao nome de servico/produto), aplicar filtro que remove caracteres nao-alfabeticos:

| Arquivo | Campo |
|---------|-------|
| `src/pages/public/SignupPage.tsx` | fullName |
| `src/pages/Clients.tsx` | name (nome do cliente) |
| `src/components/onboarding/OnboardingStepBarbers.tsx` | name (nome do barbeiro) |
| `src/pages/Waitlist.tsx` | client_name |
| `src/components/booking/StepConfirmation.tsx` | clientName |
| `src/components/booking/public/StepConfirmation.tsx` | clientName |

---

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `src/lib/utils.ts` | Modificar - atualizar formatPhoneBR, adicionar formatNameOnly, atualizar schema |
| `src/pages/public/SignupPage.tsx` | Modificar - erros amigaveis + mascara telefone + filtro nome |
| `src/pages/Settings.tsx` | Modificar - mascara telefone |
| `src/pages/Clients.tsx` | Modificar - mascara telefone + filtro nome |
| `src/pages/CompanySettings.tsx` | Modificar - mascara telefone |
| `src/pages/public/PublicProfile.tsx` | Modificar - mascara telefone |
| `src/pages/BarberManagement.tsx` | Modificar - mascara telefone |
| `src/pages/client/ClientProfile.tsx` | Modificar - mascara telefone |
| `src/pages/Waitlist.tsx` | Modificar - mascara telefone + filtro nome |
| `src/components/onboarding/OnboardingStepCompany.tsx` | Modificar - mascara telefone |
| `src/components/onboarding/OnboardingStepBarbers.tsx` | Modificar - mascara telefone + filtro nome |
| `src/components/booking/StepConfirmation.tsx` | Modificar - filtro nome |
| `src/components/booking/public/StepConfirmation.tsx` | Modificar - filtro nome |

## Detalhes tecnicos

### formatPhoneBR atualizado

```text
Formato: (00)0000-0000
- Remove tudo que nao e digito
- Limita a 10 digitos
- Aplica mascara progressiva:
  - 1-2 digitos: (XX
  - 3-6 digitos: (XX)XXXX
  - 7-10 digitos: (XX)XXXX-XXXX
```

### formatNameOnly

```text
- Remove qualquer caractere que nao seja letra (a-zA-Z), acentos (À-ÿ) ou espaco
- Impede numeros e caracteres especiais em campos de nome de pessoa
```

### Mapeamento de erros na SignupPage

```text
Funcao getSignupErrorMessage(error):
  - Verifica error.message e error.code
  - Retorna { title, description } com mensagem amigavel em portugues
  - Cobre: email duplicado, email invalido, senha fraca, rate limit, erro RPC, erro generico
```
