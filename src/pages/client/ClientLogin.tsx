import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  slogan: string | null;
}

const ClientLogin = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) {
        setError('Barbearia não encontrada');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('barbershop_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data?.is_public_page_enabled) {
        setError('Barbearia não encontrada ou página desativada');
      } else {
        setSettings(data as BarbershopSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [userId]);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate(`/b/${userId}/home`);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate(`/b/${userId}/home`);
      }
    });

    return () => subscription.unsubscribe();
  }, [userId, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
      });
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/b/${userId}/home`,
      },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar com Google',
        description: error.message,
      });
      setIsGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold mb-2">Erro</h1>
          <p className="text-muted-foreground">{error || 'Barbearia não encontrada'}</p>
        </Card>
      </div>
    );
  }

  const dynamicStyles = {
    '--client-primary': settings.primary_color_hex,
  } as React.CSSProperties;

  return (
    <div 
      style={dynamicStyles}
      className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30"
    >
      {/* Header with banner/logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-48 flex items-center justify-center overflow-hidden"
      >
        {settings.banner_url ? (
          <>
            <img 
              src={settings.banner_url} 
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: settings.primary_color_hex }}
          />
        )}
        
        <div className="relative z-10 flex flex-col items-center text-white">
          {settings.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.company_name}
              className="h-20 w-20 rounded-full object-cover border-4 border-white/30 shadow-xl"
            />
          ) : (
            <div 
              className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-xl"
              style={{ backgroundColor: settings.secondary_color_hex }}
            >
              {settings.company_name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold mt-3">{settings.company_name}</h1>
          {settings.slogan && (
            <p className="text-sm text-white/80 mt-1">{settings.slogan}</p>
          )}
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-6 py-8 -mt-4"
      >
        <Card className="max-w-sm mx-auto p-6 shadow-lg rounded-2xl">
          <h2 className="text-xl font-semibold text-center mb-6">Entrar na sua conta</h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="pl-10 pr-10 h-12"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              style={{ backgroundColor: settings.primary_color_hex }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou continue com</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full h-12 gap-3"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button
                onClick={() => navigate(`/b/${userId}/cadastro`)}
                className="text-primary font-medium hover:underline"
                style={{ color: settings.primary_color_hex }}
              >
                Criar conta
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClientLogin;
