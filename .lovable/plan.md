

# Redesign da Tela de Login com cores VIZZU

## Visão Geral

Redesenhar completamente a tela de login com layout moderno SaaS, utilizando as cores da marca VIZZU e um design split-screen (painel esquerdo com branding + painel direito com formulário).

## Paleta de Cores VIZZU (em HSL para o CSS)

- Primary: #1F4FA3 → `221 68% 38%`
- Secondary: #2E6FD3 → `216 64% 50%`
- Accent: #4FA3FF → `213 100% 65%`
- Dark: #0F2F6B → `219 76% 24%`

## Alterações

### 1. `src/index.css` — Atualizar variáveis CSS
Trocar os valores de `--primary`, `--secondary`, `--accent` e escalas para refletir a nova paleta VIZZU em ambos os temas (light e dark).

### 2. `src/pages/Login.tsx` — Redesign completo
Novo layout:
- **Split-screen** em desktop: painel esquerdo (gradient branding) + painel direito (formulário branco)
- **Mobile**: painel de branding collapsa, formulário full-width com gradient no topo
- Painel esquerdo: gradient `135deg, #4FA3FF → #1F4FA3 → #0F2F6B`, logo VIZZU grande, tagline, decorações geométricas sutis
- Painel direito: fundo branco, card com cantos arredondados, soft shadows, inputs limpos
- Botões de acesso rápido com estilo mais clean usando as novas cores
- Remover ThemeToggle (a tela de login terá estilo fixo)
- Tabs com estilo pill/segmented moderno
- Botão principal com gradient `#4FA3FF → #1F4FA3`

### Estrutura do Layout

```text
┌──────────────────┬──────────────────┐
│                  │                  │
│   GRADIENT BG    │   WHITE PANEL    │
│                  │                  │
│   [VIZZU Icon]   │   [Tabs]         │
│   Tagline        │   [Form Fields]  │
│   Decorations    │   [Submit Btn]   │
│                  │   [Quick Login]  │
│                  │                  │
└──────────────────┴──────────────────┘
```

### Detalhes Técnicos
- Inline styles para o gradient (Tailwind arbitrary não suporta multi-stop complexo)
- Manter toda a lógica de formulários, validação e handlers intacta
- Inputs com `border-[#1F4FA3]/20`, focus `ring-[#1F4FA3]`
- Quick login buttons com `border-[#2E6FD3]` e hover `bg-[#1F4FA3]`

