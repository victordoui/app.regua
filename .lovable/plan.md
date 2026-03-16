

# Banner de Atualização — VIZZU

## O que será feito

Criar um componente `UpdateNotificationBanner` que aparece como um card flutuante (bottom-right) quando uma nova versão do app é detectada pelo Service Worker, seguindo o estilo visual da imagem de referência mas com as cores VIZZU.

## Alterações

### 1. `public/sw.js` — Detectar nova versão
- Incrementar `CACHE_NAME` para versionamento
- No evento `install`, enviar mensagem `SW_UPDATED` para os clients quando houver uma nova versão (não usar `skipWaiting` automático, esperar o usuário clicar "Atualizar")

### 2. `src/components/UpdateNotificationBanner.tsx` — Novo componente
- Card flutuante posicionado `fixed bottom-6 right-6 z-50`
- Ícone de refresh (lucide `RefreshCw`) em azul VIZZU com fundo `bg-[#4FA3FF]/10`
- Título "Nova versão disponível" em bold
- Descrição "Uma nova versão do app foi baixada. Atualize para aplicar as melhorias."
- Botão "Atualizar Agora" com gradient VIZZU (`from-[#4FA3FF] to-[#1F4FA3]`)
- Botão "Depois" como text button
- Botão X para fechar
- Animação de entrada (slide-in from bottom)
- Listener para mensagem `SW_UPDATED` do Service Worker
- Ao clicar "Atualizar Agora": chamar `registration.waiting.postMessage({type: 'SKIP_WAITING'})` e recarregar a página
- Ao clicar "Depois" ou X: esconder por esta sessão (sessionStorage)

### 3. `src/App.tsx` — Montar o banner
- Importar e renderizar `<UpdateNotificationBanner />` ao lado dos Toasters

### Layout do card (referência visual adaptada VIZZU)

```text
┌──────────────────────────────────────────┐
│  🔄  Nova versão disponível          ✕  │
│      Uma nova versão do app foi          │
│      baixada. Atualize para aplicar.     │
│                                          │
│  [ Atualizar Agora ]    Depois           │
└──────────────────────────────────────────┘
```

