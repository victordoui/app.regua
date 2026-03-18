

# Padronizar Fonte Montserrat em Todo o Sistema

## Situacao Atual
A fonte **Montserrat** ja esta configurada globalmente no CSS (`html, body { font-family: "Montserrat", sans-serif }`), e todas as paginas seguem o mesmo layout (`Layout` + `PageHeader` + `space-y-6 p-6`). Porem existem **resquicios de Open Sans** em dois locais:

## Mudancas

### 1. `src/components/dashboard/RevenueLineChart.tsx`
- Substituir todas as 6 ocorrencias de `fontFamily="Open Sans,sans-serif"` por `fontFamily="Montserrat,sans-serif"` nos elementos SVG `<text>`.

### 2. `src/components/dashboard/MonthRevenueDonut.tsx`
- Substituir 1 ocorrencia de `fontFamily="Open Sans,sans-serif"` por `fontFamily="Montserrat,sans-serif"`.

### 3. `index.html`
- Remover `Open Sans` do import do Google Fonts, mantendo apenas Montserrat (ja que nao sera mais utilizada em lugar nenhum).

### 4. `src/index.css`
- Remover referencia a `"Open Sans"` no comentario de tipografia (linha que menciona "Open Sans for body").

Total: 4 arquivos editados, mudancas pontuais de texto/fonte.

