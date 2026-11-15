import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { endSupportImpersonation, readSupportImpersonation } from '@/lib/platformImpersonation';

const SupportImpersonationBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ending, setEnding] = useState(false);
  const state = readSupportImpersonation();

  if (!state || user?.id !== state.targetUserId) return null;

  const stop = async () => {
    setEnding(true);
    try {
      const { auditRecorded } = await endSupportImpersonation();
      toast({
        title: 'Acesso de suporte encerrado',
        description: auditRecorded ? 'Você voltou ao Super Admin e a ação foi registrada.' : 'Você voltou ao Super Admin; o registro de encerramento não foi confirmado.',
        variant: auditRecorded ? 'default' : 'destructive',
      });
      navigate('/superadmin/companies', { replace: true });
    } catch (error) {
      toast({ title: 'Não foi possível encerrar o acesso', description: error instanceof Error ? error.message : 'Entre novamente no VIZZU.', variant: 'destructive' });
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[80] flex min-h-14 items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-amber-950 shadow-md dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <div className="flex min-w-0 items-center gap-2 text-sm"><Eye className="h-4 w-4 shrink-0" /><span className="truncate"><strong>Modo suporte:</strong> você está vendo como {state.companyName}.</span></div>
      <Button size="sm" variant="outline" className="shrink-0 border-amber-400 bg-transparent text-inherit hover:bg-amber-100 dark:hover:bg-amber-900" onClick={() => void stop()} disabled={ending}>
        {ending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}Encerrar
      </Button>
    </div>
  );
};

export default SupportImpersonationBanner;
