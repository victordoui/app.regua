import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlanFormData, SubscriptionPlan } from '@/types/subscriptions';

interface SubscriptionFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingPlan: SubscriptionPlan | null;
  savePlan: (formData: PlanFormData) => Promise<void>;
}

const SubscriptionFormDialog: React.FC<SubscriptionFormDialogProps> = ({ isOpen, setIsOpen, editingPlan, savePlan }) => {
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    description: "",
    price: "",
    billing_cycle: "monthly",
    features: [],
    active: true
  });

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        description: editingPlan.description,
        price: editingPlan.price.toString(),
        billing_cycle: editingPlan.billing_cycle,
        features: editingPlan.features,
        active: editingPlan.active
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        billing_cycle: "monthly",
        features: [],
        active: true
      });
    }
  }, [editingPlan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePlan(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="billing_cycle">Ciclo de Cobrança</Label>
            <Select value={formData.billing_cycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionFormDialog;