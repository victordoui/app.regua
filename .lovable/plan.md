

# Garantir 5 nomes no Ranking de Profissionais

## Problema
O componente `ProfessionalsPanel` só usa os nomes mock quando não há nenhum barbeiro real. Se existirem 1-4 barbeiros reais, ele mostra apenas esses, sem completar até 5.

## Alteração

### `src/components/dashboard/ProfessionalsPanel.tsx`
- Mudar a lógica de `displayBarbers`: sempre garantir exatamente 5 itens
- Se houver barbeiros reais, usar eles primeiro e preencher o restante com mock até completar 5
- Se não houver nenhum, usar os 5 mock

```text
Lógica atual:
  realBarbers = barbers.slice(0, 5)
  displayBarbers = realBarbers.length > 0 ? realBarbers : mockBarbers

Nova lógica:
  realBarbers = barbers.slice(0, 5)
  displayBarbers = realBarbers.length >= 5 
    ? realBarbers 
    : [...realBarbers, ...mockBarbers.slice(realBarbers.length)].slice(0, 5)
```

Alteração mínima — 1 arquivo, ~3 linhas.

