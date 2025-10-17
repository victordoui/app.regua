import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubscriptionFormData, Client, SubscriptionPlan } from '@/types/subscriptions';
import { format } from 'date-fns';

interface SubscriptionCreationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  createSubscription: (formData: SubscriptionFormData) => Promise<void>;
  clients: Client[];
  plans: SubscriptionPlan[];
}

const SubscriptionCreationDialog: React.FC<SubscriptionCreationDialogProps> = ({ isOpen, setIsOpen, createSubscription, clients, plans }) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    client_id: "",
    plan_id: "",
    start_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        client_id: "",
        plan_id: "",
        start_date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSubscription(formData);
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Assinatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="plan_id">Plano</Label>
            <Select value={formData.plan_id} onValueChange={(value) => setFormData(prev => ({ ...prev, plan_id: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.filter(plan => plan.active).map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (R$ {plan.price.toFixed(2)}/{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="start_date">Data de Início</Label>
            <Input
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionCreationDialog;