# Redesign interno — 01/10/2026

## Limites desta entrega

- Vendas restaurada ao conteúdo de HEAD anterior aos ajustes locais. Diff de conteúdo vazio.
- Início e Minha Empresa não foram editados. O Card compartilhado também foi restaurado;
  os novos estilos são delimitados às páginas internas selecionadas.
- Não houve commit, push ou deploy nesta etapa. O servidor local está na porta 8080.
- Sem novas migrations ou alterações de registros financeiros nesta etapa.
  As migrations da TV pertencem à etapa anterior, documentada na auditoria de 30/09.

## Padrão visual

Cabeçalhos com gradiente leve, contexto e ações; indicadores neutros com ícones
coloridos; cards arredondados; seções horizontais de largura completa; estados
vazios orientativos; foco visível; efeitos de entrada discretos que respeitam
prefers-reduced-motion. Componentes existentes reutilizados, sem dependências novas.
Estilos próprios em workspace-page.css: não abrangem a página de vendas, Início
ou Minha Empresa.

| Página | Alterações |
| --- | --- |
| Desempenho | Indicadores reais; equipe, cancelamentos e avaliações em abas. Sem destaque de receita quando não há receita. |
| Sucesso do Cliente | Cabeçalho e avaliações refinados; nota ausente exibida como traço, busca acessível e estado vazio contextual. |
| Meu Perfil | Dados e assinatura lado a lado no desktop; identidade e contato legíveis; acesso à comparação de planos VIZZU. |
| Usuários | Indicadores uniformes, nomes/badges adaptáveis e ações identificadas. Fluxo existente de convites preservado. |
| Agenda | Cabeçalho refinado; alternância calendário/lista com nomes acessíveis e estado pressionado. Calendário preservado. |
| Clientes | Indicadores, iniciais e cards redesenhados; ações acessíveis e busca sem resultados com limpeza de filtros. |
| Profissionais | Cards de identidade e disponibilidade; orientação sobre diferença entre cadastro profissional e acesso de usuário. |
| Serviços | Catálogo compacto, imagens menores, fallback ilustrado, abas horizontais e rótulos em ações de ícone. |
| Conversas | Área de leitura leve, seleção destacada e cartões acessíveis por teclado. Mensagens/contatos reais preservados. |
| Painel TV | Modo apresentação com retorno aos controles; identificação da inserção e duração; próximo desativado sem anúncios. |
| Configuração TV | Prévia de cada rascunho, inserções ativas e duração do ciclo; mover para cima/baixo; resumo lateral. |
| Engajamento / Planos | Navegação horizontal e explicação da diferença entre planos do negócio e assinatura VIZZU. |
| Rewards / Fidelidade | Indicadores e abas consistentes; orientação sobre recompensas, pontos e indicações. |
| Insights | Contexto do período e definição dos indicadores, novas abas/indicadores e painéis consistentes. |
| Contas | Ações separadas de despesa/receita, tipo correto no formulário, filtros com estado e vazio acionável. |
| Comissões | Indicadores/abas/filtros consistentes; resumo integrado às regras cadastradas, erro explícito e escopo por proprietário. |
| Promoções | Abas horizontais e orientação sobre cupons, vales e preços dinâmicos. |
| Caixa / PDV | Catálogo e resumo adaptáveis, sem altura fixa no celular; itens com texto quebrável; ações de quantidade maiores e acessíveis. |

## Correção de comissões

Antes, useCommissions aplicava 40% fixos sobre o preço atual do serviço, independentemente
das regras cadastradas. Agora a função compartilhada resolve: profissional + serviço,
profissional, serviço, regra global e, somente sem regra aplicável, fallback legado de 40%.
Usa total_price persistido no atendimento; somente registros legados sem valor recorrem
ao preço do serviço. Percentuais e valores fixos são diferenciados e arredondados em centavos.
Consulta de profissionais filtrada pelo proprietário. Falhas de consulta ou regra inválida
não são apresentadas como ausência de comissões. Nenhum repasse foi executado.
Homologar exemplos reais antes de usar para pagamento; regras não são versionadas por data,
portanto alterar uma regra atual pode recalcular períodos anteriores.

## Verificação

- 11 arquivos / 52 testes aprovados. Incluem componentes do novo padrão, precedência,
  valores fixos, zero, arredondamento, falhas e integração do resumo de comissões.
- Lint e TypeScript aprovados; build de produção aprovado.
- Rotas internas solicitadas abertas no navegador local. Agenda carregou após reiniciar
  o servidor que havia parado; modos de calendário/lista conferidos.
- Serviços: seleção de abas; desempenho: seleção de cancelamentos; TV: rascunho/prévia
  sem salvar e modo apresentação; Contas: Nova receita abre tipo A Receber.
- PDV: adicionar/aumentar/remover serviço sem finalizar venda. Clientes e PDV
  em viewport de celular, sem rolagem horizontal do documento. Tema claro/escuro conferido.
- Testes visuais usam a sessão administrativa de desenvolvimento e dados existentes;
  não comprovam todos os CRUDs, upload, pagamentos, entrega de mensagens ou produção.

## Antes de lançar

Homologar CRUD das abas, repasses com exemplos conhecidos, agendamento concorrente,
isolamento entre empresas, permissões de profissional e uso no aparelho de TV real.
Validar SMTP/confirmar e-mail do dono, cadastro rápido do cliente, pagamentos/webhooks,
trial/expiração e Open Graph em produção. Google continua pendente de credenciais.
Publicação depende de commit/push/deploy solicitados separadamente.

Referências consultadas: [Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)
e [Motion accessibility](https://motion.dev/docs/react-accessibility).
