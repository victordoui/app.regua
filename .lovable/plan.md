
# Renomear "Configurações" para "Minha Empresa"

## Mudanças

### 1. `src/components/Sidebar.tsx` (linha 49)
- Renomear o label de `"Configurações"` para `"Minha Empresa"`

### 2. `src/components/CompanySettings.tsx`
- Alterar o título no `PageHeader` de `"Meu Negócio"` para `"Minha Empresa"`
- Atualizar o subtitle de `"Configurações da empresa"` para algo como `"Gerencie os dados da sua empresa"`

A página `/settings` já redireciona para `/settings/company`, então não precisa de mudanças de rota. A página `Settings.tsx` antiga já é redundante (os mesmos campos existem em CompanySettings) e pode ser mantida apenas como redirect.
