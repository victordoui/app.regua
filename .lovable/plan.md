

# Aplicar fontes Montserrat e Open Sans na tela de Login

## Mudanças em `src/pages/Login.tsx`

### Títulos → `font-family: 'Montserrat'`
- **L137** `h1` "VIZZU" (painel esquerdo): adicionar `style={{ fontFamily: 'Montserrat' }}` ou classe `font-[Montserrat]`
- **L165** `h1` "VIZZU" (mobile header): idem
- **L178** `h2` "Bem-vindo de volta" / "Crie sua conta": idem
- Peso já é `font-bold` (700) — consistente com o padrão

### Textos de corpo → `font-family: 'Open Sans'`
- **L138** `p` slogan "Visualize. Organize. Cresça."
- **L166** `p` slogan mobile
- **L181** `p` subtítulo "Acesse sua conta..."
- **L226, L247, L345, L362, L383** — `FormLabel` (labels dos campos)
- **L152** textos das features no painel esquerdo
- **L190, L200** texto dos pill tabs ("Entrar" / "Cadastrar")
- **L273** texto do botão "Entrar no Sistema"
- **L299** texto "Acesso rápido"
- **L306-324** textos dos botões de quick login

### Abordagem
Aplicar classes inline `font-['Montserrat']` nos h1/h2 e `font-['Open_Sans']` nos textos de corpo, ou alternativamente criar classes utilitárias no CSS global. Como as fontes já estão carregadas no `index.html`, basta referenciar via Tailwind.

