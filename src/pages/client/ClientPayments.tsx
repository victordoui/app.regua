import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard, Banknote, QrCode, DollarSign, Wallet, Loader2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subMonths, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  slogan: string | null;
}

interface PaymentWithDetails {
  id: string;
  amount: number;
  payment_method: string | null;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
  appointment?: {
    appointment_date: string;
    services?: { name: string; price: number } | null;
    profiles?: { full_name: string } | null;
  } | null;
}

const ClientPayments = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      // Fetch barbershop settings
      const { data: settingsData } = await supabase
        .from('barbershop_settings')
        .select('company_name, logo_url, banner_url, primary_color_hex, secondary_color_hex, slogan')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings(settingsData);
      }

      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clientProfile) {
        // Get appointments for this client
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id')
          .eq('client_id', clientProfile.id);

        if (appointments && appointments.length > 0) {
          const appointmentIds = appointments.map(a => a.id);
          
          // Fetch payments linked to these appointments
          const { data: paymentsData } = await supabase
            .from('payments')
            .select(`
              id,
              amount,
              payment_method,
              status,
              created_at,
              appointment_id
            `)
            .in('appointment_id', appointmentIds)
            .order('created_at', { ascending: false });

          if (paymentsData) {
            // Fetch appointment details for each payment
            const paymentsWithDetails: PaymentWithDetails[] = [];
            
            for (const payment of paymentsData) {
              if (payment.appointment_id) {
                const { data: appointmentDetails } = await supabase
                  .from('appointments')
                  .select(`
                    appointment_date,
                    services:service_id (name, price),
                    profiles:barber_id (full_name)
                  `)
                  .eq('id', payment.appointment_id)
                  .single();

                paymentsWithDetails.push({
                  ...payment,
                  status: payment.status as 'pending' | 'completed' | 'refunded',
                  appointment: appointmentDetails ? {
                    appointment_date: appointmentDetails.appointment_date,
                    services: Array.isArray(appointmentDetails.services) 
                      ? appointmentDetails.services[0] as { name: string; price: number } | null
                      : appointmentDetails.services as { name: string; price: number } | null,
                    profiles: Array.isArray(appointmentDetails.profiles)
                      ? appointmentDetails.profiles[0] as { full_name: string } | null
                      : appointmentDetails.profiles as { full_name: string } | null
                  } : null
                });
              } else {
                paymentsWithDetails.push({
                  ...payment,
                  status: payment.status as 'pending' | 'completed' | 'refunded'
                });
              }
            }
            
            setPayments(paymentsWithDetails);
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, navigate]);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }
      
      // Period filter
      if (periodFilter !== 'all') {
        const paymentDate = new Date(payment.created_at);
        const now = new Date();
        
        if (periodFilter === 'month' && !isAfter(paymentDate, subMonths(now, 1))) {
          return false;
        }
        if (periodFilter === '3months' && !isAfter(paymentDate, subMonths(now, 3))) {
          return false;
        }
      }
      
      return true;
    });
  }, [payments, statusFilter, periodFilter]);

  const totals = useMemo(() => {
    return {
      completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      refunded: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)
    };
  }, [payments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Concluído</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pendente</Badge>;
      case 'refunded':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Estornado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method) {
      case 'card':
      case 'stripe':
        return <CreditCard className="h-4 w-4 text-muted-foreground" />;
      case 'cash':
        return <Banknote className="h-4 w-4 text-muted-foreground" />;
      case 'pix':
        return <QrCode className="h-4 w-4 text-muted-foreground" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case 'card':
        return 'Cartão';
      case 'stripe':
        return 'Stripe';
      case 'cash':
        return 'Dinheiro';
      case 'pix':
        return 'PIX';
      default:
        return 'Não informado';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Barbearia não encontrada</p>
        </Card>
      </div>
    );
  }

  return (
    <MobileLayout settings={settings}>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/b/${userId}`)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Meus Pagamentos</h1>
            <p className="text-sm text-muted-foreground">{payments.length} pagamentos</p>
          </div>
        </div>

        {/* Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="p-3 text-center rounded-xl">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="font-semibold text-sm">{formatCurrency(totals.completed)}</p>
          </Card>
          <Card className="p-3 text-center rounded-xl">
            <Wallet className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-xs text-muted-foreground">Pendente</p>
            <p className="font-semibold text-sm">{formatCurrency(totals.pending)}</p>
          </Card>
          <Card className="p-3 text-center rounded-xl">
            <Receipt className="h-5 w-5 mx-auto mb-1 text-red-600" />
            <p className="text-xs text-muted-foreground">Estornado</p>
            <p className="font-semibold text-sm">{formatCurrency(totals.refunded)}</p>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="refunded">Estornados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Payments List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {filteredPayments.length === 0 ? (
            <Card className="p-8 text-center rounded-xl">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {payments.length > 0 
                  ? 'Tente ajustar os filtros' 
                  : 'Seus pagamentos aparecerão aqui'}
              </p>
            </Card>
          ) : (
            filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">
                        {payment.appointment?.services?.name || 'Serviço não especificado'}
                      </p>
                      {payment.appointment?.profiles?.full_name && (
                        <p className="text-sm text-muted-foreground">
                          com {payment.appointment.profiles.full_name}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <span>{getPaymentMethodLabel(payment.payment_method)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: settings.primary_color_hex }}>
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default ClientPayments;
