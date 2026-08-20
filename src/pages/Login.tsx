import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        navigate('/cadastro?concluir=1', { replace: true });
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
      navigate("/cadastro?concluir=1", { replace: true });
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
    <div className="min-h-screen flex flex-col bg-[hsl(var(--page))] lg:flex-row">
      {/* Left Panel - Branding */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:flex-col lg:items-center lg:justify-center lg:p-12"
        style={{ background: "linear-gradient(145deg, #2563EB 0%, #173F92 48%, #081D46 100%)" }}
      >
        {/* Geometric decorations */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-32 right-16 w-24 h-24 border border-white/10 rounded-full" />
        <div className="absolute top-1/3 right-24 w-16 h-16 bg-white/5 rounded-lg rotate-45" />
        <div className="absolute bottom-20 left-32 w-20 h-20 bg-white/5 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md text-left"
        >
          <img src={vizzuIcon} alt="VIZZU" className="w-28 h-28 mx-auto mb-6 object-contain drop-shadow-2xl" />
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight ">VIZZU</h1>
          <p className="text-white/80 text-lg mb-10 ">Visualize. Organize. Cresça.</p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 text-white/85"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium ">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mobile Header */}
      <div
        className="p-5 text-center lg:hidden"
        style={{ background: "linear-gradient(135deg, #4FA3FF, #1F4FA3, #0F2F6B)" }}
      >
        <img src={vizzuIcon} alt="VIZZU" className="w-16 h-16 mx-auto mb-2 object-contain" />
        <h1 className="text-2xl font-extrabold text-white ">VIZZU</h1>
        <p className="text-white/70 text-sm ">Visualize. Organize. Cresça.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-[460px] rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_28px_70px_-35px_rgba(15,47,107,0.38)] sm:p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {activeTab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground mt-1 ">
              {activeTab === "login" ? "Acesse sua conta para continuar" : "Comece a gerenciar seus agendamentos"}
            </p>
          </div>

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
