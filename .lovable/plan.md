

# Reorganizar Logo na Tela de Login

Alterar o header da tela de login (linhas 201-213) para exibir o ícone grande centralizado acima, com o nome "VIZZU" abaixo.

## Alteração em `src/pages/Login.tsx`

**Antes** (linhas 201-213): ícone pequeno (w-12 h-12) ao lado do texto "VIZZU" em linha horizontal.

**Depois**: Layout vertical — ícone grande (w-28 h-28) centralizado, com "VIZZU" abaixo em texto grande.

```tsx
<div className="text-center mb-8">
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
    className="flex flex-col items-center justify-center gap-3 mb-2"
  >
    <div className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
      <img src={vizzuIcon} alt="VIZZU" className="w-full h-full object-cover" />
    </div>
    <h1 className="text-4xl font-bold text-foreground">VIZZU</h1>
  </motion.div>
</div>
```

Único arquivo alterado: `src/pages/Login.tsx` (linhas 201-213).

