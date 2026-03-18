

# Reorganizar "Minha Empresa" no menu "Meu Negócio"

## Mudança

### `src/components/Sidebar.tsx`
- **Remover** o item `{ icon: Building, label: "Minha Empresa", path: "/settings/company" }` da categoria **"Dashboard"**
- **Adicionar** como **primeiro item** da categoria **"Meu Negócio"** (negocio), ficando:

```text
MEU NEGÓCIO
  🏢 Minha Empresa    → /settings/company
  👤 Meu Perfil       → /profile
  ✅ Usuários         → /users
```

Uma única edição no array `fullMenuStructure`.

