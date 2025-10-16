# 💈 Na Régua - Sistema de Gestão de Barbearia

## 🚀 Visão Geral do Projeto

Este é o sistema de gestão e agendamento online para a barbearia "Na Régua". O projeto é um MVP (Minimum Viable Product) de um SaaS focado em oferecer uma experiência premium tanto para o cliente final (agendamento online) quanto para a administração (dashboard, clientes, serviços e gestão de barbeiros).

## 🛠️ Stack Tecnológica

O projeto foi construído com uma stack moderna e eficiente:

*   **Frontend:** React com TypeScript.
*   **Estilização:** Tailwind CSS para design responsivo e utilitário.
*   **Componentes UI:** shadcn/ui para componentes acessíveis e elegantes.
*   **Roteamento:** React Router DOM.
*   **Backend/Database/Auth:** Supabase (PostgreSQL, Autenticação e Edge Functions).
*   **Gerenciamento de Estado do Servidor:** TanStack Query (React Query).
*   **Animações:** Framer Motion.
*   **Notificações:** Sonner (Toasts).

## ⚙️ Configuração e Desenvolvimento Local

Para rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

*   Node.js (versão 18+)
*   npm ou bun/yarn

### Instalação

1.  **Clone o repositório:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    # ou bun install / yarn install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Certifique-se de que seu arquivo `.env` ou `.env.local` contenha as chaves do Supabase.

    ```env
    VITE_SUPABASE_URL="https://yjuqixthmwgnzkjummaf.supabase.co"
    VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdXFpeHRobXdnbnpranVtbWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTQ5MDgsImV4cCI6MjA2OTAzMDkwOH0.CuNBxDncwowvg4JoRNIhwIReLIKDsuwoHaUAcRI2yTM"
    ```

4.  **Inicie o Servidor de Desenvolvimento:**
    ```sh
    npm run dev
    ```
    O aplicativo estará acessível em `http://localhost:8080`.

## 📝 Como Editar o Código

Existem várias maneiras de contribuir para este projeto:

1.  **Usando Lovable (Recomendado):**
    Simplesmente visite o [Projeto Lovable](https://lovable.dev/projects/60cb5668-efc4-4511-b506-a1780707aa04) e comece a solicitar alterações via chat. As alterações são commitadas automaticamente.

2.  **IDE Local:**
    Clone o repositório e use seu IDE preferido. As alterações enviadas (pushed) serão refletidas no Lovable.

3.  **GitHub Codespaces:**
    Utilize o ambiente de desenvolvimento em nuvem do GitHub para edições rápidas.

## ☁️ Deploy e Publicação

O deploy é gerenciado pela plataforma Lovable.

*   **Publicar:** Para publicar a versão mais recente, acesse o [Projeto Lovable](https://lovable.dev/projects/60cb5668-efc4-4511-b506-a1780707aa04) e clique em `Compartilhar -> Publicar`.
*   **Domínio Personalizado:** Você pode conectar um domínio personalizado através das configurações do projeto no Lovable.