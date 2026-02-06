import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Check, ArrowRight, ArrowLeft, Loader2, Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanConfig } from '@/types/superAdmin';

type Step = 1 | 2 | 3;

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<PlanConfig[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
    selectedPlan: 'trial' as string,
  });

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setPlans(data as unknown as PlanConfig[]);
    };
    fetchPlans();

    // Pre-select plan from URL query param
    const searchParams = new URLSearchParams(window.location.search);
    const preSelectedPlan = searchParams.get('plano');
    if (preSelectedPlan) {
      setFormData(f => ({ ...f, selectedPlan: preSelectedPlan }));
    }
  }, []);

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { emailRedirectTo: redirectUrl },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar conta');

      // Call the atomic function to set up profile + role + subscription
      const { error: rpcError } = await supabase.rpc('create_subscriber_with_subscription', {
        _user_id: authData.user.id,
        _display_name: formData.fullName,
        _email: formData.email,
        _plan_type: formData.selectedPlan,
        _company_name: formData.companyName,
      });

      if (rpcError) throw rpcError;

      toast({ title: 'Conta criada com sucesso! 🎉', description: 'Redirecionando para o onboarding...' });
      setTimeout(() => navigate('/onboarding'), 1500);
    } catch (error: any) {
      const message = error.message?.includes('already registered')
        ? 'Este email já está cadastrado. Tente fazer login.'
        : error.message;
      toast({ title: 'Erro ao criar conta', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 =
    formData.fullName.trim() &&
    formData.companyName.trim() &&
    formData.email.trim() &&
    formData.password.length >= 6;

  const planIcons: Record<string, React.ReactNode> = {
    trial: <Zap className="h-6 w-6" />,
    basic: <Star className="h-6 w-6" />,
    pro: <Crown className="h-6 w-6" />,
    enterprise: <Scissors className="h-6 w-6" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 mb-4">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Na Régua</h1>
          <p className="text-muted-foreground mt-1">Crie sua conta e comece a gerenciar sua barbearia</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn('w-12 h-0.5', step > s ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Account */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados da Conta</CardTitle>
              <CardDescription>Preencha seus dados para criar sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Seu nome"
                    value={formData.fullName}
                    onChange={(e) => setFormData((f) => ({ ...f, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da barbearia</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: Barbearia do João"
                    value={formData.companyName}
                    onChange={(e) => setFormData((f) => ({ ...f, companyName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha (mín. 6 caracteres)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <button onClick={() => navigate('/login')} className="text-primary hover:underline">
                  Fazer login
                </button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose plan */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escolha seu Plano</CardTitle>
                <CardDescription>Selecione o plano ideal para sua barbearia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setFormData((f) => ({ ...f, selectedPlan: plan.plan_type }))}
                      className={cn(
                        'relative p-4 rounded-xl border-2 text-left transition-all',
                        formData.selectedPlan === plan.plan_type
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      {plan.plan_type === 'pro' && (
                        <Badge className="absolute -top-2 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          Popular
                        </Badge>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          formData.selectedPlan === plan.plan_type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          {planIcons[plan.plan_type] || <Star className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{plan.display_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.plan_type === 'trial' ? 'Grátis por 14 dias' : `R$ ${plan.price_monthly}/mês`}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Até {plan.max_barbers} barbeiro{plan.max_barbers > 1 ? 's' : ''}</p>
                        <p>• {plan.max_appointments_month} agendamentos/mês</p>
                      </div>
                      {formData.selectedPlan === plan.plan_type && (
                        <div className="absolute top-3 left-3">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Confirmar Cadastro</CardTitle>
                <CardDescription>Revise seus dados antes de criar sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium text-foreground">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barbearia:</span>
                    <span className="font-medium text-foreground">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano:</span>
                    <Badge variant="outline">
                      {plans.find((p) => p.plan_type === formData.selectedPlan)?.display_name || formData.selectedPlan}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Ao criar sua conta, você concorda com os Termos de Uso e Política de Privacidade da Na Régua.
                </p>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleSignup} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Criar Minha Conta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
