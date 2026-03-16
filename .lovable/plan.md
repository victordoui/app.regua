

# Títulos das páginas na cor VIZZU

## Problema
Os títulos (h1) das páginas usam `text-foreground` ou `tracking-tight` (que herda foreground), resultando em cor quase preta. O usuário quer que usem a cor azul da paleta VIZZU.

## Solução

Abordagem global via CSS ao invés de editar 49+ arquivos individualmente.

### `src/index.css` — Regra base para h1
Adicionar no `@layer base` uma regra que aplica `color: hsl(var(--primary))` em todos os `h1`:

```css
h1 {
  color: hsl(var(--primary));
}
```

Isso aplica automaticamente a cor primária VIZZU (#1F4FA3 no light, variante adequada no dark) em todos os títulos de página sem necessidade de alterar cada arquivo individualmente.

### Arquivo alterado
- `src/index.css` — 1 linha adicionada no `@layer base`

