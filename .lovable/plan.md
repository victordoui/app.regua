# Trocar tipografia global para Nunito Sans

Substituir a fonte global Montserrat por **Nunito Sans** em todo o ERP, com aparência arredondada e amigável (estilo Conta Azul / Ping Pong). Apenas mudança visual — nenhuma lógica, rota ou regra de negócio será alterada.

## Arquivos alterados

### 1. `index.html`
- Trocar o `<link>` do Google Fonts de `Montserrat` para `Nunito Sans` (pesos 300–900).

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### 2. `src/index.css`
- Atualizar a variável/base font-family global para:
```css
font-family: "Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
```
- Aplicar em `html, body, #root` e em qualquer regra que hoje force `Montserrat` (sidebar, topbar, headings, inputs, etc.).

### 3. `tailwind.config.ts`
- Definir `fontFamily.sans` e `fontFamily.display` apontando para `"Nunito Sans"` para que todas as classes Tailwind (`font-sans`, default) usem a nova fonte automaticamente em cards, tabelas, botões, modais, etc.

### 4. Varredura por `Montserrat` no `src/`
- Substituir ocorrências hardcoded de `font-family: 'Montserrat'` ou `font-['Montserrat']` por Nunito Sans, garantindo cobertura em componentes que não usam tokens.

## Pesos aplicados (via Tailwind / CSS existente)

A fonte suporta os pesos pedidos. Os utilitários Tailwind já existentes mapeiam diretamente:

| Uso | Peso | Classe |
|---|---|---|
| Títulos principais (h1) | 800 | `font-extrabold` |
| Títulos de seção / cards (h2/h3) | 700 | `font-bold` |
| Menus / labels pequenas | 600 | `font-semibold` |
| Botões | 700 | `font-bold` |
| Texto normal | 400/500 | `font-normal` / `font-medium` |
| Números de KPI nos cards | 800/900 | `font-extrabold` / `font-black` |

Os componentes já usam essas classes — apenas a família de fonte muda, então o peso pedido é respeitado sem refactor de componentes.

## Fora de escopo
- Nenhuma alteração em lógica, hooks, rotas, RLS, dados ou componentes funcionais.
- Memória de projeto (`mem://index.md` / `mem://style/typography`) será atualizada depois da aprovação para refletir Nunito Sans como nova fonte oficial.
