

# Aplicar Montserrat como fonte única no sistema

## Resumo
Trocar a fonte do corpo (atualmente Open Sans) para **Montserrat** em todo o sistema, mantendo os pesos já definidos.

## Mudança

### `src/index.css`
- Alterar a regra `html, body` de `font-family: "Open Sans", sans-serif` para `font-family: "Montserrat", sans-serif`

Uma única linha alterada. Todos os elementos herdam automaticamente, e os títulos já usam Montserrat.

