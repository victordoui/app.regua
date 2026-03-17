import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Plus, Clock, Calendar, User, Percent, Trash2 } from 'lucide-react';
import { useDynamicPricing, PricingRule, CreatePricingRuleInput } from '@/hooks/useDynamicPricing';
import { useServices } from '@/hooks/useServices';
import { useBarbers } from '@/hooks/useBarbers';
import { format } from 'date-fns';

const DAYS_OF_WEEK = [{ value: '0', label: 'Domingo' }, { value: '1', label: 'Segunda' }, { value: '2', label: 'Terça' }, { value: '3', label: 'Quarta' }, { value: '4', label: 'Quinta' }, { value: '5', label: 'Sexta' }, { value: '6', label: 'Sábado' }];
const RULE_TYPES = [{ value: 'time_based', label: 'Por Horário', icon: Clock }, { value: 'day_based', label: 'Por Dia', icon: Calendar }, { value: 'barber_based', label: 'Por Barbeiro', icon: User }, { value: 'promo', label: 'Promoção', icon: Percent }];

const PricingRuleForm = ({ onSubmit, onClose }: { onSubmit: (data: CreatePricingRuleInput) => void; onClose: () => void }) => {
  const { services } = useServices(); const { barbers } = useBarbers();
  const [formData, setFormData] = useState<CreatePricingRuleInput>({ name: '', rule_type: 'time_based', price_modifier_type: 'percentage', price_modifier_value: 0, start_time: '', end_time: '', valid_from: '', valid_until: '', priority: 0 });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); onClose(); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="text-sm font-medium">Nome *</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
      <div><label className="text-sm font-medium">Tipo *</label><Select value={formData.rule_type} onValueChange={(v: any) => setFormData({ ...formData, rule_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RULE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-medium">Modificador</label><Select value={formData.price_modifier_type} onValueChange={(v: any) => setFormData({ ...formData, price_modifier_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed">R$</SelectItem></SelectContent></Select></div>
        <div><label className="text-sm font-medium">Valor *</label><Input type="number" value={formData.price_modifier_value} onChange={(e) => setFormData({ ...formData, price_modifier_value: Number(e.target.value) })} required /><p className="text-xs text-muted-foreground mt-1">Negativo = desconto</p></div>
      </div>
      {(formData.rule_type === 'time_based' || formData.rule_type === 'promo') && <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Início</label><Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} /></div><div><label className="text-sm font-medium">Fim</label><Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} /></div></div>}
      {formData.rule_type === 'day_based' && <div><label className="text-sm font-medium">Dia</label><Select value={formData.day_of_week?.toString()} onValueChange={(v) => setFormData({ ...formData, day_of_week: Number(v) })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select></div>}
      {formData.rule_type === 'barber_based' && <div><label className="text-sm font-medium">Barbeiro</label><Select value={formData.barber_id} onValueChange={(v) => setFormData({ ...formData, barber_id: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.full_name}</SelectItem>)}</SelectContent></Select></div>}
      <div><label className="text-sm font-medium">Serviço (opcional)</label><Select value={formData.service_id || 'all'} onValueChange={(v) => setFormData({ ...formData, service_id: v === 'all' ? undefined : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></div>
    </form>
  );
};

const DynamicPricingContent = () => {
  const { pricingRules, isLoading, createRule, toggleRule, deleteRule } = useDynamicPricing();
  const { services } = useServices(); const { barbers } = useBarbers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activeRules = pricingRules.filter(r => r.active);
  const inactiveRules = pricingRules.filter(r => !r.active);

  const getRuleTypeInfo = (type: string) => RULE_TYPES.find(t => t.value === type);
  const getModifier = (rule: PricingRule) => { const sign = rule.price_modifier_value >= 0 ? '+' : ''; return rule.price_modifier_type === 'percentage' ? `${sign}${rule.price_modifier_value}%` : `${sign}R$ ${Math.abs(rule.price_modifier_value).toFixed(2)}`; };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Regra</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Criar Regra de Preço</DialogTitle></DialogHeader><PricingRuleForm onSubmit={(data) => createRule.mutate(data)} onClose={() => setIsDialogOpen(false)} /></DialogContent></Dialog>
      </div>

      <Card className="bg-muted/50"><CardHeader><CardTitle className="text-sm">💡 Exemplos</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div className="p-3 bg-background rounded-lg"><p className="font-medium">Happy Hour</p><p className="text-muted-foreground">-20% entre 14h-16h</p></div><div className="p-3 bg-background rounded-lg"><p className="font-medium">Horário de Pico</p><p className="text-muted-foreground">+15% entre 18h-20h</p></div><div className="p-3 bg-background rounded-lg"><p className="font-medium">Promoção Segunda</p><p className="text-muted-foreground">-25% às segundas</p></div></CardContent></Card>

      {isLoading ? <div className="text-center py-12"><p className="text-muted-foreground">Carregando...</p></div> : pricingRules.length === 0 ? <Card className="p-12 text-center"><TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Nenhuma regra criada ainda</p></Card> : (
        <div className="space-y-6">
          {activeRules.length > 0 && <div><h2 className="text-lg font-semibold mb-4">Ativas ({activeRules.length})</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{activeRules.map(rule => { const rt = getRuleTypeInfo(rule.rule_type); return (
            <Card key={rule.id}><CardContent className="p-4"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2">{rt && <rt.icon className="h-5 w-5 text-primary" />}<h3 className="font-semibold">{rule.name}</h3></div><Switch checked={rule.active} onCheckedChange={(active) => toggleRule.mutate({ id: rule.id, active })} /></div><Badge variant={rule.price_modifier_value >= 0 ? 'destructive' : 'secondary'}>{getModifier(rule)}</Badge><div className="flex justify-end mt-4"><Button variant="ghost" size="sm" onClick={() => deleteRule.mutate(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></CardContent></Card>
          ); })}</div></div>}
          {inactiveRules.length > 0 && <div><h2 className="text-lg font-semibold mb-4 text-muted-foreground">Inativas ({inactiveRules.length})</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{inactiveRules.map(rule => { const rt = getRuleTypeInfo(rule.rule_type); return (
            <Card key={rule.id} className="opacity-60"><CardContent className="p-4"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2">{rt && <rt.icon className="h-5 w-5 text-primary" />}<h3 className="font-semibold">{rule.name}</h3></div><Switch checked={rule.active} onCheckedChange={(active) => toggleRule.mutate({ id: rule.id, active })} /></div><Badge variant="secondary">{getModifier(rule)}</Badge><div className="flex justify-end mt-4"><Button variant="ghost" size="sm" onClick={() => deleteRule.mutate(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></CardContent></Card>
          ); })}</div></div>}
        </div>
      )}
    </div>
  );
};

export default DynamicPricingContent;
