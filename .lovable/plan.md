

# Migração Na Régua → VIZZU

Plano completo de rebranding e generalização do sistema. A mudança afeta ~16 arquivos para o nome e ~93 arquivos para termos de barbearia. Vou dividir em etapas implementáveis.

---

## Etapa 1: Rebranding Visual (Nome + Ícone + Manifesto)

Trocar "Na Régua" → "VIZZU" e `Scissors` → `Sparkles` (ou `Zap`) como ícone principal nos seguintes arquivos:

| Arquivo | Mudança |
|---|---|
| `src/components/Sidebar.tsx` | Nome "VIZZU", ícone, iniciais "VZ" |
| `src/components/Layout.tsx` | Header "VIZZU" |
| `src/pages/Login.tsx` | Logo + título "VIZZU" |
| `src/pages/public/SignupPage.tsx` | Logo + texto "gerenciar seu negócio" |
| `src/pages/public/SalesPage.tsx` | Toda a landing page: nome, slogan, textos universais, seção "Para quem é" |
| `src/pages/Settings.tsx` | Label "Nome do Negócio" |
| `src/components/onboarding/OnboardingWelcome.tsx` | "Bem-vindo ao VIZZU", "configurar seu negócio" |
| `src/components/onboarding/OnboardingStepCompany.tsx` | "Nome do Negócio" |
| `src/components/onboarding/OnboardingStepBarbers.tsx` | "Profissionais" |
| `src/pages/AdvancedNotifications.tsx` | Templates com "VIZZU" |
| `src/hooks/usePushNotifications.ts` | Texto da notificação |
| `src/components/booking/CalendarExport.tsx` | PRODID |
| `src/components/client/WhatsAppButton.tsx` | "o negócio" |
| `vite.config.ts` | PWA manifest |
| `public/manifest.webmanifest` | name, description |
| `index.html` | title, meta tags |

## Etapa 2: Generalização de Termos

Substituições globais nos ~93 arquivos:

| Antes | Depois |
|---|---|
| Barbeiro(s) | Profissional(is) |
| Barbearia | Negócio / Estabelecimento |
| Corte | Serviço |
| `Scissors` icon (decorativo) | `Briefcase` ou `Calendar` |

**No banco de dados**: manter `barbeiro` como valor do enum `app_role`. Apenas na **interface** exibir "Profissional" (já feito parcialmente no `getRoleLabel()`).

Arquivos-chave para termos:
- `src/components/Sidebar.tsx` — label "Barbeiros" → "Profissionais"
- `src/components/appointments/AppointmentCard.tsx` — "Barbeiro Não Atribuído" → "Profissional Não Atribuído"
- `src/components/onboarding/*` — labels e descrições
- `src/pages/BarberManagement.tsx` — título da página
- `src/pages/BarberDashboard.tsx` — título
- `src/components/dashboard/*` — labels em gráficos e cards
- `src/pages/client/*` — textos do app do cliente

## Etapa 3: Renomear Módulos na Sidebar

| Atual | Novo |
|---|---|
| Agendamentos | VIZZU Agenda |
| Clientes | VIZZU Clientes |
| Barbeiros | VIZZU Profissionais |
| Serviços | VIZZU Serviços |
| Relatórios | VIZZU Insights |
| Fidelidade & Indicações | VIZZU Rewards |
| Contas a Pagar/Receber + Comissões + Caixa | VIZZU Pay (agrupados) |

## Etapa 4: Landing Page (SalesPage.tsx)

Reescrever completamente:
- Título: "VIZZU — Visualize. Organize. Cresça."
- Subtítulo: "Gestão inteligente de agendamentos para profissionais de serviços."
- Seção "Para quem é": barbearias, salões, manicures, estética, tatuadores, personal trainers, pet shops, dentistas
- Ícones universais: Calendar, BarChart3, Heart, Users
- FAQ atualizado com nome VIZZU
- Footer: "© 2025 VIZZU"

## Etapa 5: Ícones Universais

| Contexto | Antes | Depois |
|---|---|---|
| Logo/Brand | `Scissors` | `Zap` |
| Profissionais | `Scissors` | `Users` |
| Agenda | `Calendar` | `Calendar` (mantém) |
| Financeiro | `DollarSign` | `DollarSign` (mantém) |
| Relatórios | `BarChart3` | `BarChart3` (mantém) |

## Nota sobre banco de dados

- **Não há migration necessária** — o enum `app_role` mantém `barbeiro` internamente
- Tabela `barbershop_settings` mantém o nome (refatorar DB é risco desnecessário agora)
- Toda mudança é puramente de interface/frontend

## Ordem de implementação

Serão ~16 arquivos principais editados. Farei em uma única passada, começando pelos arquivos de configuração (vite, manifest, index.html), depois componentes core (Sidebar, Layout, Login), depois páginas secundárias.

