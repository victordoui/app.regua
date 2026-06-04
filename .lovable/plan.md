## Objetivo

Deixar a sidebar do VIZZU visualmente idêntica à referência enviada (UNIG): categorias expansíveis, sub-itens indentados com ícones, item ativo destacado em azul mais claro, badges vermelhos, avatar no rodapé. Trocar o fundo navy atual pelo **azul padrão do VIZZU** (paleta `--primary` / `#2563EB` e variantes), e exibir a **logo original (colorida)** com um **contorno branco** ao redor.

## Mudanças

### 1. `src/index.css` — tokens da sidebar
Substituir o navy atual pelos azuis VIZZU, mantendo bom contraste para texto branco:

- `--sidebar-background: 224 72% 22%`  (azul VIZZU escuro, derivado do `--primary-800/900`)
- `--sidebar-foreground: 0 0% 100%`
- `--sidebar-muted: 214 60% 80%`
- `--sidebar-accent: 217 91% 45%`  (highlight do item ativo, tom do `--primary` mais saturado)
- `--sidebar-accent-foreground: 0 0% 100%`
- `--sidebar-border: 224 60% 30%`  (separador sutil entre seções)

Aplicar os mesmos valores também no bloco `.dark`.

### 2. `src/components/Sidebar.tsx`

**Logo (topo)**
- Remover `brightness-0 invert` da `<img>`.
- Manter logo nas cores originais e adicionar **moldura branca**: container redondo/quadrado com `border-2 border-white` + leve padding e `bg-white/5` para destacar sobre o azul.

**Categorias e itens (alinhar à referência)**
- Espaçamento entre seções com `border-t border-sidebar-border/70`.
- Categoria: ícone + label + chevron à direita (já existe), peso 700, cor branca quando ativa/hover.
- Sub-item ativo: fundo `bg-sidebar-accent` ocupando toda a largura, texto branco bold, leve `rounded-md`.
- Sub-item normal: texto branco a 75% de opacidade, hover com `bg-white/8`.
- Badges vermelhos (ex.: Pendências "8"): trocar laranja por `bg-red-500 text-white` para casar com a referência.
- Indentação dos sub-itens em `pl-9` (mantém).

**Rodapé / Perfil**
- Mantém o `DropdownMenu` clicável já implementado (Meu Perfil, Minha Empresa, Upgrade, Tema, Sair).
- Avatar com borda branca sutil (`ring-1 ring-white/20`).
- Botão "Fazer Upgrade" permanece acima.

### 3. Sem mudanças de lógica
- Rotas, permissões (`useRole`), `signOut`, estrutura do menu e itens visíveis por papel permanecem **idênticos**.
- Apenas presentation/CSS + ajustes de classes.

## Fora do escopo
- Topbar, MobileBottomNav, SuperAdminSidebar, qualquer outra página.
- Mudança de fontes, layout geral ou regras de negócio.
