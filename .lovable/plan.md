

# Adicionar Logo VIZZU na Sidebar

## O que será feito

Copiar a imagem enviada para `src/assets/vizzu-logo.png` e substituir o texto "VIZZU" no header da sidebar por uma combinação de logo + texto.

## Mudanças

1. **Copiar imagem** para `src/assets/vizzu-logo.png`
2. **`src/components/Sidebar.tsx`** (linhas 168-172):
   - Importar a imagem: `import vizzuLogo from "@/assets/vizzu-logo.png"`
   - Substituir o header por: logo (32x32px) + texto "VIZZU" lado a lado
   ```tsx
   <div className="px-5 pt-[18px] pb-4 flex items-center gap-[10px] border-b border-[hsl(var(--border))]">
     <img src={vizzuLogo} alt="VIZZU" className="h-8 w-8 object-contain" />
     <span className="font-heading text-lg font-extrabold tracking-[1.5px] text-primary">
       VIZZU
     </span>
   </div>
   ```

