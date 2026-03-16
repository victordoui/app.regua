

# Ajustar fundo do dark mode para paleta VIZZU

## Problema
O dark mode usa um cinza-azulado genérico (`222 47% 11%`) como fundo. O usuário quer que o interior das páginas use o azul VIZZU — mais saturado e com identidade de marca.

## Solução
Atualizar as variáveis CSS do dark mode em `src/index.css` para usar tons derivados do VIZZU Dark (#0F2F6B = `219 76% 24%`), criando uma escala mais rica e azulada:

### `src/index.css` — Variáveis `.dark`

| Variável | Atual | Novo (VIZZU) |
|---|---|---|
| `--background` | `222 47% 11%` | `220 70% 8%` |
| `--foreground` | (mantém) | (mantém) |
| `--card` | `222 47% 13%` | `220 65% 12%` |
| `--popover` | `222 47% 13%` | `220 65% 12%` |
| `--secondary` | `217.2 32.6% 17.5%` | `220 60% 16%` |
| `--muted` | `217.2 32.6% 17.5%` | `220 55% 18%` |
| `--accent` | `217.2 32.6% 17.5%` | `220 60% 16%` |
| `--border` | `217.2 32.6% 17.5%` | `220 50% 20%` |
| `--input` | `217.2 32.6% 17.5%` | `220 50% 20%` |

Resultado: fundo mais rico e azulado, alinhado com a identidade VIZZU, mantendo contraste adequado para leitura.

### Arquivo alterado
- `src/index.css` — variáveis do bloco `.dark`

