import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Crown, Scissors, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schemas de Validação
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
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  // Forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  // Handlers
  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const { error, success } = await signIn(data.email, data.password);
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema!",
        });
        
        // Buscar role do usuário para redirecionar corretamente
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
          navigate(isSuperAdmin ? "/superadmin" : "/");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const { error, success } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Não foi possível criar o usuário",
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Usuário criado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        registerForm.reset();
        setActiveTab("login");
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'barber' | 'admin' | 'superadmin') => {
    let loginEmail = "";
    let loginPassword = "";

    switch (role) {
      case 'barber':
        loginEmail = "barbeiro@naregua.com";
        loginPassword = "barbeiro123456";
        break;
      case 'admin':
        loginEmail = "admin@naregua.com";
        loginPassword = "admin123456";
        break;
      case 'superadmin':
        loginEmail = "superadmin@naregua.com";
        loginPassword = "superadmin123456";
        break;
    }

    loginForm.setValue("email", loginEmail);
    loginForm.setValue("password", loginPassword);

    // Pequeno delay para visualização antes do submit
    setTimeout(() => {
      loginForm.handleSubmit(onLoginSubmit)();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black via-barber-dark to-barber-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background with barber theme */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full mix-blend-multiply filter blur-xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">Na Régua</h1>
          </motion.div>
        </div>

        <Card className="bg-card/95 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>

          <CardHeader className="text-center pb-6 relative">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary mr-2" />
              <h2 className="text-2xl font-bold text-foreground">Bem-vindo de Volta</h2>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm border-border">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {activeTab === "login" && (
                  <motion.div
                    key="loginTab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="login" className="space-y-6 mt-6">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input {...field} placeholder="seu@email.com" className="pl-12" />
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
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Sua senha"
                                      className="pl-12 pr-12"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
                            disabled={loading}
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                                Entrando...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                Entrar no Sistema
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                              </div>
                            )}
                          </Button>
                        </form>
                      </Form>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-muted"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-muted px-3 text-muted-foreground rounded-full backdrop-blur-sm">OU</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-10"
                            onClick={() => handleQuickLogin('barber')}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Barbeiro
                          </Button>

                          <Button
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-10"
                            onClick={() => handleQuickLogin('admin')}
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Admin
                          </Button>

                          <Button
                            variant="outline"
                            className="border-amber-500/50 text-amber-500 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:border-amber-500 transition-all duration-300 h-10"
                            onClick={() => handleQuickLogin('superadmin')}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Super
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "register" && (
                  <motion.div
                    key="registerTab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="register" className="space-y-5 mt-6">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Seu nome completo" />
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
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input {...field} placeholder="seu@email.com" className="pl-12" />
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
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      type="password"
                                      placeholder="Crie uma senha forte"
                                      className="pl-12"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
                            disabled={loading}
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                                Cadastrando...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                Criar Conta
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                              </div>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground text-sm mt-8">
          <button
            onClick={() => navigate('/vendas')}
            className="text-primary hover:underline font-medium mb-3 block mx-auto"
          >
            Conheça nossos planos →
          </button>
          <p className="mb-2">© 2024 Na Régua - Todos os direitos reservados</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs">Sistema de Gestão Barbearia</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;