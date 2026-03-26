

# Banner de Capa no Hero do Dashboard

## O que será feito

Transformar o `HeroSection` em um card com banner visual de fundo, similar à referência enviada. O banner usará a imagem de capa (`banner_url`) e as cores (`primary_color_hex`) que o usuário configurou em "Minha Empresa".

## Alteração: `src/components/dashboard/HeroSection.tsx`

### Visual final
- Container com `rounded-xl`, altura ~180px, `overflow-hidden`
- **Fundo**: se `settings.banner_url` existir, usa como `background-image` com `bg-cover bg-center`; senão, usa gradiente com `primary_color_hex`
- **Overlay** escuro semitransparente (`bg-black/40`) para legibilidade do texto
- **Logo** do estabelecimento (`settings.logo_url`) à esquerda, circular, ~80px
- **Texto** branco sobre o overlay: saudação "Olá, {companyName}" + subtítulo
- **Botões** (Filtros e Novo Agendamento) reposicionados no canto superior direito sobre o banner
- Decoração sutil: ícone de barbearia/serviço no canto direito com opacidade baixa (como na referência)

### Dados utilizados (já disponíveis no hook)
- `settings.banner_url` — imagem de capa
- `settings.logo_url` — logo circular
- `settings.primary_color_hex` — cor de fallback do gradiente
- `settings.company_name` — nome do negócio

1 arquivo alterado, ~40 linhas reescritas.

