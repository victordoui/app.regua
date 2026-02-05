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
import type { CouponFormData, PlanType } from '@/types/superAdmin';
import { Plus, Ticket, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PlatformCoupons = () => {
  const { coupons, isLoading, createCoupon, updateCoupon, deleteCoupon, isCreating } =
    usePlatformCoupons();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: null,
    max_uses: null,
    applicable_plans: ['basic', 'pro', 'enterprise'],
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCoupon(formData);
    setIsDialogOpen(false);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      max_uses: null,
      applicable_plans: ['basic', 'pro', 'enterprise'],
      active: true,
    });
  };

  const toggleCouponActive = (id: string, currentActive: boolean) => {
    updateCoupon({ id, data: { active: !currentActive } });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cupons da Plataforma</h1>
            <p className="text-muted-foreground">
              Gerencie cupons de desconto globais para assinaturas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Cupom</DialogTitle>
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

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Cupom'}
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
                          : `R$ ${coupon.discount_value.toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        {coupon.current_uses}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(coupon.valid_from), 'dd/MM/yyyy', { locale: ptBR })}
                        {coupon.valid_until &&
                          ` - ${format(new Date(coupon.valid_until), 'dd/MM/yyyy', { locale: ptBR })}`}
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
                            onClick={() => toggleCouponActive(coupon.id, coupon.active)}
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
