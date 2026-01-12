import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoupons } from '@/hooks/useCoupons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Tag, Plus, Trash2, Loader2, Edit, Percent, DollarSign, 
  Calendar, CheckCircle, XCircle, Copy 
} from 'lucide-react';
import { toast } from 'sonner';

const Coupons = () => {
  const { 
    coupons, isLoading, 
    addCoupon, updateCoupon, deleteCoupon,
    isAdding, isUpdating, isDeleting 
  } = useCoupons();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    min_purchase: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    active: true
  });

  const resetForm = () => {
    setFormData({
      code: '', discount_type: 'percent', discount_value: '',
      min_purchase: '', max_uses: '', valid_from: '', valid_until: '', active: true
    });
    setEditingCoupon(null);
  };

  const handleOpenEdit = (coupon: typeof coupons[0]) => {
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase: coupon.min_purchase?.toString() || '',
      max_uses: coupon.max_uses?.toString() || '',
      valid_from: coupon.valid_from || '',
      valid_until: coupon.valid_until || '',
      active: coupon.active
    });
    setEditingCoupon(coupon.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.discount_value) return;
    
    const data = {
      code: formData.code,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      active: formData.active
    };

    if (editingCoupon) {
      await updateCoupon({ id: editingCoupon, ...data });
    } else {
      await addCoupon(data);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const toggleCouponStatus = async (coupon: typeof coupons[0]) => {
    await updateCoupon({ id: coupon.id, active: !coupon.active });
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const activeCoupons = coupons.filter(c => c.active && !isExpired(c.valid_until));
  const inactiveCoupons = coupons.filter(c => !c.active || isExpired(c.valid_until));

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cupons de Desconto</h1>
            <p className="text-muted-foreground">Crie e gerencie cupons promocionais</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Cupom</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Código *</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.code} 
                      onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} 
                      placeholder="DESCONTO10"
                    />
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      Gerar
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Desconto</Label>
                    <Select value={formData.discount_type} onValueChange={(v: 'percent' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor *</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.discount_value} 
                      onChange={e => setFormData(prev => ({ ...prev, discount_value: e.target.value }))} 
                      placeholder={formData.discount_type === 'percent' ? '10' : '20.00'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Compra Mínima</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.min_purchase} 
                      onChange={e => setFormData(prev => ({ ...prev, min_purchase: e.target.value }))} 
                      placeholder="R$ 0.00"
                    />
                  </div>
                  <div>
                    <Label>Limite de Usos</Label>
                    <Input 
                      type="number" 
                      value={formData.max_uses} 
                      onChange={e => setFormData(prev => ({ ...prev, max_uses: e.target.value }))} 
                      placeholder="Ilimitado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Válido de</Label>
                    <Input 
                      type="date" 
                      value={formData.valid_from} 
                      onChange={e => setFormData(prev => ({ ...prev, valid_from: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label>Válido até</Label>
                    <Input 
                      type="date" 
                      value={formData.valid_until} 
                      onChange={e => setFormData(prev => ({ ...prev, valid_until: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Cupom Ativo</Label>
                  <Switch 
                    checked={formData.active} 
                    onCheckedChange={checked => setFormData(prev => ({ ...prev, active: checked }))} 
                  />
                </div>

                <Button onClick={handleSubmit} disabled={isAdding || isUpdating} className="w-full">
                  {(isAdding || isUpdating) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingCoupon ? 'Salvar' : 'Criar Cupom'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cupons Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeCoupons.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.current_uses, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inativos/Expirados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{inactiveCoupons.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Cupons */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : coupons.length === 0 ? (
          <Card className="min-h-[200px] flex items-center justify-center">
            <CardContent className="text-center p-8">
              <Tag className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Nenhum Cupom</CardTitle>
              <p className="text-muted-foreground">Crie cupons para oferecer descontos aos clientes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map(coupon => (
              <Card key={coupon.id} className={!coupon.active || isExpired(coupon.valid_until) ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-lg font-bold">{coupon.code}</div>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleCopyCode(coupon.code)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(coupon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCoupon(coupon.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {coupon.discount_type === 'percent' ? (
                      <Badge className="bg-blue-500">
                        <Percent className="h-3 w-3 mr-1" />
                        {coupon.discount_value}% OFF
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500">
                        <DollarSign className="h-3 w-3 mr-1" />
                        R$ {coupon.discount_value.toFixed(2)} OFF
                      </Badge>
                    )}
                    {coupon.active && !isExpired(coupon.valid_until) ? (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />{isExpired(coupon.valid_until) ? 'Expirado' : 'Inativo'}
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    {coupon.min_purchase > 0 && (
                      <p>Mínimo: R$ {coupon.min_purchase.toFixed(2)}</p>
                    )}
                    <p>Usos: {coupon.current_uses}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}</p>
                    {(coupon.valid_from || coupon.valid_until) && (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {coupon.valid_from && format(new Date(coupon.valid_from), 'dd/MM/yy', { locale: ptBR })}
                        {coupon.valid_from && coupon.valid_until && ' - '}
                        {coupon.valid_until && format(new Date(coupon.valid_until), 'dd/MM/yy', { locale: ptBR })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Status</span>
                    <Switch 
                      checked={coupon.active} 
                      onCheckedChange={() => toggleCouponStatus(coupon)}
                      disabled={isUpdating}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Coupons;
