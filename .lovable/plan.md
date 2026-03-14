

# Logo Dinâmica: Azul (Light) / Branca (Dark)

Copiar as duas logos para `src/assets/` e `public/`, depois atualizar os 4 componentes que usam a logo para selecionar a variante correta com base no tema (`next-themes`).

## Arquivos novos
- `src/assets/logo-vizzu-blue.png` (Azul.png)
- `src/assets/logo-vizzu-white.png` (Branca.png)
- `public/logo-vizzu.png` (mantém a azul como padrão para favicon/PWA)

## Arquivos editados (4)

### 1. `src/components/Sidebar.tsx`
- Importar ambas logos + `useTheme` de `next-themes`
- Selecionar logo com base em `resolvedTheme`

### 2. `src/pages/Login.tsx`
- Mesma lógica: tema escuro → logo branca, tema claro → logo azul

### 3. `src/pages/public/SalesPage.tsx`
- Mesma lógica de troca por tema

### 4. `src/pages/public/SignupPage.tsx`
- Mesma lógica de troca por tema

### Padrão em cada componente
```typescript
import logoVizzuBlue from "@/assets/logo-vizzu-blue.png";
import logoVizzuWhite from "@/assets/logo-vizzu-white.png";
import { useTheme } from "next-themes";

// dentro do componente:
const { resolvedTheme } = useTheme();
const logoVizzu = resolvedTheme === "dark" ? logoVizzuWhite : logoVizzuBlue;
```

O favicon e PWA icon mantêm a versão azul (padrão do sistema).

