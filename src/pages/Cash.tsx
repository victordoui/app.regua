import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, DollarSign, ShoppingCart, Search, CheckCircle } from 'lucide-react';
import { useCashRegister } from '@/hooks/useCashRegister';
import { CurrentSaleItem } from '@/types/cash';
import { PageHeader } from '@/components/ui/page-header';

const Cash = () => {
  const { products, services, clients, isLoadingProducts, isLoadingServices, isLoadingClients, currentSaleItems, addItemToSale, updateItemQuantity, removeItemFromSale, totalAmount, selectedClient, setSelectedClient, paymentMethod, setPaymentMethod, saleNotes, setSaleNotes, processSale, isProcessingSale } = useCashRegister();
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) && p.stock > 0), [products, productSearchTerm]);
  const filteredServices = useMemo(() => services.filter(s => s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())), [services, serviceSearchTerm]);
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleProcessSale = async () => { if (currentSaleItems.length === 0) { alert("Adicione itens antes de processar."); return; } await processSale(); };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<ShoppingCart className="h-5 w-5" />} title="Caixa e PDV" subtitle="Registre vendas e serviços" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-2 flex flex-col rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/40"><h2 className="font-semibold text-lg">Adicionar Itens</h2></div>
            <div className="flex-1 flex flex-col p-5 space-y-4 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-medium mb-2">Produtos</h3>
                <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar produtos..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} className="pl-10" /></div>
                <ScrollArea className="flex-1 border border-border/40 rounded-lg p-2">
                  {isLoadingProducts ? <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                  : filteredProducts.length === 0 ? <div className="text-center py-4 text-muted-foreground">Nenhum produto encontrado.</div>
                  : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredProducts.map(p => <Button key={p.id} variant="outline" className="h-auto p-3 flex-col items-start text-left" onClick={() => addItemToSale(p, 'product')}><span className="font-medium">{p.name}</span><span className="text-sm text-muted-foreground">{fmt(p.price)}</span><span className="text-xs text-muted-foreground">Estoque: {p.stock}</span></Button>)}</div>}
                </ScrollArea>
              </div>
              <Separator />
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-medium mb-2">Serviços</h3>
                <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar serviços..." value={serviceSearchTerm} onChange={(e) => setServiceSearchTerm(e.target.value)} className="pl-10" /></div>
                <ScrollArea className="flex-1 border border-border/40 rounded-lg p-2">
                  {isLoadingServices ? <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                  : filteredServices.length === 0 ? <div className="text-center py-4 text-muted-foreground">Nenhum serviço encontrado.</div>
                  : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{filteredServices.map(s => <Button key={s.id} variant="outline" className="h-auto p-3 flex-col items-start text-left" onClick={() => addItemToSale(s, 'service')}><span className="font-medium">{s.name}</span><span className="text-sm text-muted-foreground">{fmt(s.price)}</span></Button>)}</div>}
                </ScrollArea>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/40"><h2 className="font-semibold text-lg">Resumo da Venda</h2></div>
            <div className="flex-1 flex flex-col justify-between overflow-hidden p-5">
              <ScrollArea className="flex-1 mb-4 pr-2">
                {currentSaleItems.length === 0 ? <div className="text-center py-8 text-muted-foreground">Nenhum item na venda.</div>
                : <div className="space-y-3">{currentSaleItems.map((item: CurrentSaleItem) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0">
                    <div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{fmt(item.price)} x {item.quantity}</p></div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(item.id, item.type, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                      <span className="font-semibold w-6 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(item.id, item.type, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItemFromSale(item.id, item.type)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}</div>}
              </ScrollArea>
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center"><span className="text-lg font-semibold">Total:</span><span className="text-3xl font-bold text-primary">{fmt(totalAmount)}</span></div>
                <div><Label>Cliente (Opcional)</Label><Select value={selectedClient?.id || ''} onValueChange={(v) => setSelectedClient(clients.find(c => c.id === v) || null)}><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Pagamento</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cash">Dinheiro</SelectItem><SelectItem value="card">Cartão</SelectItem><SelectItem value="pix">PIX</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent></Select></div>
                <div><Label>Observações</Label><Textarea value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Notas..." rows={2} /></div>
                <Button className="w-full h-12 text-lg" onClick={handleProcessSale} disabled={currentSaleItems.length === 0 || isProcessingSale}>
                  {isProcessingSale ? "Processando..." : <><CheckCircle className="h-5 w-5 mr-2" />Finalizar Venda</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cash;
