

# Adicionar Ícone VIZZU (Calendário + Check) ao Sistema

Copiar a imagem enviada para `public/favicon.ico` (e `public/logo-vizzu.png`) como favicon/PWA icon, e para `src/assets/vizzu-icon.png` para uso em componentes React.

## Arquivos

### 1. Copiar asset
- `user-uploads://ChatGPT_Image_13_de_mar._de_2026_21_57_07_1_1.png` → `public/logo-vizzu.png` (favicon + PWA)
- Mesmo arquivo → `src/assets/vizzu-icon.png` (uso em componentes)

### 2. `index.html`
- Favicon já aponta para `/logo-vizzu.png` — será atualizado automaticamente
- Apple touch icon idem

### 3. `public/manifest.webmanifest`
- Já referencia `/logo-vizzu.png` — atualizado automaticamente

### 4. `src/components/Sidebar.tsx`
- Adicionar o ícone ao lado da logo textual VIZZU no header da sidebar

### 5. `src/pages/Login.tsx`
- Adicionar o ícone acima/ao lado da logo VIZZU na tela de login

### 6. `src/pages/public/SalesPage.tsx`
- Adicionar o ícone no header da landing page

### 7. `src/components/Layout.tsx`
- Adicionar o ícone no header principal do sistema (ao lado do texto "VIZZU")

O ícone será usado como complemento visual junto à logo textual (azul/branca), não como substituição.

