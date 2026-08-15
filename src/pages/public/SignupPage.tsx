import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, ArrowRight, ArrowLeft, Loader2, Crown, Star, Zap, CreditCard, QrCode, Shield, Mail } from 'lucide-react';
import { cn, formatPhoneBR, formatNameOnly } from '@/lib/utils';
import vizzuIcon from '@/assets/vizzu-icon.png';
import PixPayment from '@/components/payments/PixPayment';
import type { PlanConfig } from '@/types/superAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_PUBLIC_PLANS } from '@/lib/publicPlans';
import { formatCurrency } from '@/lib/pixUtils';

type Step = 1 | 2 | 3 | 4;

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  // Renderiza opções imediatamente; a consulta remota só atualiza o catálogo.
  const [plans, setPlans] = useState<PlanConfig[]>(DEFAULT_PUBLIC_PLANS);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'pix' | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
    // O cliente precisa decidir conscientemente entre teste e um plano pago.
    selectedPlan: '' as string,
  });

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      // A política do banco permite esta leitura sem login. A lista local é
      // apenas uma contingência para que a conversão não pare em uma tela vazia.
      setPlans(!error && data?.length ? data as unknown as PlanConfig[] : DEFAULT_PUBLIC_PLANS);
    };
    fetchPlans();

    const searchParams = new URLSearchParams(window.location.search);
    const preSelectedPlan = searchParams.get('plano');
    if (preSelectedPlan) {
      setFormData(f => ({ ...f, selectedPlan: preSelectedPlan }));
    }

    if (user) {
      setFormData(f => ({
        ...f,
        fullName: f.fullName || String(user.user_metadata?.full_name || ''),
        companyName: f.companyName || String(user.user_metadata?.company_name || ''),
        email: user.email || f.email,
        selectedPlan: f.selectedPlan || String(user.user_metadata?.selected_plan || ''),
      }));
    }

    // Handle payment cancellation
    if (searchParams.get('payment') === 'cancelled') {
      toast({ title: 'Pagamento cancelado', description: 'Você pode tentar novamente.', variant: 'destructive' });
    }
  }, [toast, user]);

  const selectedPlanConfig = plans.find(p => p.plan_type === formData.selectedPlan);
  const isPaidPlan = Boolean(formData.selectedPlan && formData.selectedPlan !== 'trial');
  const totalSteps = isPaidPlan ? 4 : 3;

  const isCompletingRegistration = Boolean(user);

  const handleSignup = async () => {
    if (!selectedPlanConfig) {
      toast({
        title: 'Escolha uma opção',
        description: 'Selecione o período de teste ou um plano para continuar.',
        variant: 'destructive',
      });
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/cadastro?confirmado=1`;
      let account = user;

      if (!account) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
              company_name: formData.companyName,
              selected_plan: formData.selectedPlan,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Erro ao criar conta');

        // Com confirmação de e-mail ativa não existe sessão ainda. A conta só
        // pode ganhar papel, negócio e assinatura após o clique no e-mail.
        if (!authData.session) {
          setConfirmationEmailSent(true);
          return;
        }

        account = authData.user;
      }

      if (!account) throw new Error('Não foi possível identificar a conta criada');

      const { error: rpcError } = await supabase.rpc('create_subscriber_with_subscription', {
        _user_id: account.id,
        _display_name: formData.fullName,
        _email: account.email || formData.email,
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
        toast({ title: 'Conta criada com sucesso! 🎉', description: 'Vamos preparar seu negócio.' });
        setTimeout(() => navigate('/onboarding'), 1500);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      const code = error instanceof Error && 'code' in error ? String(error.code || '') : '';
      const title = 'Erro ao criar conta';
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
    } catch (error: unknown) {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: error instanceof Error ? error.message : 'Tente novamente.',
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
    (isCompletingRegistration || formData.password.length >= 8);

  const planIcons: Record<string, React.ReactNode> = {
    trial: <Zap className="h-6 w-6" />,
    basic: <Star className="h-6 w-6" />,
    pro: <Crown className="h-6 w-6" />,
    enterprise: <Shield className="h-6 w-6" />,
  };

  const handleStep2Next = () => {
    if (!selectedPlanConfig) {
      toast({
        title: 'Escolha uma opção',
        description: 'Selecione o período de teste ou um plano para continuar.',
        variant: 'destructive',
      });
      return;
    }
    setStep(3);
  };

  const handleStep3Action = () => {
    handleSignup();
  };

  const resendConfirmation = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: { emailRedirectTo: `${window.location.origin}/cadastro?confirmado=1` },
      });
      if (error) throw error;
      toast({ title: 'E-mail reenviado', description: 'Confira sua caixa de entrada e spam.' });
    } catch (error: unknown) {
      toast({
        title: 'Não foi possível reenviar o e-mail',
        description: error instanceof Error ? error.message : 'Tente novamente em alguns minutos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordRecovery = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) throw error;
      toast({ title: 'Se houver uma conta, enviaremos as instruções', description: 'Confira sua caixa de entrada e spam.' });
    } catch (error: unknown) {
      toast({
        title: 'Não foi possível solicitar a recuperação',
        description: error instanceof Error ? error.message : 'Tente novamente em alguns minutos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (confirmationEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Mail className="h-7 w-7" /></div>
            <CardTitle>Confira seu e-mail</CardTitle>
            <CardDescription>
              Se este for um novo cadastro, enviamos um link para <strong>{formData.email}</strong>. Depois de confirmar, você voltará para concluir o cadastro do negócio e ativar o plano escolhido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={resendConfirmation} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />} Reenviar e-mail de confirmação
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Voltar para o login</Button>
            <Button variant="ghost" className="w-full" onClick={sendPasswordRecovery} disabled={isLoading}>Já tenho conta ou esqueci minha senha</Button>
            <p className="text-xs text-muted-foreground">Não encontrou? Verifique a caixa de spam e aguarde alguns minutos antes de reenviar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 p-1.5 ring-1 ring-blue-100">
            <img src={vizzuIcon} alt="VIZZU" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">VIZZU</h1>
          <p className="text-muted-foreground mt-1">{isCompletingRegistration ? 'Conclua os dados do negócio para liberar seu acesso' : 'Crie sua conta e comece a gerenciar seu negócio'}</p>
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
              <CardTitle>{isCompletingRegistration ? 'Conclua seu cadastro' : 'Dados da Conta'}</CardTitle>
              <CardDescription>{isCompletingRegistration ? 'Escolha um plano e informe os dados do negócio para liberar o acesso.' : 'Preencha seus dados para criar sua conta'}</CardDescription>
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
                  <Label htmlFor="companyName">Nome do negócio</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: Salão da Maria"
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
              {!isCompletingRegistration && <div className="space-y-2">
                <Label htmlFor="password">Senha (mín. 8 caracteres)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                />
              </div>}
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
                <CardDescription>Selecione o plano ideal para seu negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setFormData((f) => ({ ...f, selectedPlan: plan.plan_type }))}
                      aria-pressed={formData.selectedPlan === plan.plan_type}
                      className={cn(
                        'relative p-4 rounded-xl border-2 text-left transition-all',
                        formData.selectedPlan === plan.plan_type
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      {plan.plan_type === 'pro' && (
                        <Badge className="absolute right-3 top-3 bg-gradient-to-r from-primary to-primary-600 text-primary-foreground">
                          Popular
                        </Badge>
                      )}
                      <div className={cn('mb-3 flex items-center gap-3', plan.plan_type === 'pro' && 'pr-16')}>
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          formData.selectedPlan === plan.plan_type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          {planIcons[plan.plan_type] || <Star className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{plan.display_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.plan_type === 'trial' ? `Teste gratuito por ${plan.trial_days || 7} dias` : `${formatCurrency(Number(plan.price_monthly))}/mês`}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Até {plan.max_barbers} profissiona{plan.max_barbers > 1 ? 'is' : 'l'}</p>
                        <p>• {plan.max_appointments_month} agendamentos/mês</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleStep2Next} disabled={!selectedPlanConfig} className="flex-1">
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
                    <span className="text-muted-foreground">Negócio:</span>
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
                      <span className="font-bold text-primary">{formatCurrency(Number(selectedPlanConfig.price_monthly))}/mês</span>
                    </div>
                  )}
                </div>

                {isPaidPlan && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-700 dark:text-amber-400">
                    💳 Após confirmar o cadastro, você será direcionado para o pagamento.
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Ao criar sua conta, você concorda com os Termos de Uso e Política de Privacidade da VIZZU.
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
                {isPaidPlan ? (isCompletingRegistration ? 'Concluir cadastro e pagar' : 'Criar Conta e Pagar') : (isCompletingRegistration ? 'Concluir meu cadastro' : 'Criar Minha Conta')}
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
                    {formatCurrency(Number(selectedPlanConfig?.price_monthly || 0))}<span className="text-sm font-normal text-muted-foreground">/mês</span>
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
