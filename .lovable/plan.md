

# Redesign da Agenda no estilo da imagem de referência

A imagem mostra um calendário semanal com visual limpo, fundo branco, cards de eventos coloridos com bordas laterais, avatares dos barbeiros, e um popup de detalhes ao clicar. Vou adaptar o visual atual para esse estilo.

## Alterações principais

### 1. `CalendarView.tsx` - Layout e header
- Header: título "Mês, Ano" grande à esquerda, toggle "Semana/Mês" à direita com estilo pill/outlined, botão "+ Novo" azul
- Cabeçalho dos dias: fundo claro, nome do dia em negrito, data abaixo, dia atual em azul
- Grid: fundo branco, linhas horizontais sutis (cinza claro), sem bordas pesadas
- Remover o ícone de calendário no canto superior esquerdo do grid
- Colunas dos dias com separadores verticais sutis

### 2. `CalendarEventCard.tsx` - Cards de eventos
- Trocar de cards sólidos coloridos para cards com **fundo pastel** (ex: verde claro, amarelo claro, rosa claro) + **borda lateral esquerda colorida** (4px)
- Mostrar ID/número do agendamento (ex: #0012) acima do nome do serviço
- Nome do serviço em destaque colorido
- Avatar circular do barbeiro no canto inferior direito do card
- Remover indicadores de status (bolinha) — status vai para o popup
- Texto escuro em vez de branco

### 3. `CalendarEventCard.tsx` - Popup de detalhes (ao clicar)
- Ao invés de apenas abrir o dialog de edição, mostrar um **popover/card flutuante** com:
  - Avatar + nome do cliente
  - ID do agendamento
  - Serviço
  - Status com badge colorido (ex: "PENDING" em amarelo)
  - Data e horário com ícone de relógio
  - Nome do barbeiro com ícone
  - Botão "Confirmar" azul
- Clicar em "Editar" ou duplo-clique abre o form dialog completo

### 4. `Appointments.tsx` - Header simplificado
- Mover o botão "+ Novo" para dentro do CalendarView header (lado direito)
- Simplificar o header da página removendo badges de "Ao Vivo" 
- Toggle Semana/Mês integrado ao CalendarView

### 5. Cores dos cards por tipo de serviço (mapeamento)
- Verde pastel: Corte (Haircut)
- Amarelo pastel: Barba / tratamentos
- Rosa/vermelho pastel: Coloração, etc.
- Usar `barberColor` existente para a borda lateral, e uma versão pastel para o fundo

## Resumo técnico

| Arquivo | O que muda |
|---|---|
| `CalendarView.tsx` | Header redesenhado, grid mais limpo, fundo branco |
| `CalendarEventCard.tsx` | Cards pastel com borda lateral, avatar, ID, popup de detalhes |
| `Appointments.tsx` | Header simplificado, botão "+ Novo" movido |
| `AppointmentSidebar.tsx` | Sem alteração significativa |

A funcionalidade existente (drag-and-drop, filtros, recorrência) será totalmente preservada. Apenas o visual muda.

