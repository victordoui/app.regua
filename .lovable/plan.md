## Objetivo

Três ajustes focados em UX da shell do app (sidebar + topbar + hero do dashboard).

---

## 1) Botão de colapsar a sidebar fixo na Topbar

**Hoje:** o botão flutua na borda direita da `Sidebar` (`-right-3 top-16`).

**Mudança:**
- Remover o botão flutuante do `src/components/Sidebar.tsx`.
- Mover o estado `collapsed` (com persistência em `localStorage` na chave `vizzu:sidebar-collapsed`) e a CSS var `--sidebar-w` para um hook compartilhado `src/hooks/useSidebarCollapsed.ts` (ou um pequeno Context em `Layout.tsx`) para que `Sidebar` e `Topbar` leiam/atualizem o mesmo valor.
- Em `src/components/Topbar.tsx`, adicionar à esquerda da barra de busca um botão discreto (ícone `PanelLeftClose` / `PanelLeftOpen`, `h-9 w-9`, estilo ghost com hover `bg-muted`) que dispara o toggle.
- Manter a transição suave (`transition-[width|margin|left]`) já existente.

## 2) Corrigir o "flash branco" ao navegar pela sidebar

**Causa provável:** cada página renderiza seu próprio fundo/skeleton inicial sem fundo base, então durante o trecho entre desmontagem da rota antiga e o primeiro paint da nova rota aparece o `body` branco — enquanto a `Sidebar` (fixed) permanece visível, dando exatamente o efeito descrito ("sidebar fica, conteúdo pisca branco").

**Mudanças (somente apresentação, sem mexer em data fetching):**
- Em `src/components/Layout.tsx`, garantir que o `<main>` tenha sempre `bg-background` (cor base do tema) para que, mesmo enquanto a rota nova ainda não pintou, o fundo seja o do tema e não branco puro.
- Em `src/App.tsx`, envolver as `Routes` em um wrapper com `min-h-full bg-background` e adicionar um fallback de `Suspense`/loading neutro (um `div` com `bg-background`) caso alguma página seja lazy — evita o gap de render.
- Confirmar `html, body, #root { background: hsl(var(--background)); }` em `src/index.css` (ajustar se estiver `white`).
- Não alterar lógica de queries; apenas garantir cor de fundo contínua entre as transições.

## 3) Botão de edição da saudação no Hero do Dashboard

**Onde:** `src/components/dashboard/HeroSection.tsx`, no card "Olá, {companyName} 👋".

**Mudanças:**
- Adicionar, no canto superior direito do hero (acima dos botões "Filtros"/"Novo Agendamento", ou ao lado do nome), um botão transparente pequeno com ícone `Pencil` (`bg-white/10 hover:bg-white/20 border border-white/20 rounded-md p-2`), tooltip "Editar saudação".
- Ao clicar, abrir um novo componente `src/components/dashboard/EditGreetingDialog.tsx` (usa `Dialog` do shadcn) com os campos:
  - **Nome de saudação** → `company_name`
  - **Subtítulo** → `slogan` (reaproveitar campo existente; o Hero passará a exibir `slogan` em vez do texto fixo "Você tem X agendamentos pendentes hoje" quando preenchido; senão mantém o fallback atual).
  - **Logo** → `logo_url` via `ImageUploadField` já existente.
  - **Imagem de capa (banner)** → `banner_url` via `ImageUploadField`.
- Salvar usando `useCompanySettings().saveSettings` (já implementado), sem migração de schema.
- Atualizar `HeroSection` para renderizar `settings?.slogan` como subtítulo quando existir.

---

## Arquivos afetados

- `src/components/Sidebar.tsx` — remover botão flutuante; consumir estado compartilhado.
- `src/components/Topbar.tsx` — adicionar botão de colapso à esquerda da busca.
- `src/hooks/useSidebarCollapsed.ts` *(novo)* — estado + localStorage + CSS var.
- `src/components/Layout.tsx` — `bg-background` no main; usar o hook.
- `src/App.tsx` — wrapper `bg-background` + Suspense fallback neutro.
- `src/index.css` — garantir `html/body/#root` com `hsl(var(--background))`.
- `src/components/dashboard/HeroSection.tsx` — botão "editar"; usar `slogan` como subtítulo.
- `src/components/dashboard/EditGreetingDialog.tsx` *(novo)* — modal de edição.

## Fora de escopo

- Adicionar coluna nova no banco (reaproveitando `slogan`).
- Mudanças de cores/tema da sidebar.
- Mexer em rotas/lógica de carregamento de dados.
