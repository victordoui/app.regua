# VIZZU

Plataforma SaaS de gestão, organização e agendamento para negócios de serviços,
incluindo salões, barbearias, clínicas, estética, tatuagem, pet care e operações
semelhantes.

## Stack

- React, TypeScript e Vite
- Tailwind CSS e shadcn/ui
- React Router e TanStack Query
- Supabase: PostgreSQL, Auth, Storage e Edge Functions
- Stripe para assinaturas

## Desenvolvimento local

Requisitos: Node.js 18 ou superior e npm.

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 8080
```

O frontend fica disponível em `http://127.0.0.1:8080`.

Crie um `.env` local, nunca versionado, com:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-ref"
VITE_SUPABASE_URL="https://seu-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publicavel"
```

Nunca registre no repositório chaves secretas, `service_role`, credenciais SMTP
ou segredos do Stripe.

## Verificação técnica

```sh
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Lançamento

- [Plano por fases](./docs/launch-plan-2026-10-15.md)
- [Baseline da Fase 0](./docs/phase-0-baseline-2026-10-15.md)
- [Checklist de lançamento](./docs/release-readiness.md)
- [Runbook de produção](./docs/production-runbook.md)

Não execute `supabase db push` enquanto a divergência histórica de migrations
descrita no baseline não estiver conciliada.
