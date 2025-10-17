import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AccountTransaction, AccountTransactionFormData, TransactionType } from '@/types/billing';
import { format } from 'date-fns';

interface BillingFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingTransaction: AccountTransaction | null;
  saveTransaction: (formData: AccountTransactionFormData, id: string | null) => Promise<void>;
  initialType?: TransactionType;
}

const BillingFormDialog: React.FC<BillingFormDialogProps> = ({
  isOpen,
  setIsOpen,
  editingTransaction,
  saveTransaction,
  initialType = 'payable',
}) => {
  const defaultFormData: AccountTransactionFormData = {
    description: "",
    amount: "",
    type: initialType,
    due_date: format(new Date(), 'yyyy-MM-dd'),
    category: "",
  };

  const [formData, setFormData] = useState<AccountTransactionFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        description: editingTransaction.description,
        amount: editingTransaction.amount.toFixed(2),
        type: editingTransaction.type,
        due_date: editingTransaction.due_date,
        category: editingTransaction.category || "",
      });
    } else {
      setFormData({
        ...defaultFormData,
        type: initialType,
        due_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [editingTransaction, isOpen, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveTransaction(formData, editingTransaction?.id || null);
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Aluguel, Salário, Serviço de Corte"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: TransactionType) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payable">A Pagar</SelectItem>
                <SelectItem value="receivable">A Receber</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date">Data de Vencimento/Recebimento</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria (Opcional)</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Ex: Despesa Fixa, Venda, Salário"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillingFormDialog;