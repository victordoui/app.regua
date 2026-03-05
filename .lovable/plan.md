

# Ajuste de altura do Switch

O track atual tem `h-5` (20px) e o thumb `h-3.5` (14px) — está baixo demais visualmente.

## Alteração

Aumentar para proporções mais confortáveis mantendo o estilo Bootstrap:

- **Track**: `h-5` → `h-6` (24px), `w-9` → `w-11` (44px)
- **Thumb**: `h-3.5` → `h-4.5` (18px), `w-3.5` → `w-4.5` (18px)
- **Posições do thumb**: ajustar translate para `translate-x-[3px]` (off) e `translate-x-[22px]` (on)

## Arquivo

| Arquivo | Alteração |
|---|---|
| `src/components/ui/switch.tsx` | Aumentar altura do track e thumb |

