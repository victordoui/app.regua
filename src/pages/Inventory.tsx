import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory } from '@/hooks/useInventory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Package, Plus, Trash2, Loader2, AlertTriangle, 
  ArrowDown, ArrowUp, Search, Edit, BarChart3 
} from 'lucide-react';

const Inventory = () => {
  const { 
    products, movements, isLoading, 
    addProduct, updateProduct, deleteProduct, addMovement,
    isAddingProduct, isUpdatingProduct, isAddingMovement 
  } = useInventory();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', min_stock: '5', 
    category: '', barcode: '', active: true
  });
  
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out', quantity: '', reason: ''
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 5));

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', min_stock: '5', category: '', barcode: '', active: true });
    setEditingProduct(null);
  };

  const handleOpenEdit = (product: typeof products[0]) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      min_stock: (product.min_stock || 5).toString(),
      category: product.category || '',
      barcode: product.barcode || '',
      active: product.active
    });
    setEditingProduct(product.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) return;
    
    const data = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      min_stock: parseInt(formData.min_stock) || 5,
      category: formData.category || undefined,
      barcode: formData.barcode || undefined,
      active: formData.active
    };

    if (editingProduct) {
      await updateProduct({ id: editingProduct, ...data });
    } else {
      await addProduct(data);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleAddMovement = async () => {
    if (!selectedProductId || !movementData.quantity) return;
    
    await addMovement({
      product_id: selectedProductId,
      type: movementData.type,
      quantity: parseInt(movementData.quantity),
      reason: movementData.reason || undefined
    });
    
    setMovementDialogOpen(false);
    setMovementData({ type: 'in', quantity: '', reason: '' });
    setSelectedProductId(null);
  };

  const openMovementDialog = (productId: string, type: 'in' | 'out') => {
    setSelectedProductId(productId);
    setMovementData({ type, quantity: '', reason: '' });
    setMovementDialogOpen(true);
  };

  const productMovements = selectedProductId 
    ? movements.filter(m => m.product_id === selectedProductId).slice(0, 10)
    : [];

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-muted-foreground">Gerencie produtos e controle de estoque</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Produto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome *</Label><Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
                <div><Label>Descrição</Label><Input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preço *</Label><Input type="number" step="0.01" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} /></div>
                  <div><Label>Estoque Inicial</Label><Input type="number" value={formData.stock} onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Estoque Mínimo</Label><Input type="number" value={formData.min_stock} onChange={e => setFormData(prev => ({ ...prev, min_stock: e.target.value }))} /></div>
                  <div><Label>Categoria</Label><Input value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} placeholder="Ex: Pomadas" /></div>
                </div>
                <div><Label>Código de Barras</Label><Input value={formData.barcode} onChange={e => setFormData(prev => ({ ...prev, barcode: e.target.value }))} /></div>
                <Button onClick={handleSubmit} disabled={isAddingProduct || isUpdatingProduct} className="w-full">
                  {(isAddingProduct || isUpdatingProduct) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingProduct ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas de Baixo Estoque */}
        {lowStockProducts.length > 0 && (
          <Card className="border-orange-500/50 bg-orange-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alerta de Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map(p => (
                  <Badge key={p.id} variant="outline" className="border-orange-500 text-orange-600">
                    {p.name}: {p.stock} un.
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nome ou código..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Produtos */}
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="min-h-[200px] flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Nenhum Produto</CardTitle>
                  <p className="text-muted-foreground">Adicione produtos ao seu estoque.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <Card key={product.id} className={!product.active ? 'opacity-50' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.category && (
                            <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {product.description && (
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">R$ {product.price.toFixed(2)}</span>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${product.stock <= (product.min_stock || 5) ? 'text-orange-500' : 'text-green-500'}`}>
                              {product.stock} un.
                            </div>
                            <span className="text-xs text-muted-foreground">Mín: {product.min_stock || 5}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openMovementDialog(product.id, 'in')}>
                            <ArrowDown className="h-4 w-4 mr-1 text-green-500" />Entrada
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openMovementDialog(product.id, 'out')}>
                            <ArrowUp className="h-4 w-4 mr-1 text-red-500" />Saída
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Histórico de Movimentações
                </CardTitle>
                <CardDescription>Últimas entradas e saídas de estoque</CardDescription>
              </CardHeader>
              <CardContent>
                {movements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma movimentação registrada.</p>
                ) : (
                  <div className="space-y-3">
                    {movements.slice(0, 20).map(mov => (
                      <div key={mov.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {mov.type === 'in' ? (
                            <div className="p-2 rounded-full bg-green-500/10">
                              <ArrowDown className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full bg-red-500/10">
                              <ArrowUp className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{mov.product?.name || 'Produto'}</p>
                            <p className="text-sm text-muted-foreground">{mov.reason || (mov.type === 'in' ? 'Entrada' : 'Saída')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${mov.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                            {mov.type === 'in' ? '+' : '-'}{mov.quantity} un.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(mov.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Movimentação */}
        <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {movementData.type === 'in' ? 'Entrada de Estoque' : 'Saída de Estoque'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Quantidade *</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={movementData.quantity} 
                  onChange={e => setMovementData(prev => ({ ...prev, quantity: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Motivo</Label>
                <Input 
                  value={movementData.reason} 
                  onChange={e => setMovementData(prev => ({ ...prev, reason: e.target.value }))} 
                  placeholder={movementData.type === 'in' ? 'Ex: Compra fornecedor' : 'Ex: Venda avulsa'}
                />
              </div>
              <Button onClick={handleAddMovement} disabled={isAddingMovement} className="w-full">
                {isAddingMovement && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Inventory;
