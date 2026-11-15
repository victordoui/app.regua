import { useMemo, useState } from 'react';
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
import { usePlatformUsers } from '@/hooks/superadmin/usePlatformUsers';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { PlanType } from '@/types/superAdmin';
import type { Json } from '@/integrations/supabase/types';
import { UserPlus, Loader2 } from 'lucide-react';
import { businessDateTimeToISOString, formatBusinessDateInput } from '@/lib/formatters';

interface NewSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSubscriberDialog = ({ open, onOpenChange }: NewSubscriberDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: platformUserData, isLoading: usersLoading } = usePlatformUsers(open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: 'trial' as PlanType,
    start_date: formatBusinessDateInput(),
    end_date: '',
    notes: '',
  });

  const selectedUser = platformUserData?.users.find((candidate) => candidate.user_id === formData.user_id);
  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term || !platformUserData?.users) return [];
    return platformUserData.users.filter((candidate) =>
      [candidate.display_name, candidate.email, candidate.company_name]
        .some((value) => value?.toLowerCase().includes(term)),
    ).slice(0, 8);
  }, [platformUserData?.users, userSearch]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setUserSearch('');
      setFormData((current) => ({ ...current, user_id: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.user_id.trim()) {
      toast({ title: 'Selecione o usuário ou a empresa', variant: 'destructive' });
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
          start_date: formData.start_date ? businessDateTimeToISOString(formData.start_date) : null,
          end_date: formData.end_date ? businessDateTimeToISOString(formData.end_date, '23:59:59') : null,
          max_barbers: planConfig?.max_barbers ?? 3,
          max_appointments_month: planConfig?.max_appointments_month ?? 100,
          features: planConfig?.features || {},
          notes: formData.notes || null,
        });

      if (error) throw error;

      // Audit log
      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'activate_subscription',
        target_user_id: formData.user_id,
        details: { plan_type: formData.plan_type, manual: true } as Json,
      }]);

      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      toast({ title: 'Assinante criado com sucesso!' });
      onOpenChange(false);
      setFormData({
        user_id: '',
        plan_type: 'trial',
        start_date: formatBusinessDateInput(),
        end_date: '',
        notes: '',
      });
      setUserSearch('');
    } catch (error: unknown) {
      toast({
        title: 'Erro ao criar assinante',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Assinante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-search">Usuário ou empresa</Label>
            <Input
              id="user-search"
              placeholder="Buscar por nome, empresa ou e-mail"
              value={selectedUser ? `${selectedUser.company_name || selectedUser.display_name || 'Conta'} · ${selectedUser.email || 'sem e-mail'}` : userSearch}
              onChange={(e) => {
                if (selectedUser) setFormData((f) => ({ ...f, user_id: '' }));
                setUserSearch(e.target.value);
              }}
              autoComplete="off"
            />
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{selectedUser.company_name || selectedUser.display_name || 'Conta sem nome'}</p>
                  <p className="truncate text-xs text-muted-foreground">{selectedUser.display_name} · {selectedUser.email || 'sem e-mail'}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => {
                  setFormData((f) => ({ ...f, user_id: '' }));
                  setUserSearch('');
                }}>Trocar</Button>
              </div>
            ) : userSearch.trim() ? (
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-popover">
                {usersLoading ? <p className="p-3 text-sm text-muted-foreground">Carregando contas…</p> : filteredUsers.length ? filteredUsers.map((candidate) => (
                  <button key={candidate.user_id} type="button" className="block w-full border-b p-3 text-left last:border-0 hover:bg-accent" onClick={() => {
                    setFormData((f) => ({ ...f, user_id: candidate.user_id }));
                    setUserSearch('');
                  }}>
                    <span className="block truncate text-sm font-medium">{candidate.company_name || candidate.display_name || 'Conta sem nome'}</span>
                    <span className="block truncate text-xs text-muted-foreground">{candidate.display_name} · {candidate.email || 'sem e-mail'}</span>
                  </button>
                )) : <p className="p-3 text-sm text-muted-foreground">Nenhuma conta encontrada.</p>}
              </div>
            ) : <p className="text-xs text-muted-foreground">Digite para localizar o dono da empresa e selecione uma conta.</p>}
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
                <SelectItem value="trial">Teste gratuito</SelectItem>
                <SelectItem value="basic">Essencial</SelectItem>
                <SelectItem value="pro">Profissional</SelectItem>
                <SelectItem value="enterprise">Premium</SelectItem>
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
