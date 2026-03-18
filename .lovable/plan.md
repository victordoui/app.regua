

# Problema: Preview mostra versão antiga (cache do Service Worker)

## Diagnóstico

O projeto tem **dois service workers conflitantes**:

1. **`public/sw.js`** — SW manual registrado em `usePushNotifications.ts` via `navigator.serviceWorker.register('/sw.js')`. Este SW **não faz `skipWaiting()`** automaticamente no install — ele espera o usuário clicar "Atualizar".

2. **VitePWA** no `vite.config.ts` com `registerType: 'autoUpdate'` — gera um SW automático do Workbox que cacheia todos os assets (`**/*.{js,css,html,ico,png,svg,woff,woff2}`). Este deveria fazer auto-update, mas o SW manual (`/sw.js`) pode estar interferindo.

O problema: o Workbox SW cacheia agressivamente todos os JS/CSS/HTML. Quando você faz deploy de uma nova versão, o SW antigo continua servindo os assets cacheados até que o novo SW seja ativado. Como o `sw.js` manual não faz `skipWaiting()` automaticamente, a versão antiga fica "presa" no cache.

## Solução

### 1. `public/sw.js` — Adicionar `skipWaiting()` automático no install
Remover a abordagem de "esperar o usuário clicar" e fazer `self.skipWaiting()` + `self.clients.claim()` automaticamente. Isso garante que qualquer nova versão do SW tome controle imediato.

### 2. `vite.config.ts` — Ajustar Workbox para não cachear HTML
Configurar `navigateFallback` e adicionar `cleanupOutdatedCaches: true` para limpar caches antigos. Também excluir `index.html` do cache agressivo para que o navegador sempre busque a versão mais recente.

### 3. `src/components/UpdateNotificationBanner.tsx` — Simplificar
Como o SW agora fará `skipWaiting()` automático, o banner pode ser simplificado ou removido. Vou mantê-lo mas configurar para auto-atualizar sem precisar de interação do usuário.

### 4. `src/hooks/usePushNotifications.ts` — Evitar conflito de registro
Verificar se já existe um SW registrado antes de registrar `/sw.js`, para não sobrescrever o SW do Workbox.

## Arquivos a editar (4)

1. **`public/sw.js`** — `skipWaiting()` automático + `clients.claim()` no activate
2. **`vite.config.ts`** — `cleanupOutdatedCaches: true`, `skipWaiting: true`, `clientsClaim: true` no workbox config
3. **`src/components/UpdateNotificationBanner.tsx`** — Fazer auto-reload quando detectar update (sem esperar clique)
4. **`src/hooks/usePushNotifications.ts`** — Não re-registrar `/sw.js` se já existe SW ativo do Workbox

