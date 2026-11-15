import { formatBusinessDateInput, formatCurrency } from '@/lib/formatters';
import { useState } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePlatformCoupons } from '@/hooks/useSuperAdmin';
import type { CouponFormData, PlatformCoupon } from '@/types/superAdmin';
import { Plus, Ticket, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const todayInputValue = () => formatBusinessDateInput();

const formatDateOnly = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return format(new Date(year, month - 1, day, 12), 'dd/MM/yyyy', { locale: ptBR });
};

const PlatformCoupons = () => {
  const { coupons, isLoading, createCoupon, updateCoupon, deleteCoupon, isCreating, isUpdating } =
    usePlatformCoupons();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<PlatformCoupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    valid_from: todayInputValue(),
    valid_until: null,
    max_uses: null,
    applicable_plans: ['basic', 'pro', 'enterprise'],
    active: true,
  });

  const resetForm = () => setFormData({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    valid_from: todayInputValue(),
    valid_until: null,
    max_uses: null,
    applicable_plans: ['basic', 'pro', 'enterprise'],
    active: true,
  });

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCoupon(null);
      resetForm();
    }
  };

  const startEditingCoupon = (coupon: PlatformCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      valid_from: coupon.valid_from?.slice(0, 10) || todayInputValue(),
      valid_until: coupon.valid_until?.slice(0, 10) || null,
      max_uses: coupon.max_uses,
      applicable_plans: coupon.applicable_plans || ['basic', 'pro', 'enterprise'],
      active: coupon.active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) updateCoupon({ id: editingCoupon.id, data: formData });
    else createCoupon(formData);
    setIsDialogOpen(false);
    setEditingCoupon(null);
    resetForm();
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
          <PageHeader eyebrow="Gestão da plataforma" title="Cupons da Plataforma" />
            <p className="text-muted-foreground">
              Gerencie cupons de desconto globais para assinaturas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Criar Cupom'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código do Cupom</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="DESCONTO20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="20% de desconto na primeira mensalidade"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setFormData({ ...formData, discount_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem</SelectItem>
                        <SelectItem value="fixed">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_value: Number(e.target.value) })
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valid_from">Válido de</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valid_until">Válido até</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, valid_until: e.target.value || null })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses">Máximo de Usos (deixe vazio para ilimitado)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_uses: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Cupom Ativo</Label>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Salvando...' : editingCoupon ? 'Salvar alterações' : 'Criar Cupom'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Cupons ({coupons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Ticket className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum cupom criado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                      <TableCell>
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `${formatCurrency(coupon.discount_value)}`}
                      </TableCell>
                      <TableCell>
                        {coupon.current_uses}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                      </TableCell>
                      <TableCell>
                        {coupon.valid_from ? formatDateOnly(coupon.valid_from) : '—'}
                        {coupon.valid_until &&
                          ` - ${formatDateOnly(coupon.valid_until)}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.active ? 'default' : 'secondary'}>
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditingCoupon(coupon)}
                            aria-label={`Editar cupom ${coupon.code}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteCoupon(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default PlatformCoupons;
import { PageHeader } from '@/components/ui/page-header';
