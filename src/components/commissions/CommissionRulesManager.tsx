import React, { useState } from 'react';
import { Plus, Pencil, Trash2, User, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCommissionRules, CommissionRuleFormData } from '@/hooks/useCommissionRules';
import { Barber, Service } from '@/types/appointments';

interface CommissionRulesManagerProps {
  barbers: Barber[];
  services: Service[];
}

const CommissionRulesManager: React.FC<CommissionRulesManagerProps> = ({
  barbers,
  services
}) => {
  const { rules, isLoading, addRule, updateRule, deleteRule, isAdding, isUpdating, isDeleting } = useCommissionRules();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommissionRuleFormData>({
    barber_id: null,
    service_id: null,
    commission_type: 'percentage',
    commission_value: 40
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      barber_id: null,
      service_id: null,
      commission_type: 'percentage',
      commission_value: 40
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRule(ruleId);
      setFormData({
        barber_id: rule.barber_id,
        service_id: rule.service_id,
        commission_type: rule.commission_type as 'percentage' | 'fixed',
        commission_value: rule.commission_value
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingRule) {
        await updateRule({ id: editingRule, formData });
      } else {
        await addRule(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      await deleteRule(id);
    }
  };

  const getBarberName = (barberId: string | null) => {
    if (!barberId) return null;
    return barbers.find(b => b.id === barberId)?.full_name || 'Barbeiro desconhecido';
  };

  const getServiceName = (serviceId: string | null) => {
    if (!serviceId) return null;
    return services.find(s => s.id === serviceId)?.name || 'Serviço desconhecido';
  };

  const getRuleDescription = (rule: typeof rules[0]) => {
    const barberName = getBarberName(rule.barber_id);
    const serviceName = getServiceName(rule.service_id);
    
    if (barberName && serviceName) {
      return `${barberName} + ${serviceName}`;
    }
    
    if (barberName) {
      return `Todos os serviços de ${barberName}`;
    }
    
    if (serviceName) {
      return `${serviceName} para todos os barbeiros`;
    }
    
    return 'Regra personalizada';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Regras de Comissão</CardTitle>
            <CardDescription>
              Configure comissões personalizadas por barbeiro e/ou serviço
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Regra
          </Button>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma regra configurada.</p>
              <p className="text-sm">A comissão padrão de 40% será aplicada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {rule.barber_id && (
                          <Badge variant="outline" className="gap-1">
                            <User className="h-3 w-3" />
                            {getBarberName(rule.barber_id)}
                          </Badge>
                        )}
                        {rule.service_id && (
                          <Badge variant="outline" className="gap-1">
                            <Scissors className="h-3 w-3" />
                            {getServiceName(rule.service_id)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getRuleDescription(rule)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {rule.commission_type === 'percentage' 
                          ? `${rule.commission_value}%`
                          : formatCurrency(rule.commission_value)
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rule.commission_type === 'percentage' ? 'Percentual' : 'Valor fixo'}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(rule.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Editar Regra' : 'Nova Regra de Comissão'}
            </DialogTitle>
            <DialogDescription>
              Configure a comissão para barbeiros e/ou serviços específicos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Barber Selection */}
            <div className="space-y-2">
              <Label>Barbeiro (opcional)</Label>
              <Select
                value={formData.barber_id || 'all'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  barber_id: value === 'all' ? null : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os barbeiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os barbeiros</SelectItem>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <Label>Serviço (opcional)</Label>
              <Select
                value={formData.service_id || 'all'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  service_id: value === 'all' ? null : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Commission Type */}
            <div className="space-y-2">
              <Label>Tipo de Comissão</Label>
              <Select
                value={formData.commission_type}
                onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ 
                  ...prev, 
                  commission_type: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission Value */}
            <div className="space-y-2">
              <Label>
                {formData.commission_type === 'percentage' ? 'Percentual' : 'Valor'}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={formData.commission_type === 'percentage' ? 100 : undefined}
                  step={formData.commission_type === 'percentage' ? 1 : 0.01}
                  value={formData.commission_value}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    commission_value: parseFloat(e.target.value) || 0 
                  }))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {formData.commission_type === 'percentage' ? '%' : 'R$'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isAdding || isUpdating}
            >
              {isAdding || isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommissionRulesManager;
