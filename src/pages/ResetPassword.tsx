import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import vizzuIcon from '@/assets/vizzu-icon.png';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsRecoverySession(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setIsRecoverySession(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (password.length < 8) {
      toast({ title: 'Senha muito curta', description: 'Use pelo menos 8 caracteres.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', description: 'Confira os dois campos.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Senha atualizada', description: 'Entre com sua nova senha para continuar.' });
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: unknown) {
      toast({
        title: 'Não foi possível atualizar a senha',
        description: error instanceof Error ? error.message : 'Solicite um novo link de recuperação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={vizzuIcon} alt="VIZZU" className="mx-auto mb-3 h-14 w-14 object-contain" />
          <CardTitle>Redefinir sua senha</CardTitle>
          <CardDescription>
            {isRecoverySession ? 'Crie uma nova senha para recuperar o acesso.' : 'Abra o link enviado por e-mail para redefinir sua senha.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRecoverySession ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="new-password">Nova senha (mín. 8 caracteres)</label>
                <Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirm-password">Confirmar nova senha</label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Salvar nova senha
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Voltar para o login
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPassword;
