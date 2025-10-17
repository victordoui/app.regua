import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, DollarSign, ShoppingCart, User, Search, CheckCircle } from 'lucide-react';
import { useCashRegister } from '@/hooks/useCashRegister';
import { CurrentSaleItem } from '@/types/cash';
import { Client } from '@/types/appointments';

const Cash = () => {
  const {
    products,
    services,
    clients,
    isLoadingProducts,
    isLoadingServices,
    isLoadingClients,
    currentSaleItems,
    addItemToSale,
    updateItemQuantity,
    removeItemFromSale,
    totalAmount,
    selectedClient,
    setSelectedClient,
    paymentMethod,
    setPaymentMethod,
    saleNotes,
    setSaleNotes,
    processSale,
    isProcessingSale,
  } = useCashRegister();

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) && p.stock > 0
    );
  }, [products, productSearchTerm]);

  const filteredServices = useMemo(() => {
    return services.filter(s =>
      s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [services, serviceSearchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleProcessSale = async () => {
    if (currentSaleItems.length === 0) {
      alert("Adicione itens à venda antes de processar.");
      return;
    }
    await processSale();
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Caixa e PDV</h1>
            <p className="text-muted-foreground">
              Gerencie vendas de produtos e serviços da barbearia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Coluna 1: Produtos e Serviços */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>Adicionar Itens</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Produtos */}
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-semibold text-lg mb-2">Produtos</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="flex-1 border rounded-md p-2">
                  {isLoadingProducts ? (
                    <div className="text-center py-4 text-muted-foreground">Carregando produtos...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">Nenhum produto encontrado ou em estoque.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredProducts.map(product => (
                        <Button
                          key={product.id}
                          variant="outline"
                          className="h-auto p-3 flex-col items-start text-left"
                          onClick={() => addItemToSale(product, 'product')}
                          disabled={product.stock <= 0}
                        >
                          <span className="font-medium text-base">{product.name}</span>
                          <span className="text-sm text-muted-foreground">{formatCurrency(product.price)}</span>
                          <span className="text-xs text-muted-foreground">Estoque: {product.stock}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <Separator />

              {/* Serviços */}
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="font-semibold text-lg mb-2">Serviços</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar serviços..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="flex-1 border rounded-md p-2">
                  {isLoadingServices ? (
                    <div className="text-center py-4 text-muted-foreground">Carregando serviços...</div>
                  ) : filteredServices.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">Nenhum serviço encontrado.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredServices.map(service => (
                        <Button
                          key={service.id}
                          variant="outline"
                          className="h-auto p-3 flex-col items-start text-left"
                          onClick={() => addItemToSale(service, 'service')}
                        >
                          <span className="font-medium text-base">{service.name}</span>
                          <span className="text-sm text-muted-foreground">{formatCurrency(service.price)}</span>
                          <span className="text-xs text-muted-foreground">Duração: {service.duration_minutes}min</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Coluna 2: Resumo da Venda e Pagamento */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between overflow-hidden">
              <ScrollArea className="flex-1 mb-4 pr-2">
                {currentSaleItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum item na venda.</div>
                ) : (
                  <div className="space-y-3">
                    {currentSaleItems.map((item: CurrentSaleItem) => (
                      <div key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateItemQuantity(item.id, item.type, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateItemQuantity(item.id, item.type, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeItemFromSale(item.id, item.type)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                </div>

                {/* Cliente */}
                <div>
                  <Label htmlFor="client-select">Cliente (Opcional)</Label>
                  <Select
                    value={selectedClient?.id || ''}
                    onValueChange={(value) => setSelectedClient(clients.find(c => c.id === value) || null)}
                  >
                    <SelectTrigger id="client-select">
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingClients ? (
                        <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <Label htmlFor="payment-method">Método de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Selecionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="sale-notes">Observações</Label>
                  <Textarea
                    id="sale-notes"
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
                    placeholder="Notas sobre a venda..."
                    rows={2}
                  />
                </div>

                <Button
                  className="w-full h-12 text-lg"
                  onClick={handleProcessSale}
                  disabled={currentSaleItems.length === 0 || isProcessingSale}
                >
                  {isProcessingSale ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Finalizar Venda
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Cash;