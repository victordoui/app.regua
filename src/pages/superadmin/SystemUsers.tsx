import { useState, useMemo } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePlatformUsers } from '@/hooks/superadmin/usePlatformUsers';
import { Search, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  barbeiro: 'Barbeiro',
  cliente: 'Cliente',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-500/20',
  pending_payment: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-700 border-red-500/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  expired: 'bg-muted text-muted-foreground border-border',
};

const SystemUsers = () => {
  const { data, isLoading } = usePlatformUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => {
      const matchesSearch =
        !search ||
        u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'orphan' && u.roles.length === 0) ||
        u.subscription?.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data?.users, search, roleFilter, statusFilter]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários do Sistema</h1>
          <p className="text-muted-foreground">
            {data?.stats.totalUsers || 0} usuários cadastrados na plataforma
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{data?.stats.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Total de Usuários</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{data?.stats.newThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">Novos este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{data?.stats.trialSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">Em Trial</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-600">{data?.stats.orphanUsers || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Sem role
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Lista de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="barbeiro">Barbeiro</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending_payment">Pagamento Pendente</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="orphan">Sem Role (Órfão)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Role(s)</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
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
                                <p className="text-xs text-muted-foreground">{user.email || 'Sem email'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {user.roles.length === 0 ? (
                                <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" /> Sem role
                                </Badge>
                              ) : (
                                user.roles.map((role) => (
                                  <Badge key={role} variant="secondary" className="text-xs">
                                    {ROLE_LABELS[role] || role}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.subscription.plan_type}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge
                                variant="outline"
                                className={`text-xs ${STATUS_COLORS[user.subscription.status] || ''}`}
                              >
                                {user.subscription.status === 'active' ? 'Ativo' :
                                 user.subscription.status === 'pending_payment' ? 'Pgto Pendente' :
                                 user.subscription.status === 'suspended' ? 'Suspenso' :
                                 user.subscription.status}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {user.created_at
                                ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })
                                : '—'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

export default SystemUsers;
