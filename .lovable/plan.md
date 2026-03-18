
# Mover data para Topbar e botões para linha do título

## Mudanças

### 1. `src/components/Topbar.tsx`
- Adicionar pill de data (📅 18 mar, 2026) entre a busca e os ícones da direita, usando `format(new Date(), "dd MMM, yyyy", { locale: ptBR })`

### 2. `src/components/dashboard/HeroSection.tsx`
- **Remover** a pill de data (linhas 20-23)
- **Mover** os botões "Filtros" e "Novo Agendamento" para a **mesma linha** do título "Olá, {companyName} 👋"
- Layout: título à esquerda + botões à direita na mesma row, subtítulo abaixo

```text
┌─────────────────────────────────────────────────────┐
│  🔍 Buscar...  ⌘K    📅 18 mar, 2026    🔔  [AV]  │  ← Topbar
├─────────────────────────────────────────────────────┤
│  Olá, MARSHALLS BARBER 👋    [Filtros] [+ Novo]    │  ← HeroSection
│  Aqui está o resumo do seu negócio hoje...          │
└─────────────────────────────────────────────────────┘
```
