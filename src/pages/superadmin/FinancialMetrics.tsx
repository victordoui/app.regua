import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaymentStats } from '@/hooks/superadmin/usePlatformPayments';
import { usePlatformStats } from '@/hooks/useSuperAdmin';
import { usePlanConfig } from '@/hooks/superadmin/usePlanConfig';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  trial: '#94a3b8',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const FinancialMetrics = () => {
  const { data: paymentStats, isLoading: loadingPayments } = usePaymentStats();
  const { data: platformStats, isLoading: loadingPlatform } = usePlatformStats();
  const { plans, isLoading: loadingPlans } = usePlanConfig();

  const isLoading = loadingPayments || loadingPlatform || loadingPlans;

  // Calculate revenue by plan
  const revenueByPlan = plans.map((plan) => {
    const subscriberCount = platformStats?.by_plan?.[plan.plan_type as keyof typeof platformStats.by_plan] || 0;
    const revenue = subscriberCount * plan.price_monthly;
    return {
      name: plan.display_name,
      value: revenue,
      subscribers: subscriberCount,
      color: PLAN_COLORS[plan.plan_type] || '#6b7280',
    };
  }).filter(p => p.value > 0);

  // Mock monthly data for chart
  const monthlyData = [
    { month: 'Set', revenue: (paymentStats?.mrr || 0) * 0.7 },
    { month: 'Out', revenue: (paymentStats?.mrr || 0) * 0.8 },
    { month: 'Nov', revenue: (paymentStats?.mrr || 0) * 0.9 },
    { month: 'Dez', revenue: (paymentStats?.mrr || 0) * 0.95 },
    { month: 'Jan', revenue: paymentStats?.mrr || 0 },
    { month: 'Fev', revenue: paymentStats?.mrr || 0 },
  ];

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Métricas Financeiras</h1>
          <p className="text-muted-foreground">
            Acompanhe a saúde financeira da plataforma
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                MRR (Receita Mensal)
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(paymentStats?.mrr || 0)}
              </div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Receita recorrente mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(paymentStats?.total_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Desde o início
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                LTV Médio
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(paymentStats?.ltv || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor vitalício do cliente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagamentos Pendentes
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {paymentStats?.pending_payments || 0}
              </div>
              <p className="text-xs text-destructive mt-1">
                {paymentStats?.failed_payments || 0} falhas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Receita (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByPlan.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByPlan}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>Sem dados de receita</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const subscriberCount = platformStats?.by_plan?.[plan.plan_type as keyof typeof platformStats.by_plan] || 0;
                return (
                  <div
                    key={plan.id}
                    className="p-4 rounded-lg border border-border bg-card"
                    style={{ borderLeftColor: PLAN_COLORS[plan.plan_type], borderLeftWidth: 4 }}
                  >
                    <h4 className="font-semibold text-foreground">{plan.display_name}</h4>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {formatCurrency(plan.price_monthly)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subscriberCount} assinante(s)
                    </p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {formatCurrency(subscriberCount * plan.price_monthly)}/mês
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default FinancialMetrics;
