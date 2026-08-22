import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Calendar, CheckCircle, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import vizzuIcon from "@/assets/vizzu-icon.png";
import salonOwnerHero from "@/assets/vizzu-salon-owner-hero.png";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const redirectByRole = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate('/login', { replace: true });
        return;
      }

      const { data: roles, error: rolesError } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      if (rolesError) {
        console.error('Não foi possível carregar as permissões após o login:', rolesError);
        toast({ title: 'Acesso pendente', description: 'Não foi possível preparar sua conta agora. Tente novamente em instantes.', variant: 'destructive' });
        navigate('/login?cadastro=pendente', { replace: true });
        return;
      }
      const roleList = (roles || []).map(r => r.role as string);

      if (roleList.includes('super_admin')) {
        navigate("/superadmin", { replace: true });
        return;
      }
      if (roleList.includes('admin') || roleList.includes('barbeiro')) {
      if (roleList.includes('admin')) {
        const { data: subscription } = await supabase
          .from('platform_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subscription && ['expired', 'cancelled', 'pending_payment'].includes(subscription.status)) {
          navigate('/upgrade');
          return;
        }
      }
        navigate(roleList.includes('admin') ? "/" : "/appointments", { replace: true });
        return;
      }
      if (roleList.includes('cliente')) {
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('barbershop_user_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
        navigate(profile?.barbershop_user_id ? `/b/${profile.barbershop_user_id}/home` : "/login", { replace: true });
        return;
      }
      navigate("/login?cadastro=pendente", { replace: true });
    } catch (error) {
      console.error('Falha ao redirecionar após o login:', error);
      toast({ title: 'Não foi possível abrir sua conta', description: 'Tente entrar novamente.', variant: 'destructive' });
      navigate('/login', { replace: true });
    }
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { error, success } = await signIn(data.email, data.password);
      if (error) {
        setShowRecoveryOption(true);
        toast({ title: "Erro no login", description: error.message || "Credenciais inválidas", variant: "destructive" });
      } else if (success) {
        toast({ title: "Login realizado com sucesso!", description: "Bem-vindo ao sistema!" });
        await redirectByRole();
      }
    } catch (error: unknown) {
      console.error("Erro no login:", error);
      toast({ title: "Erro no login", description: "Ocorreu um erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordRecovery = async () => {
    const email = loginForm.getValues('email').trim();
    if (!email) {
      loginForm.setError('email', { message: 'Informe seu e-mail para recuperar o acesso.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
      setLoading(false);
    }
  };

  const features = [
    { icon: Calendar, text: "Agendamento inteligente" },
    { icon: BarChart3, text: "Relatórios e métricas" },
    { icon: CheckCircle, text: "Gestão completa do negócio" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(145deg,#eef5ff_0%,#f8fbff_45%,#e8f1ff_100%)] lg:flex-row dark:bg-[linear-gradient(145deg,#030817_0%,#07172f_52%,#030817_100%)]">
      {/* Left Panel - Branding */}
      <div
        className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-[52%] lg:flex-col lg:justify-between lg:p-10 xl:p-14"
      >
        <img src={salonOwnerHero} alt="Profissional usando o VIZZU no salão" className="absolute inset-0 h-full w-full object-cover object-[64%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,48,0.88)_0%,rgba(5,28,72,0.58)_42%,rgba(5,24,58,0.12)_75%),linear-gradient(0deg,rgba(3,16,42,0.92)_0%,transparent_58%)]" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

        <button type="button" onClick={() => navigate('/vendas')} className="relative z-10 flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-[#061c47]/55 px-4 py-3 text-left shadow-xl backdrop-blur-md transition hover:bg-[#061c47]/70" aria-label="Ir para a página inicial do VIZZU">
          <img src={vizzuIcon} alt="" className="h-14 w-14 object-contain drop-shadow-lg" />
          <div><p className="text-2xl font-black tracking-[0.08em] text-white">VIZZU</p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Visualize · Organize · Cresça</p></div>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-xl text-left"
        >
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100 backdrop-blur">Gestão feita para quem atende bem</span>
          <h1 className="mt-5 max-w-lg text-4xl font-black leading-[1.06] tracking-[-0.04em] text-white xl:text-5xl">Sua agenda organizada. Seu negócio crescendo.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-blue-100/90">Entre para acompanhar clientes, equipe e resultados em um só lugar.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="rounded-2xl border border-white/15 bg-[#061c47]/55 p-4 text-white shadow-lg backdrop-blur-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/30 text-blue-100">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="mt-3 block text-xs font-bold leading-5">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mobile Header */}
      <div className="relative h-[210px] overflow-hidden lg:hidden">
        <img src={salonOwnerHero} alt="Profissional usando o VIZZU no salão" className="h-full w-full object-cover object-[64%_38%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061c47]/90 via-[#092760]/55 to-transparent" />
        <button type="button" onClick={() => navigate('/vendas')} className="absolute left-5 top-5 flex items-center gap-3 text-left">
          <img src={vizzuIcon} alt="" className="h-16 w-16 object-contain drop-shadow-xl" />
          <div><h1 className="text-2xl font-black tracking-[0.08em] text-white">VIZZU</h1><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">Visualize · Organize · Cresça</p></div>
        </button>
        <p className="absolute bottom-5 left-5 max-w-[240px] text-lg font-black leading-6 text-white">Sua agenda organizada. Seu negócio crescendo.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-7 lg:p-10 xl:p-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-[470px] rounded-[30px] border border-white/90 bg-white/92 p-6 shadow-[0_32px_80px_-34px_rgba(15,47,107,0.45)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-[#07152d]/92"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {activeTab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground mt-1 ">
              {activeTab === "login" ? "Acesse sua conta para continuar" : "Comece a gerenciar seus agendamentos"}
            </p>
          </div>

          {searchParams.get('cadastro') === 'pendente' && (
            <div className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
              Seu cadastro ainda não está concluído. Confirme o e-mail recebido para continuar ou crie uma nova conta.
            </div>
          )}

          {/* Pill Tabs */}
          <div className="mb-8 flex rounded-xl bg-muted/80 p-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300  ${
                activeTab === "login"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300  ${
                activeTab === "register"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground ">E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="seu@email.com"
                                className="pl-10 h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-card rounded-xl"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground ">Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Sua senha"
                                className="pl-10 pr-12 h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-card rounded-xl"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="group h-12 w-full rounded-xl bg-primary text-base font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Entrando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Entrar no Sistema
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>

                {showRecoveryOption && (
                  <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3 text-center text-sm text-muted-foreground">
                    Já possui cadastro ou não lembra a senha?{' '}
                    <button type="button" onClick={requestPasswordRecovery} disabled={loading} className="font-semibold text-primary hover:underline">
                      Enviar link para recuperar acesso
                    </button>
                  </div>
                )}

              </motion.div>

            )}

            {activeTab === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-5">
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-6 text-muted-foreground">
                    Para começar, você escolhe entre o período de teste gratuito ou um plano pago. Depois, criamos sua conta, negócio e assinatura em um único processo.
                  </div>
                  <Button
                    type="button"
                    onClick={() => navigate('/cadastro')}
                    className="group h-12 w-full rounded-xl bg-primary text-base font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    Escolher plano e criar conta
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">Você poderá iniciar pelo teste gratuito, sem cobrança imediata.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/vendas')}
              className="text-[#1F4FA3] hover:underline text-sm font-medium mb-3 block mx-auto "
            >
              Conheça nossos planos →
            </button>
            <p className="text-muted-foreground text-xs ">© 2025 VIZZU - Todos os direitos reservados</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
