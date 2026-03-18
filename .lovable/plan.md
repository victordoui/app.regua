

# Compactar espaçamento vertical da Sidebar

Ajustes em `src/components/Sidebar.tsx`:

1. **Nav container** (L154): `py-1` → `py-0.5`
2. **Category labels** (L158): `pt-1 pb-0.5` → `pt-0.5 pb-0`
3. **Menu items** (L173): `py-1` → `py-0.5` (expanded), `py-1.5` → `py-1` (collapsed)
4. **Collapsed divider** (L164): `my-1` → `my-0.5`
5. **Category container** (L156): já `mb-0`, manter

Resultado: itens praticamente colados, estilo sidebar SaaS compacta.

