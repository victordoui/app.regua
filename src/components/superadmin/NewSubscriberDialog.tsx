import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { PlanType } from '@/types/superAdmin';
import { UserPlus, Loader2 } from 'lucide-react';

interface NewSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSubscriberDialog = ({ open, onOpenChange }: NewSubscriberDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: 'trial' as PlanType,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.user_id.trim()) {
      toast({ title: 'Informe o ID do usuário', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get plan config for limits
      const { data: planConfig } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('plan_type', formData.plan_type)
        .single();

      const { error } = await supabase
        .from('platform_subscriptions')
        .insert({
          user_id: formData.user_id,
          plan_type: formData.plan_type,
          status: 'active',
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          max_barbers: planConfig?.max_barbers || 3,
          max_appointments_month: planConfig?.max_appointments_month || 100,
          features: planConfig?.features || {},
          notes: formData.notes || null,
        });

      if (error) throw error;

      // Audit log
      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'activate_subscription',
        target_user_id: formData.user_id,
        details: { plan_type: formData.plan_type, manual: true } as any,
      }]);

      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast({ title: 'Assinante criado com sucesso!' });
      onOpenChange(false);
      setFormData({
        user_id: '',
        plan_type: 'trial',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar assinante',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Assinante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">ID do Usuário (UUID)</Label>
            <Input
              id="user_id"
              placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
              value={formData.user_id}
              onChange={(e) => setFormData((f) => ({ ...f, user_id: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Plano</Label>
            <Select
              value={formData.plan_type}
              onValueChange={(v) => setFormData((f) => ({ ...f, plan_type: v as PlanType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((f) => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((f) => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre este assinante..."
              value={formData.notes}
              onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Assinante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
