

# Atualizar Logo e Texto na Tela de Login

## Alterações em `src/pages/Login.tsx`

1. **Copiar a imagem** enviada para `src/assets/vizzu-icon.png` (sobrescrever a atual)

2. **Logo grande sem corte** (linhas 208-210): Usar `object-contain` em vez de `object-cover` para não cortar a imagem. Aumentar o container para `w-36 h-36` e remover `overflow-hidden` / `rounded-2xl` para exibir a imagem completa.

3. **Trocar "Bem-vindo de Volta" por "VIZZU"** (linhas 218-222): Substituir o texto e remover o ícone Crown do CardHeader.

4. **Remover o texto "VIZZU" duplicado** da área acima (linha 211), já que ele vai para o CardHeader.

### Resultado visual
```
   [Logo grande, sem corte]
   ┌─────────────────────┐
   │       VIZZU          │  ← era "Bem-vindo de Volta"
   │  [email field]       │
   │  [password field]    │
   │  [Entrar]            │
   └─────────────────────┘
```

