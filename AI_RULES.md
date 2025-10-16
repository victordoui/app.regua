# Regras de Desenvolvimento e Stack Tecnológica (AI Rules)

Este documento resume a stack tecnológica do projeto e estabelece regras claras para o uso de bibliotecas e padrões de código, visando a consistência e a manutenibilidade.

## 1. Stack Tecnológica

O projeto é construído com as seguintes tecnologias principais:

*   **Frontend Framework:** React (com TypeScript).
*   **Build Tool:** Vite.
*   **Linguagem:** TypeScript (obrigatório para todos os arquivos de código).
*   **Estilização:** Tailwind CSS (obrigatório para todo o design e layout).
*   **Componentes UI:** shadcn/ui (biblioteca de componentes primária).
*   **Roteamento:** React Router (rotas definidas em `src/App.tsx`).
*   **Ícones:** `lucide-react`.
*   **Gerenciamento de Estado/Dados:** Supabase (Auth e Database) e React Query (`@tanstack/react-query`) para gerenciamento de estado do servidor.
*   **Animações:** `framer-motion`.
*   **Notificações:** `sonner` (para toasts).

## 2. Estrutura de Arquivos

*   **Páginas:** Devem ser colocadas em `src/pages/`.
*   **Componentes:** Devem ser colocadas em `src/components/`.
*   **Hooks:** Devem ser colocadas em `src/hooks/`.
*   **Utilitários:** Devem ser colocadas em `src/lib/` ou `src/utils/`.
*   **Integrações:** Devem ser colocadas em `src/integrations/`.
*   **Componentes Shadcn:** Os componentes de UI pré-construídos estão em `src/components/ui/` e **não devem ser editados**. Crie novos componentes fora desta pasta se precisar de customização.

## 3. Regras de Uso de Bibliotecas

| Funcionalidade | Biblioteca/Padrão | Regra de Uso |
| :--- | :--- | :--- |
| **Estilização** | Tailwind CSS | **Obrigatório** o uso de classes Tailwind para todo o estilo. Evitar CSS customizado ou inline styles. |
| **Componentes UI** | shadcn/ui | **Preferencial**. Utilize os componentes de `src/components/ui/`. Se precisar de um componente não existente, crie-o em `src/components/`. |
| **Ícones** | `lucide-react` | Use exclusivamente para todos os ícones. |
| **Roteamento** | `react-router-dom` | Use para definir rotas e navegação. Mantenha a definição de rotas centralizada em `src/App.tsx`. |
| **Data Fetching** | `@tanstack/react-query` | Use para gerenciar o estado do servidor (caching, sincronização, retries, etc.). |
| **Database/Auth** | `supabase` | Use o cliente configurado em `@/integrations/supabase/client`. |
| **Notificações** | `sonner` ou `useToast` | Use `sonner` para notificações globais (toasts) ou o `useToast` (baseado em Radix/shadcn) para feedback de formulário. |
| **Animações** | `framer-motion` | Use para animações complexas e transições de componentes. |

## 4. Padrões de Código

1.  **Componentes:** Crie um novo arquivo para cada novo componente ou hook. Mantenha os componentes pequenos e focados (idealmente < 100 linhas).
2.  **Tipagem:** Use TypeScript em todos os arquivos (`.tsx` ou `.ts`).
3.  **Responsividade:** Todos os designs devem ser responsivos (mobile-first).
4.  **Simplicidade:** Priorize soluções simples e elegantes. Evite over-engineering.