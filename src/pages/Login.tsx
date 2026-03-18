import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Crown, Shield, Calendar, CheckCircle, BarChart3 } from "lucide-react";
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

const registerSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { error, success } = await signIn(data.email, data.password);
      if (error) {
        toast({ title: "Erro no login", description: error.message || "Credenciais inválidas", variant: "destructive" });
      } else if (success) {
        toast({ title: "Login realizado com sucesso!", description: "Bem-vindo ao sistema!" });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
          const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
          navigate(isSuperAdmin ? "/superadmin" : "/");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({ title: "Erro no login", description: "Ocorreu um erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const { error, success } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        toast({ title: "Erro no cadastro", description: error.message || "Não foi possível criar o usuário", variant: "destructive" });
      } else if (success) {
        toast({ title: "Usuário criado com sucesso!", description: "Verifique seu email para confirmar o cadastro." });
        registerForm.reset();
        setActiveTab("login");
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({ title: "Erro no cadastro", description: "Ocorreu um erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'barber' | 'admin' | 'superadmin') => {
    const credentials = {
      barber: { email: "barbeiro@naregua.com", password: "barbeiro123456" },
      admin: { email: "admin@naregua.com", password: "admin123456" },
      superadmin: { email: "superadmin@naregua.com", password: "superadmin123456" },
    };
    const { email, password } = credentials[role];
    loginForm.setValue("email", email);
    loginForm.setValue("password", password);
    setTimeout(() => loginForm.handleSubmit(onLoginSubmit)(), 50);
  };

  const features = [
    { icon: Calendar, text: "Agendamento inteligente" },
    { icon: BarChart3, text: "Relatórios e métricas" },
    { icon: CheckCircle, text: "Gestão completa do negócio" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4FA3FF, #1F4FA3, #0F2F6B)" }}
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
          className="relative z-10 text-center max-w-md"
        >
          <img src={vizzuIcon} alt="VIZZU" className="w-28 h-28 mx-auto mb-6 object-contain drop-shadow-2xl" />
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight font-['Montserrat']">VIZZU</h1>
          <p className="text-white/80 text-lg mb-10 font-['Open_Sans']">Visualize. Organize. Cresça.</p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium font-['Open_Sans']">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mobile Header */}
      <div
        className="lg:hidden p-6 text-center"
        style={{ background: "linear-gradient(135deg, #4FA3FF, #1F4FA3, #0F2F6B)" }}
      >
        <img src={vizzuIcon} alt="VIZZU" className="w-16 h-16 mx-auto mb-2 object-contain" />
        <h1 className="text-2xl font-extrabold text-white font-['Montserrat']">VIZZU</h1>
        <p className="text-white/70 text-sm font-['Open_Sans']">Visualize. Organize. Cresça.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F2F6B] font-['Montserrat']">
              {activeTab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-gray-500 mt-1 font-['Open_Sans']">
              {activeTab === "login" ? "Acesse sua conta para continuar" : "Comece a gerenciar seus agendamentos"}
            </p>
          </div>

          {/* Pill Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 font-['Open_Sans'] ${
                activeTab === "login"
                  ? "bg-white text-[#1F4FA3] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 font-['Open_Sans'] ${
                activeTab === "register"
                  ? "bg-white text-[#1F4FA3] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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
                          <FormLabel className="text-gray-700 font-['Open_Sans']">E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                placeholder="seu@email.com"
                                className="pl-10 h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-white rounded-xl"
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
                          <FormLabel className="text-gray-700 font-['Open_Sans']">Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Sua senha"
                                className="pl-10 pr-12 h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-white rounded-xl"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
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
                      className="w-full h-12 text-base font-semibold rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 group font-['Open_Sans']"
                      style={{ background: "linear-gradient(135deg, #4FA3FF, #1F4FA3)" }}
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

                {/* Quick Login */}
                <div className="mt-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider font-['Open_Sans']">Acesso rápido</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickLogin('barber')}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border border-[#2E6FD3]/30 text-[#1F4FA3] hover:bg-[#1F4FA3] hover:text-white transition-all duration-300 text-xs font-medium"
                    >
                      <User className="h-4 w-4" />
                      Profissional
                    </button>
                    <button
                      onClick={() => handleQuickLogin('admin')}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border border-[#2E6FD3]/30 text-[#1F4FA3] hover:bg-[#1F4FA3] hover:text-white transition-all duration-300 text-xs font-medium"
                    >
                      <Crown className="h-4 w-4" />
                      Admin
                    </button>
                    <button
                      onClick={() => handleQuickLogin('superadmin')}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border border-amber-400/40 text-amber-600 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all duration-300 text-xs font-medium"
                    >
                      <Shield className="h-4 w-4" />
                      Super
                    </button>
                  </div>
                </div>
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
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Seu nome completo"
                              className="h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-white rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                placeholder="seu@email.com"
                                className="pl-10 h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-white rounded-xl"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Crie uma senha forte"
                                className="pl-10 h-12 border-[#1F4FA3]/20 focus:border-[#1F4FA3] focus:ring-[#1F4FA3]/20 bg-white rounded-xl"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                      style={{ background: "linear-gradient(135deg, #4FA3FF, #1F4FA3)" }}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Cadastrando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Criar Conta
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/vendas')}
              className="text-[#1F4FA3] hover:underline text-sm font-medium mb-3 block mx-auto"
            >
              Conheça nossos planos →
            </button>
            <p className="text-gray-400 text-xs">© 2025 VIZZU - Todos os direitos reservados</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
