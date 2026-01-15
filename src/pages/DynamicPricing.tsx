import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Plus, Clock, Calendar, User, Percent, DollarSign, Trash2, Edit } from 'lucide-react';
import { useDynamicPricing, PricingRule, CreatePricingRuleInput } from '@/hooks/useDynamicPricing';
import { useServices } from '@/hooks/useServices';
import { useBarbers } from '@/hooks/useBarbers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DAYS_OF_WEEK = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda' },
  { value: '2', label: 'Terça' },
  { value: '3', label: 'Quarta' },
  { value: '4', label: 'Quinta' },
  { value: '5', label: 'Sexta' },
  { value: '6', label: 'Sábado' }
];

const RULE_TYPES = [
  { value: 'time_based', label: 'Por Horário', icon: Clock },
  { value: 'day_based', label: 'Por Dia da Semana', icon: Calendar },
  { value: 'barber_based', label: 'Por Barbeiro', icon: User },
  { value: 'promo', label: 'Promoção', icon: Percent }
];

const PricingRuleForm = ({ 
  onSubmit, 
  onClose,
  initialData 
}: { 
  onSubmit: (data: CreatePricingRuleInput) => void; 
  onClose: () => void;
  initialData?: Partial<PricingRule>;
}) => {
  const { services } = useServices();
  const { barbers } = useBarbers();
  
  const [formData, setFormData] = useState<CreatePricingRuleInput>({
    name: initialData?.name || '',
    rule_type: initialData?.rule_type || 'time_based',
    service_id: initialData?.service_id || undefined,
    barber_id: initialData?.barber_id || undefined,
    day_of_week: initialData?.day_of_week ?? undefined,
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    price_modifier_type: initialData?.price_modifier_type || 'percentage',
    price_modifier_value: initialData?.price_modifier_value || 0,
    valid_from: initialData?.valid_from || '',
    valid_until: initialData?.valid_until || '',
    priority: initialData?.priority || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome da Regra *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Happy Hour, Promoção Segunda..."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tipo de Regra *</label>
        <Select
          value={formData.rule_type}
          onValueChange={(value: PricingRule['rule_type']) => setFormData({ ...formData, rule_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RULE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Modificador</label>
          <Select
            value={formData.price_modifier_type}
            onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, price_modifier_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Porcentagem (%)</SelectItem>
              <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Valor *</label>
          <Input
            type="number"
            value={formData.price_modifier_value}
            onChange={(e) => setFormData({ ...formData, price_modifier_value: Number(e.target.value) })}
            placeholder={formData.price_modifier_type === 'percentage' ? '+10 ou -20' : '+5 ou -10'}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use valores negativos para desconto
          </p>
        </div>
      </div>

      {(formData.rule_type === 'time_based' || formData.rule_type === 'promo') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Horário Início</label>
            <Input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Horário Fim</label>
            <Input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>
        </div>
      )}

      {formData.rule_type === 'day_based' && (
        <div>
          <label className="text-sm font-medium">Dia da Semana</label>
          <Select
            value={formData.day_of_week?.toString()}
            onValueChange={(value) => setFormData({ ...formData, day_of_week: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o dia" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map(day => (
                <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.rule_type === 'barber_based' && (
        <div>
          <label className="text-sm font-medium">Barbeiro</label>
          <Select
            value={formData.barber_id}
            onValueChange={(value) => setFormData({ ...formData, barber_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o barbeiro" />
            </SelectTrigger>
            <SelectContent>
              {barbers.map(barber => (
                <SelectItem key={barber.id} value={barber.id}>{barber.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Serviço (opcional)</label>
        <Select
          value={formData.service_id || 'all'}
          onValueChange={(value) => setFormData({ ...formData, service_id: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os serviços" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {services.map(service => (
              <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Válido de</label>
          <Input
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Válido até</label>
          <Input
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Prioridade</label>
        <Input
          type="number"
          min="0"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Regras com maior prioridade são aplicadas primeiro
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar Regra</Button>
      </div>
    </form>
  );
};

const PricingRuleCard = ({ rule, onToggle, onDelete }: { 
  rule: PricingRule; 
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) => {
  const { services } = useServices();
  const { barbers } = useBarbers();

  const ruleType = RULE_TYPES.find(t => t.value === rule.rule_type);
  const service = services.find(s => s.id === rule.service_id);
  const barber = barbers.find(b => b.id === rule.barber_id);

  const getModifierDisplay = () => {
    const sign = rule.price_modifier_value >= 0 ? '+' : '';
    if (rule.price_modifier_type === 'percentage') {
      return `${sign}${rule.price_modifier_value}%`;
    }
    return `${sign}R$ ${Math.abs(rule.price_modifier_value).toFixed(2)}`;
  };

  return (
    <Card className={`${!rule.active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {ruleType && <ruleType.icon className="h-5 w-5 text-primary" />}
            <h3 className="font-semibold">{rule.name}</h3>
          </div>
          <Switch checked={rule.active} onCheckedChange={onToggle} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={rule.price_modifier_value >= 0 ? 'destructive' : 'secondary'}>
              {getModifierDisplay()}
            </Badge>
            {rule.priority > 0 && (
              <Badge variant="outline">Prioridade: {rule.priority}</Badge>
            )}
          </div>

          <div className="text-muted-foreground space-y-1">
            {rule.day_of_week !== null && (
              <p>📅 {DAYS_OF_WEEK.find(d => d.value === rule.day_of_week?.toString())?.label}</p>
            )}
            {rule.start_time && rule.end_time && (
              <p>🕐 {rule.start_time} - {rule.end_time}</p>
            )}
            {service && <p>✂️ {service.name}</p>}
            {barber && <p>👤 {barber.full_name}</p>}
            {rule.valid_from && rule.valid_until && (
              <p>📆 {format(new Date(rule.valid_from), 'dd/MM/yyyy')} - {format(new Date(rule.valid_until), 'dd/MM/yyyy')}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const DynamicPricing = () => {
  const { pricingRules, isLoading, createRule, toggleRule, deleteRule } = useDynamicPricing();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = (data: CreatePricingRuleInput) => {
    createRule.mutate(data);
  };

  const activeRules = pricingRules.filter(r => r.active);
  const inactiveRules = pricingRules.filter(r => !r.active);

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Preços Dinâmicos
            </h1>
            <p className="text-muted-foreground">
              Configure regras de preço por horário, dia da semana ou barbeiro
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Regra de Preço</DialogTitle>
              </DialogHeader>
              <PricingRuleForm onSubmit={handleCreate} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Example Rules */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">💡 Exemplos de Regras</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium">Happy Hour</p>
              <p className="text-muted-foreground">-20% entre 14h-16h</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium">Horário de Pico</p>
              <p className="text-muted-foreground">+15% entre 18h-20h</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="font-medium">Promoção Segunda</p>
              <p className="text-muted-foreground">-25% às segundas-feiras</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Rules */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : pricingRules.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma regra de preço criada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie regras para oferecer descontos ou ajustar preços automaticamente
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeRules.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Regras Ativas ({activeRules.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeRules.map(rule => (
                    <PricingRuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={(active) => toggleRule.mutate({ id: rule.id, active })}
                      onDelete={() => deleteRule.mutate(rule.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveRules.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Regras Inativas ({inactiveRules.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveRules.map(rule => (
                    <PricingRuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={(active) => toggleRule.mutate({ id: rule.id, active })}
                      onDelete={() => deleteRule.mutate(rule.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DynamicPricing;
