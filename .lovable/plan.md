

# Plano: Alinhar sidebar, topbar e corpo ao padrão da referência

---

## 1. Sidebar (`src/components/Sidebar.tsx`)

- Fundo: trocar `bg-card` por `bg-[#F8FAFC]` (cinza azulado sutil)
- Logo: reduzir para `h-10 w-10` e adicionar texto "VIZZU" ao lado em `font-bold text-lg text-foreground`
- Category labels: cor `text-[#94A3B8]` em vez de `text-primary/60`
- Items: aumentar padding para `py-3` (mais espaçoso como na ref)
- Item ativo: manter `bg-primary text-primary-foreground rounded-lg` (já correto)

## 2. Topbar (`src/components/Topbar.tsx`)

- Remover barra de busca e o listener `Cmd+K`
- Lado esquerdo: título dinâmico da página + subtítulo descritivo (recebidos via prop ou derivados da rota)
- Lado direito: manter data, notificações e avatar (já existente)
- Aceitar props `title` e `subtitle` opcionais; derivar defaults do `useLocation().pathname`

## 3. Layout (`src/components/Layout.tsx`)

- Passar título/subtítulo para o `Topbar` com base na rota atual (mapa de rotas para títulos)
- Main content: adicionar `max-w-[1400px] mx-auto` e padding `px-8 py-6`

## 4. KpiStrip (`src/components/dashboard/KpiStrip.tsx`)

- Trocar borda superior (`before:top-0 before:h-[3px]`) por borda lateral esquerda (`before:left-0 before:w-[3px] before:h-full`)
- Mover ícone para o canto superior direito do card
- Adicionar link "Clique para ver detalhes →" no rodapé de cada card
- Manter variação percentual e subtexto

## 5. Mapa de títulos por rota

Tabela de referência para o Topbar:

| Rota | Título | Subtítulo |
|------|--------|-----------|
| `/` | Dashboard Analítico | Visão geral de performance e métricas do sistema |
| `/appointments` | Agenda | Gerencie seus agendamentos |
| `/clients` | Clientes | Base de clientes do seu negócio |
| `/settings/company` | Minha Empresa | Configure seu estabelecimento |
| `/services` | Serviços | Catálogo de serviços oferecidos |
| `/reports` | Insights | Relatórios e análises financeiras |
| (default) | VIZZU | Painel de gestão |

---

## Arquivos alterados
1. `src/components/Sidebar.tsx` — fundo, logo inline, espaçamento, cores
2. `src/components/Topbar.tsx` — remover busca, adicionar título/subtítulo dinâmico
3. `src/components/Layout.tsx` — max-width no main, passar títulos ao Topbar
4. `src/components/dashboard/KpiStrip.tsx` — borda lateral, ícone no canto, link rodapé

