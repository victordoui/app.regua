

# Plano: Mobile bottom nav, scrollbar sutil, Minha Empresa sem sub-abas aninhadas, splash screen

Este plano cobre 4 frentes solicitadas. Vou detalhar cada uma.

---

## 1. Mobile: Bottom navigation bar com 5 botões (admin)

Atualmente no mobile, o `Layout.tsx` mostra a sidebar com toggle hamburger. No mobile, vamos esconder a sidebar e o topbar, e mostrar uma bottom navigation bar fixa com 5 ícones principais.

### Alterações

**`src/components/Layout.tsx`**
- Importar `useIsMobile` de `@/hooks/use-mobile`
- Se mobile: renderizar um layout sem Sidebar/Topbar, com bottom nav de 5 botões
- Botões: Painel (`/`), Agenda (`/appointments`), Clientes (`/clients`), Empresa (`/settings/company`), Mais (abre sheet/drawer com demais opções)
- Estilo: fundo branco, ícones na cor `primary` quando ativo, `muted-foreground` quando inativo, labels em `text-[10px]`
- Padding bottom no main para não sobrepor o nav

**`src/components/Sidebar.tsx`**
- No mobile, não renderizar nada (o Layout cuida)

**`src/components/Topbar.tsx`**
- No mobile, simplificar para apenas logo + avatar (sem search bar)

### Paleta de cores
- Ativo: `text-primary` (azul VIZZU #2563EB)
- Inativo: `text-muted-foreground`
- Background: `bg-background` (branco)
- Border top: `border-border`

---

## 2. Scrollbar da sidebar mais sutil

### Alterações em `src/index.css`
- Reduzir a scrollbar da sidebar para quase invisível:
  - `scrollbar-width: none` por padrão (Firefox)
  - `::-webkit-scrollbar { width: 2px }` 
  - Thumb com opacidade muito baixa, aparece apenas no hover do container
- Criar classe `scrollbar-hidden-hover`: scrollbar invisível, aparece só no hover da sidebar

### Alteração em `src/components/Sidebar.tsx`
- Trocar `scrollbar-modern` por nova classe `scrollbar-hidden-hover`

---

## 3. Minha Empresa — eliminar sub-abas aninhadas

Atualmente: 3 abas top-level (Empresa, Estoque, Galeria) e dentro de "Empresa" mais 3 sub-abas (Dados, Visual, Link). Isso cria sub-abas de sub-abas.

### Solução: Nivelar tudo em abas únicas
**`src/pages/CompanySettings.tsx`**
- Remover o nível interno de tabs (Dados/Visual/Link)
- Criar 5 abas no nível principal: **Dados**, **Visual**, **Link**, **Estoque**, **Galeria**
- Cada aba mostra seu conteúdo diretamente, sem aninhamento
- Manter o `PageHeader` e o botão Salvar no topo (visível nas abas Dados/Visual/Link)

```text
Antes:                          Depois:
[Empresa] [Estoque] [Galeria]   [Dados] [Visual] [Link] [Estoque] [Galeria]
   └─ [Dados] [Visual] [Link]
```

---

## 4. Splash/Loading screen com logo VIZZU no mobile

### Novo componente: `src/components/MobileSplashScreen.tsx`
- Tela cheia com fundo primário ou branco
- Logo VIZZU (mesma `vizzu-logo.png` da sidebar) centralizada
- Animação fade-in/fade-out de ~1.5s
- Aparece apenas em dispositivos mobile na primeira carga

### Integração em `src/App.tsx` ou `src/components/Layout.tsx`
- Mostrar splash por 1.5s na montagem inicial se `isMobile`

---

## 5. Logo no manifest (ícone do app)

### `public/manifest.webmanifest`
- Atualizar os ícones para usar o logo VIZZU (`vizzu-icon.png` ou gerar versões 192x192 e 512x512)
- Garantir que `src/assets/vizzu-icon.png` seja copiado para `public/` com os tamanhos corretos

---

## Resumo de arquivos alterados
1. `src/components/Layout.tsx` — layout responsivo com bottom nav mobile
2. `src/components/Sidebar.tsx` — esconder no mobile, trocar classe scrollbar
3. `src/components/Topbar.tsx` — simplificar no mobile
4. `src/index.css` — nova classe scrollbar ultra-sutil
5. `src/pages/CompanySettings.tsx` — nivelar abas (5 abas flat)
6. `src/components/MobileSplashScreen.tsx` — novo componente splash
7. `public/manifest.webmanifest` — atualizar ícones

