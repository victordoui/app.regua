# Auditoria de UX/UI e preparação de lançamento — 30/09/2026

> Registro histórico. A etapa posterior está em `redesign-interno-2026-10-01.md`.
> Os ajustes de Vendas e do Card compartilhado descritos aqui foram revertidos
> a pedido do usuário; o novo padrão visual é restrito às páginas internas selecionadas.

## Escopo e critérios

Evolução incremental, usando o Início como referência, sem reconstruir o sistema.
Padrão: cabeçalho com título claro, contexto e ação principal; cards de cantos
arredondados; tipografia consistente; navegação por módulos; estados vazios e
erros explícitos. O portal do cliente mantém a experiência mobile e a identidade
da empresa, sem receber a barra lateral administrativa.

Esta revisão NÃO é certificação de produção: abrir uma página não comprova
todos os formulários, autorização, integração externa, acessibilidade ou uso mobile.

## Inventário por área

| Página/área | Diagnóstico e entrega | Evidência nesta revisão |
| --- | --- | --- |
| Início | Layout e filtros preservados. Já contém indicadores, faturamento, distribuição de serviços e insights; não foram adicionados gráficos redundantes. | Navegador: conteúdo carregado. |
| Clientes, Serviços, Profissionais | Já usam PageHeader/SectionTabs. Refinamento herdado do Card compartilhado: títulos menores e remoção de hover que sugere clique em cards estáticos. | Rotas `/clients`, `/services`, `/barbers` abriram. Sem CRUD nesta revisão. |
| Minha Empresa, Usuários | Padrão existente preservado; componentes compartilhados refinados. IDs dos campos de upload agora únicos, inclusive em listas. | `/settings/company`, `/users` abriram. |
| Agenda | Modelo especializado de calendário preservado; não trocar calendário por dashboard. | Inventário de código; agendamento completo ainda requer homologação. |
| Comunicação | Conversas preservadas. Adicionados Painel TV e Configuração da TV no mesmo módulo. Corrigida seleção simultânea das duas opções do menu. | `/conversations` e ambas as novas rotas abriram; inspeção visual da TV e do editor. |
| Insights/Relatórios | Corrigidos período por data do atendimento, novos clientes pela tabela clients, retenção calculada e exportação CSV. Removidos gráficos demonstrativos da tela real. Falha de consulta não é apresentada como resultado zerado. | `/reports` abriu; gráficos e cabeçalho inspecionados visualmente. Exportação implementada, download não testado nesta revisão. |
| Contas, Comissões, Caixa | Componentes existentes coerentes com o padrão. Cards compartilhados refinados sem alterar regras financeiras. | `/billing`, `/commissions`, `/cash` abriram. Não foram lançadas transações. |
| Promoções, Fidelidade, Assinaturas | Navegação por seções mantida. | `/coupons`, `/loyalty`, `/subscriptions` abriram. |
| Upgrade | Cabeçalho e espaçamento convertidos para o padrão PageHeader/page-container. | `/upgrade` abriu. Checkout não executado. |
| Painel do profissional | Cabeçalho/contêiner padronizados. | Código e build; sessão de profissional ainda requer teste dedicado. |
| Desempenho da equipe | Removido fallback que inventava 5 profissionais e receita de R$ 24.780. Estados de carregamento e erro explícitos. | Código, lint e build; homologar cálculos com casos conhecidos. |
| Sucesso do cliente | Usa avaliações persistidas; manter sem métricas fictícias. | Inventário de código. |
| Super Admin | Contêiner e 12 cabeçalhos padronizados; papéis e funcionalidades preservados. | Dashboard e 11 rotas de listagem abriram com acesso Super Admin. Detalhe de ticket e operações de escrita não testados. |
| Portal do cliente | Cabeçalhos de Perfil, Histórico, Fidelidade e Pagamentos padronizados; histórico usa linguagem genérica de atendimentos. Portal continua mobile/identidade do negócio. | Código/build; fluxo completo com sessão cliente e celular permanece pendente. |
| Vendas | Corrigida invasão da ilustração sobre o texto; título sem altura fixa que corte conteúdo; imagem secundária com lazy loading. Removidas alegações sem fonte de 350 negócios, 4,9/5 e 230 avaliações. Logos ilustrativos identificados. | `/vendas` inspecionada visualmente no desktop, antes/depois. |
| Login, cadastro, onboarding e recuperação | Não redesenhados nesta revisão para não mudar fluxos de autenticação sem teste específico. | Login de desenvolvimento usado para acessos Admin/Super Admin. |

