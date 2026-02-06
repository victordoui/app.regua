
# Plano: Implementar Redirecionamento e Acesso ao Super Admin

## Problema

O usuario logado como `super_admin` nao esta sendo redirecionado para o painel de Super Admin e nao consegue ver os controles especificos de sua role porque:

1. O login sempre redireciona para `/` independentemente da role
2. A Sidebar principal nao possui link para o painel Super Admin

## Solucao

### Parte 1: Redirecionar Super Admin apos Login

Modificar o arquivo `src/pages/Login.tsx` para verificar a role do usuario apos autenticacao e redirecionar:
- `super_admin` → `/superadmin`
- Outros usuarios → `/`

**Logica:**
```
1. Apos login bem-sucedido
2. Buscar role do usuario na tabela user_roles
3. Se role = super_admin → navegar para /superadmin
4. Senao → navegar para /
```

### Parte 2: Adicionar Link na Sidebar para Super Admin

Modificar o arquivo `src/components/Sidebar.tsx` para:
- Verificar se o usuario atual possui a role `super_admin`
- Exibir um item de menu "Super Admin" que leva para `/superadmin`
- Usar estilizacao especial (dourado/laranja) para destacar

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Login.tsx` | Verificar role e redirecionar corretamente |
| `src/components/Sidebar.tsx` | Adicionar link condicional para Super Admin |

---

## Detalhes Tecnicos

### Login.tsx - onLoginSubmit

Alterar a funcao `onLoginSubmit` para:

```typescript
const onLoginSubmit = async (data: LoginFormValues) => {
  setLoading(true);
  try {
    const { error, success } = await signIn(data.email, data.password);
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    } else if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema!",
      });
      
      // Buscar role do usuario
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
        navigate(isSuperAdmin ? "/superadmin" : "/");
      } else {
        navigate("/");
      }
    }
  } catch (error: any) {
    // ...
  } finally {
    setLoading(false);
  }
};
```

### Sidebar.tsx - Adicionar Menu Super Admin

Importar o hook `useRole` e adicionar item condicional:

```typescript
import { useRole } from '@/contexts/RoleContext';

// Dentro do componente:
const { isSuperAdmin } = useRole();

// Adicionar ao final das categorias do menu:
{isSuperAdmin && (
  <div className="pt-4 border-t border-amber-500/30">
    <Button
      variant="ghost"
      className="w-full justify-start h-10 text-amber-500 hover:bg-amber-500/10"
      onClick={() => handleNavigation('/superadmin')}
    >
      <Shield className="h-4 w-4 mr-3" />
      Super Admin
    </Button>
  </div>
)}
```

---

## Fluxo Corrigido

```
┌───────────────────────────────────────────────────────┐
│                  FLUXO DE LOGIN                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  1. Usuario clica em "Super" ou faz login manual      │
│                      │                                │
│                      ▼                                │
│  2. signIn() autentica o usuario                      │
│                      │                                │
│                      ▼                                │
│  3. Busca roles do usuario via user_roles             │
│                      │                                │
│                      ▼                                │
│  4. Se super_admin → navega para /superadmin          │
│     Senao → navega para /                             │
│                      │                                │
│                      ▼                                │
│  5. SuperAdminDashboard carrega com todas features    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Resultado Esperado

Apos a implementacao:

| Cenario | Comportamento |
|---------|---------------|
| Login como super_admin | Redireciona para `/superadmin` |
| Login como admin/barbeiro | Redireciona para `/` |
| Super Admin na sidebar | Ve link dourado "Super Admin" |
| Admin/barbeiro na sidebar | Nao ve link Super Admin |

---

## Resumo

| Item | Valor |
|------|-------|
| Arquivos modificados | 2 |
| Migracao SQL | Nenhuma |
| Impacto | Super Admin tera acesso completo ao painel |
