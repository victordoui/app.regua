

# Plano: Dashboard Unificado + Switch Redesign + Sidebar Refinada

## 1. Dashboard Unificado — "Painel Administrativo"

Atualmente existem 4 paginas separadas acessiveis pela sidebar em "Dashboard":
- `/` (Visao Geral) — metricas, graficos, atividades
- `/customer-success` (Sucesso do Cliente) — feedbacks, NPS, retencao
- `/barber-performance` (Desempenho dos Barbeiros) — ranking, cancelamentos
- `/reviews` (Avaliacoes) — notas, distribuicao, lista de reviews

**Acao**: Unificar tudo em uma unica pagina `/` usando `Tabs` (abas). O nome na sidebar sera "Painel Administrativo" com um unico link (sem subcategorias de dashboard).

```text
+-----------------------------------------------+
| Painel Administrativo                         |
|                                               |
| [Visao Geral] [Sucesso do Cliente]            |
| [Desempenho]  [Avaliacoes]                    |
|                                               |
| (conteudo da aba selecionada)                 |
+-----------------------------------------------+
```

**Implementacao**:
- Refatorar `src/pages/Index.tsx` para incluir 4 abas com `Tabs`/`TabsList`/`TabsContent`
- Cada aba importa o conteudo das paginas existentes como componentes internos (extrair o conteudo de `CustomerSuccess`, `BarberPerformance`, `Reviews` sem o `<Layout>` wrapper)
- Remover as 4 rotas separadas do `App.tsx` e manter apenas `/`
- Atualizar a sidebar para mostrar "Painel Administrativo" como item unico (sem subcategoria "Dashboard")

---

## 2. Redesign do Switch (Toggle)

O componente atual em `src/components/ui/switch.tsx` tem problemas visuais:
- Quando ativado, o thumb fica azul sobre fundo azul (invisivel)
- Quando desativado, o thumb nao tem contraste

**Acao**: Redesenhar o Switch para:
- **Ativado**: Track com gradiente primary, thumb branco com sombra
- **Desativado**: Track cinza claro com borda sutil, thumb branco/cinza com sombra
- Transicao suave e visual limpo

---

## 3. Sidebar Refinada e Harmonizada

Problemas atuais:
- Header da sidebar nao alinha visualmente com o header superior (h-14)
- Separadores duplos no rodape
- Espacamento inconsistente entre categorias

**Acao**:
- Alinhar a altura do header da sidebar com a barra superior (`h-14`)
- Remover a categoria "Dashboard" com subcategorias e substituir por item unico "Painel Administrativo"
- Melhorar espacamento e separadores
- Refinar hover states e indicadores de item ativo com borda lateral colorida
- Limpar o rodape (remover separador duplicado)

---

## Arquivos Modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Index.tsx` | Refatorar para 4 abas unificadas |
| `src/pages/CustomerSuccess.tsx` | Extrair conteudo para componente reutilizavel |
| `src/pages/BarberPerformance.tsx` | Extrair conteudo para componente reutilizavel |
| `src/pages/Reviews.tsx` | Extrair conteudo para componente reutilizavel |
| `src/components/ui/switch.tsx` | Redesenhar visual do toggle |
| `src/components/Sidebar.tsx` | Harmonizar com header, item unico do painel |
| `src/App.tsx` | Remover rotas `/customer-success`, `/barber-performance`, `/reviews` |

