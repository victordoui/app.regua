

# Adicionar Logo Grande no Topo da Sidebar

## Alteração em `src/components/Sidebar.tsx`

Substituir o header atual (linhas 252-259) que tem um ícone pequeno (w-8 h-8) + texto "VIZZU" lado a lado, por um layout vertical com a logo grande (w-48 h-48, mesmo tamanho da tela de login) centralizada, com "VIZZU" abaixo.

Quando a sidebar estiver **colapsada**, mostrar apenas o ícone pequeno (w-10 h-10) sem texto, para caber na largura de 64px.

### Código do novo header

```tsx
<div className={`px-4 border-b border-border flex flex-col items-center ${isCollapsed ? 'py-2' : 'py-4'}`}>
  {isCollapsed ? (
    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
      <img src={vizzuIcon} alt="VIZZU" className="w-full h-full object-contain" />
    </div>
  ) : (
    <>
      <div className="w-48 h-48 flex items-center justify-center">
        <img src={vizzuIcon} alt="VIZZU" className="w-full h-full object-contain" />
      </div>
      <h2 className="font-bold text-3xl text-foreground mt-2">VIZZU</h2>
    </>
  )}
</div>
```

Remove o `h-14` fixo do header para acomodar a logo maior. Usa `object-contain` para não cortar a imagem — mesmo comportamento da tela de login.

