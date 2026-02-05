import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformStats } from '@/hooks/useSuperAdmin';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const PLAN_COLORS = {
  trial: '#94a3b8',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
};

const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  const pieData = stats
    ? [
        { name: 'Trial', value: stats.by_plan.trial, color: PLAN_COLORS.trial },
        { name: 'Basic', value: stats.by_plan.basic, color: PLAN_COLORS.basic },
        { name: 'Pro', value: stats.by_plan.pro, color: PLAN_COLORS.pro },
        { name: 'Enterprise', value: stats.by_plan.enterprise, color: PLAN_COLORS.enterprise },
      ].filter(item => item.value > 0)
    : [];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Na Régua</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Assinantes
              </CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.total_subscribers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats?.new_this_month || 0} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assinantes Ativos
              </CardTitle>
              <UserCheck className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.active_subscribers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.trial_subscribers || 0} em trial
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Suspensos
              </CardTitle>
              <UserX className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.suspended_subscribers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.cancelled_subscribers || 0} cancelados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Churn
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {(stats?.churn_rate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa de cancelamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum assinante ainda</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.suspended_subscribers && stats.suspended_subscribers > 0 ? (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <UserX className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        {stats.suspended_subscribers} assinatura(s) suspensa(s)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Verifique a situação dos assinantes
                      </p>
                    </div>
                  </div>
                ) : null}

                {stats?.churn_rate && stats.churn_rate > 10 ? (
                  <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-foreground">
                        Taxa de churn alta: {stats.churn_rate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Considere estratégias de retenção
                      </p>
                    </div>
                  </div>
                ) : null}

                {(!stats?.suspended_subscribers || stats.suspended_subscribers === 0) &&
                  (!stats?.churn_rate || stats.churn_rate <= 10) && (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      <div className="text-center">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                        <p>Tudo em ordem! Nenhum alerta.</p>
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
