

# Ajustar cores do Switch para usar cores do sistema

Trocar as cores hardcoded por variáveis do design system.

## Alteração em `src/components/ui/switch.tsx`

| Estado | Atual | Novo |
|---|---|---|
| Checked | `bg-green-500` | `bg-primary` |
| Unchecked | `bg-[rgb(131,131,131)]` | `bg-input` |

Duas classes mudam:
- `data-[state=checked]:bg-green-500` → `data-[state=checked]:bg-primary`
- `data-[state=unchecked]:bg-[rgb(131,131,131)]` → `data-[state=unchecked]:bg-input`

Isso faz o switch respeitar o tema claro/escuro e a paleta de cores definida no design system.