## Painel TV — entrega e limites

- Editor: boas-vindas, aviso de rodapé e até 30 inserções.
- Cada inserção: título, mensagem, imagem por HTTPS ou upload com recorte horizontal,
  duração de 5 a 300 segundos, ativação, remoção da programação e ordenação.
- Exibição: nome/logo do negócio, relógio, rotação automática, pausa, próximo e tela cheia.
- Configuração por empresa no banco VIZZU `yjuqixthmwgnzkjummaf`.
- `tv_display_settings` com RLS: somente administrador proprietário pode consultar/salvar
  sua programação. Anônimos não têm SELECT; authenticated não tem DELETE.
- Sincronização por consulta a cada 30 segundos, não transmissão Realtime.
- Nesta versão a TV exige login em dispositivo controlado pelo estabelecimento;
  não há token público/kiosk e não mostra informações financeiras ou contatos.
- Chamadas são avisos escritos, não fila de atendimento/voz automática. Vídeos,
  agendamento de campanhas por data e emparelhamento dedicado ficam para evolução.
- Salvamento de boas-vindas validado e 1 configuração persistida. Uma inserção de
  teste foi adicionada apenas no editor e descartada, sem publicar anúncio fictício.
- Upload, rotação com múltiplas artes e tela cheia precisam de teste no aparelho real.

## Banco e publicação

Aplicadas SOMENTE as duas migrations da TV e registradas no histórico remoto:
`20261001013159_establishment_tv_display` e `20261001014500_tv_display_permissions`.
Não foi utilizado db push para aplicar o histórico inteiro divergente.
Sem mudanças em tabelas existentes de agendamentos, clientes ou faturamento.

As mudanças de frontend estão locais nesta entrega. Não houve push/deploy neste pedido.
Arquivos temporários de Supabase e dumps de schema não pertencem à entrega.

## Verificação técnica

- 8 arquivos de testes / 32 testes aprovados, incluindo validação de programação da TV.
- TypeScript, lint e build de produção aprovados.
- Smoke test de 14 rotas administrativas, dashboard/11 listagens Super Admin,
  Vendas e TV. Não equivale a teste visual completo de todas as abas nem a E2E transacional.
- Assets comerciais existentes continuam grandes (~1,3 a 2,3 MB por imagem);
  planejar versões otimizadas e medir desempenho em rede móvel.

## Porta de lançamento — pendências

1. Validar entrega real do e-mail de confirmação do proprietário, SMTP, links de
   recuperação e reenvio. Não considerar resolvido apenas porque o botão funciona.
2. Homologar cadastro rápido do cliente, WhatsApp obrigatório, retorno ao negócio
   correto e primeiro agendamento. Google permanece pendente de credenciais.
3. Homologar pagamento, webhook, trial, expiração, upgrade e cancelamento.
4. Testar isolamento entre duas empresas e permissões do profissional no banco.
   A revisão de RLS da TV não substitui uma auditoria de todas as tabelas.
5. Testar mobile, teclado, contraste em tema claro/escuro e todas as operações
   principais com dados conhecidos, incluindo conflitos de agendamento.
6. Revisar proteção contra abuso no cadastro público, monitoramento e backup.
7. Publicar frontend e repetir os fluxos críticos em produção. Testar OG/WhatsApp
   com URL nova e link antigo para distinguir cache de erro de servidor.

Prioridade: fechar fluxos críticos e segurança antes de acrescentar novos gráficos.
