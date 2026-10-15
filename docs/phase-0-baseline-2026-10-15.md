# Fase 0 — baseline técnico

Data da verificação: 15 de outubro de 2026.

## Checkout e publicação

- Repositório: `victordoui/app.regua`.
- Checkout: `C:\Users\MARSHAL\OneDrive\Documentos\VIZZU-App\app.regua`.
- Branch: `main`.
- HEAD e `origin/main`: `da4993e`.
- Divergência de commits: 0 à frente e 0 atrás.
- Servidor local: `http://127.0.0.1:8080`, HTTP 200.

Alterações que já existiam e devem ser preservadas:

- `.env` local com configuração do ambiente.
- `.gitignore` local removendo a regra de `*.tsbuildinfo`.
- `supabase/.temp/`, diretório local da CLI.

Alteração desta etapa:

- `supabase/config.toml` desativa temporariamente confirmação de e-mail.

## Supabase remoto

- Projeto: `VIZZU` (`yjuqixthmwgnzkjummaf`).
- Estado: `ACTIVE_HEALTHY`.
- PostgreSQL: 17.4.1.064.
- Inventário: 57 tabelas públicas, 20 rotinas públicas e 3 buckets.
- Objetos críticos confirmados: `user_roles`, `client_profiles`,
  `platform_subscriptions` e `platform_payments`.
- Nove Edge Functions publicadas e ativas.
- Confirmação de e-mail temporariamente desativada e verificada por
  `mailer_autoconfirm=true`.

## Conta de homologação

- Conta criada pelo fluxo público e autenticada com sucesso.
- Papel: `admin`.
- Perfil: ativo.
- Plano: `trial`.
- Pagamento: `free`.
- Período: 15 a 22 de outubro de 2026.
- Onboarding abriu corretamente.

Credenciais não devem ser registradas neste documento ou no repositório.

## Qualidade de código

- TypeScript: aprovado.
- ESLint: aprovado.
- Vitest: 11 arquivos e 52 testes aprovados.
- Build Vite: aprovado.
- Avisos não bloqueantes: base Browserslist desatualizada e opção de otimização
  depreciada pelo plugin do Vite.

## Divergência de migrations

- Arquivos locais encontrados: 70.
- Versões que coincidem exatamente entre local e remoto: 4.
- Versões somente locais no relatório da CLI: 64.
- Versões somente remotas no relatório da CLI: 63.
- Dois arquivos antigos usam hífen no nome e são ignorados pela CLI.

Muitas versões locais e remotas têm diferença de poucos segundos, o que sugere
aplicações históricas feitas por ferramentas diferentes. Outras mudanças foram
executadas diretamente e não possuem a mesma versão local. O schema remoto tem
os objetos críticos e o cadastro real passou, mas o histórico ainda não é uma
base segura para `supabase db push`.

Decisão da Fase 0: não reparar, renomear nem marcar migrations como aplicadas
sem comparar o SQL/schema correspondente. A conciliação fica como bloqueio da
Fase 6 e deve usar backup, `db pull`/`db diff` e revisão manual.

## Baseline dos Advisors

Total de avisos em nível `warn`: 225.

- 88 `auth_rls_initplan` de performance.
- 63 políticas permissivas duplicadas.
- 56 objetos visíveis no GraphQL para usuários autenticados.
- 9 funções `SECURITY DEFINER` executáveis por autenticados.
- 5 objetos visíveis no GraphQL para anônimos.
- 1 função com `search_path` mutável.
- 1 proteção contra senhas vazadas desativada.
- 1 expiração de OTP longa.
- 1 versão vulnerável do PostgreSQL.

Os avisos de GraphQL não provam vazamento de linhas por si só, porque RLS ainda
se aplica. Mesmo assim, os grants e políticas precisam ser revisados na Fase 6.

## Escopo do primeiro lançamento

Incluído:

- Cadastro de negócio com trial.
- Login e recuperação de acesso.
- Onboarding, serviços, equipe, horários, clientes e agenda.
- Página pública e agendamento de clientes.
- Gestão básica de assinatura e painel do Administrador da Plataforma.

Adiado até homologação específica:

- Google OAuth.
- Confirmação de e-mail com SMTP próprio.
- WhatsApp e push como promessa comercial.
- Banimento/exclusão completa de conta.
- Métricas financeiras que ainda dependam de histórico ou dados simulados.

## Critério para avançar

A Fase 0 permite avançar porque o checkout está sincronizado, o backend está
online, o cadastro real passou e os riscos foram registrados. Ela não autoriza
publicação: bloqueio de acesso, segurança, pagamentos e migrations ainda exigem
tratamento nas próximas fases.
