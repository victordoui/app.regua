import { useState } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlanConfig } from '@/hooks/superadmin/usePlanConfig';
import { Settings, Pencil, Check, X } from 'lucide-react';
import type { PlanConfig, PlanConfigFormData } from '@/types/superAdmin';

const PLAN_COLORS: Record<string, string> = {
  trial: 'border-l-slate-400',
  basic: 'border-l-blue-500',
  pro: 'border-l-purple-500',
  enterprise: 'border-l-amber-500',
};

const FEATURE_LABELS: Record<string, string> = {
  basic_scheduling: 'Agendamento Básico',
  client_management: 'Gestão de Clientes',
  reports: 'Relatórios',
  loyalty: 'Programa de Fidelidade',
  campaigns: 'Campanhas de Marketing',
  api_access: 'Acesso à API',
  priority_support: 'Suporte Prioritário',
  white_label: 'White Label',
  multi_location: 'Múltiplas Unidades',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const PlanConfiguration = () => {
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [formData, setFormData] = useState<PlanConfigFormData | null>(null);

  const { plans, isLoading, updatePlanConfig, togglePlanActive, isUpdating } = usePlanConfig();

  const handleEdit = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setFormData({
      display_name: plan.display_name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_barbers: plan.max_barbers,
      max_appointments_month: plan.max_appointments_month,
      features: plan.features,
      is_active: plan.is_active,
    });
  };

  const handleSave = () => {
    if (!editingPlan || !formData) return;
    updatePlanConfig({ planType: editingPlan.plan_type, data: formData });
    setEditingPlan(null);
    setFormData(null);
  };

  const toggleFeature = (feature: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: !formData.features[feature],
      },
    });
  };

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planos e Preços</h1>
          <p className="text-muted-foreground">
            Configure os planos da plataforma, preços e recursos
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={`border-l-4 ${PLAN_COLORS[plan.plan_type]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {!plan.is_active && (
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(plan.price_monthly)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                  {plan.price_yearly && (
                    <p className="text-sm text-muted-foreground">
                      ou {formatCurrency(plan.price_yearly)}/ano
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{plan.max_barbers}</strong> barbeiros
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{plan.max_appointments_month}</strong> agendamentos/mês
                  </p>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">RECURSOS</p>
                  <div className="space-y-1">
                    {Object.entries(plan.features || {}).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center gap-2 text-xs">
                        {enabled ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>
                          {FEATURE_LABELS[feature] || feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Ativo</span>
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={(checked) =>
                      togglePlanActive({ planType: plan.plan_type, isActive: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Editar Plano: {editingPlan?.display_name}
              </DialogTitle>
            </DialogHeader>
            {formData && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome de Exibição</label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Mensal (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price_monthly}
                      onChange={(e) =>
                        setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Anual (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price_yearly || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_yearly: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Máx. Barbeiros</label>
                    <Input
                      type="number"
                      value={formData.max_barbers}
                      onChange={(e) =>
                        setFormData({ ...formData, max_barbers: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Máx. Agendamentos/Mês</label>
                    <Input
                      type="number"
                      value={formData.max_appointments_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_appointments_month: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Recursos</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(FEATURE_LABELS).map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.features[feature] || false}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <label htmlFor={feature} className="text-sm">
                          {FEATURE_LABELS[feature]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm">Plano ativo</label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingPlan(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isUpdating}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
};

export default PlanConfiguration;
