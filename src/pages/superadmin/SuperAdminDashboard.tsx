import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePlatformStats } from '@/hooks/useSuperAdmin';
import { usePlatformUsers } from '@/hooks/superadmin/usePlatformUsers';
import { usePlanConfig } from '@/hooks/superadmin/usePlanConfig';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Building2,
  AlertTriangle,
  Clock,
  Shield,
  Scissors,
  UserCircle,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const PLAN_COLORS = {
  trial: '#94a3b8',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
};

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  super_admin: Shield,
  admin: Building2,
  barbeiro: Scissors,
  cliente: UserCircle,
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  barbeiro: 'Barbeiro',
  cliente: 'Cliente',
};

const SuperAdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: usersData, isLoading: usersLoading } = usePlatformUsers();
  const { plans } = usePlanConfig();

  const isLoading = statsLoading || usersLoading;
  const userStats = usersData?.stats;
  const recentUsers = usersData?.users?.slice(0, 5) || [];
  const trialPlan = plans.find((p) => p.plan_type === 'trial');
  const trialDays = (trialPlan as any)?.trial_days ?? 14;

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

        {/* Subscription Stats Cards */}
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

        {/* User Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usuários
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {userStats?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +{userStats?.newThisMonth || 0} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Período de Trial
              </CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {trialDays} dias
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userStats?.trialSubscriptions || 0} em trial agora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagamentos
              </CardTitle>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {userStats?.paidSubscriptions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userStats?.pendingPayment || 0} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cadastros Incompletos
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {userStats?.orphanUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Usuários sem role atribuída
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users by Role */}
        {userStats?.byRole && Object.keys(userStats.byRole).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usuários por Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(userStats.byRole).map(([role, count]) => {
                  const Icon = ROLE_ICONS[role] || UserCircle;
                  return (
                    <div key={role} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-lg font-bold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground">{ROLE_LABELS[role] || role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts + Alerts */}
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
                {userStats?.orphanUsers && userStats.orphanUsers > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <UserPlus className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        {userStats.orphanUsers} usuário(s) sem role
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cadastros incompletos detectados
                      </p>
                    </div>
                  </div>
                )}

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

                {(!userStats?.orphanUsers || userStats.orphanUsers === 0) &&
                  (!stats?.suspended_subscribers || stats.suspended_subscribers === 0) &&
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

        {/* Recent Users Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Usuários Recentes</CardTitle>
            <Link to="/superadmin/users" className="text-sm text-primary hover:underline">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário cadastrado ainda
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {(user.display_name || user.email || '?')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.display_name || 'Sem nome'}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.roles.length === 0 ? (
                              <Badge variant="outline" className="text-xs text-amber-600">Sem role</Badge>
                            ) : (
                              user.roles.map((r) => (
                                <Badge key={r} variant="secondary" className="text-xs">
                                  {ROLE_LABELS[r] || r}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs capitalize">
                            {user.subscription?.plan_type || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {user.created_at
                              ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })
                              : '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
