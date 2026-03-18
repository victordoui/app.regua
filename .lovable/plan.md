

# Aplicar fonte Nunito no sistema

## Resumo
Substituir Montserrat por **Nunito** nos títulos e ajustar tamanhos para refletir o estilo da referência (bold, arredondado, limpo). Open Sans continua no corpo.

## Mudanças

### 1. `index.html`
- Trocar o import do Google Fonts: substituir `Montserrat` por `Nunito` (pesos 400,500,600,700,800)

### 2. `src/index.css`
- Alterar todas as referências de `"Montserrat"` para `"Nunito"` nos seletores h1–h6
- Ajustar tamanhos dos headings para ficar mais próximo da referência:
  - h1: `text-2xl` → `text-[26px] font-bold` (mais clean, menos extrabold)
  - h2: `text-xl font-bold` (mantém)
  - Remover `letter-spacing: -0.02em` (Nunito fica melhor sem tracking negativo)

### 3. `src/components/dashboard/HeroSection.tsx`
- Ajustar o h1 para usar `text-[24px] font-bold` ao invés de `text-[22px] font-extrabold` para combinar com o estilo arredondado da Nunito

### 4. `tailwind.config.ts`
- Se `fontFamily.heading` existir, atualizar para `"Nunito"`

