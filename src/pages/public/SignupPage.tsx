import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Check, ArrowRight, ArrowLeft, Loader2, Crown, Star, Zap, CreditCard, QrCode } from 'lucide-react';
import { cn, formatPhoneBR, formatNameOnly } from '@/lib/utils';
import PixPayment from '@/components/payments/PixPayment';
import type { PlanConfig } from '@/types/superAdmin';

type Step = 1 | 2 | 3 | 4;

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'pix' | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

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

    const searchParams = new URLSearchParams(window.location.search);
    const preSelectedPlan = searchParams.get('plano');
    if (preSelectedPlan) {
      setFormData(f => ({ ...f, selectedPlan: preSelectedPlan }));
    }

    // Handle payment cancellation
    if (searchParams.get('payment') === 'cancelled') {
      toast({ title: 'Pagamento cancelado', description: 'Você pode tentar novamente.', variant: 'destructive' });
    }
  }, []);

  const selectedPlanConfig = plans.find(p => p.plan_type === formData.selectedPlan);
  const isPaidPlan = formData.selectedPlan !== 'trial';
  const totalSteps = isPaidPlan ? 4 : 3;

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

      const { error: rpcError } = await supabase.rpc('create_subscriber_with_subscription', {
        _user_id: authData.user.id,
        _display_name: formData.fullName,
        _email: formData.email,
        _plan_type: formData.selectedPlan,
        _company_name: formData.companyName,
      });

      if (rpcError) throw rpcError;

      setAccountCreated(true);

      if (isPaidPlan) {
        // Move to payment step
        setStep(4);
        toast({ title: 'Conta criada! 🎉', description: 'Agora finalize o pagamento do seu plano.' });
      } else {
        toast({ title: 'Conta criada com sucesso! 🎉', description: 'Verifique seu email para confirmar a conta.' });
        setTimeout(() => navigate('/onboarding'), 1500);
      }
    } catch (error: any) {
      const msg = error.message || '';
      const code = error.code || '';
      let title = 'Erro ao criar conta';
      let description = 'Ocorreu um erro inesperado. Tente novamente.';

      if (msg.includes('already registered') || msg.includes('already been registered')) {
        description = 'Este email já está cadastrado. Tente fazer login.';
      } else if (msg.includes('invalid email') || msg.includes('Unable to validate email')) {
        description = 'O email informado não é válido.';
      } else if (msg.includes('Password should be at least 6') || msg.includes('at least 6')) {
        description = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (code === '42P10' || msg.includes('ON CONFLICT') || msg.includes('unique constraint')) {
        description = 'Erro de configuração interna. Contate o suporte.';
      } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
        description = 'Muitas tentativas. Aguarde alguns minutos.';
      }

      toast({ title, description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_type: formData.selectedPlan },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePixConfirmed = () => {
    toast({
      title: 'Pagamento PIX registrado!',
      description: 'Seu pagamento será confirmado em breve. Você já pode acessar o sistema.',
    });
    setTimeout(() => navigate('/onboarding'), 1500);
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

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleStep3Action = () => {
    handleSignup();
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
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
              {s < totalSteps && (
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
                    onChange={(e) => setFormData((f) => ({ ...f, fullName: formatNameOnly(e.target.value) }))}
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
                  placeholder="(00)0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData((f) => ({ ...f, phone: formatPhoneBR(e.target.value) }))}
                  inputMode="tel"
                  maxLength={14}
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
              <Button onClick={handleStep2Next} className="flex-1">
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
                      {selectedPlanConfig?.display_name || formData.selectedPlan}
                    </Badge>
                  </div>
                  {isPaidPlan && selectedPlanConfig && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground font-medium">Valor:</span>
                      <span className="font-bold text-primary">R$ {selectedPlanConfig.price_monthly}/mês</span>
                    </div>
                  )}
                </div>

                {isPaidPlan && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-700 dark:text-amber-400">
                    💳 Após confirmar o cadastro, você será direcionado para o pagamento.
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Ao criar sua conta, você concorda com os Termos de Uso e Política de Privacidade da Na Régua.
                </p>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleStep3Action} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isPaidPlan ? 'Criar Conta e Pagar' : 'Criar Minha Conta'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment (only for paid plans) */}
        {step === 4 && isPaidPlan && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
                <CardDescription>
                  Escolha como deseja pagar o plano {selectedPlanConfig?.display_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan summary */}
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Plano selecionado</p>
                  <p className="text-lg font-bold text-foreground">{selectedPlanConfig?.display_name}</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    R$ {selectedPlanConfig?.price_monthly}<span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                </div>

                {!paymentMethod && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setPaymentMethod('stripe');
                        handleStripeCheckout();
                      }}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">Cartão de Crédito</p>
                        <p className="text-xs text-muted-foreground">Via Stripe - pagamento seguro</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">PIX</p>
                        <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </button>
                  </div>
                )}

                {paymentMethod === 'stripe' && isLoading && (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Redirecionando para o checkout seguro...</p>
                  </div>
                )}

                {paymentMethod === 'pix' && selectedPlanConfig && (
                  <PixPayment
                    amount={selectedPlanConfig.price_monthly}
                    pixKey="naregua@pagamento.com"
                    pixKeyType="email"
                    merchantName="Na Regua"
                    merchantCity="Sao Paulo"
                    description={`Plano ${selectedPlanConfig.display_name}`}
                    expirationMinutes={30}
                    onPaymentConfirmed={handlePixConfirmed}
                    onCancel={() => setPaymentMethod(null)}
                  />
                )}
              </CardContent>
            </Card>

            {!paymentMethod && (
              <Button variant="outline" onClick={() => { setStep(3); setAccountCreated(false); }} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
