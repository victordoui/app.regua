import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePlatformUsers } from '@/hooks/superadmin/usePlatformUsers';
import { usePlatformUserActions, PlatformUserAction } from '@/hooks/superadmin/usePlatformUserActions';
import { Search, Users, AlertTriangle, MoreVertical, Ban, UserCheck, Pause, Play, LogOut, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Administrador da Plataforma',
  admin: 'Gestor do Negócio',
  barbeiro: 'Colaborador',
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
  const { runAction, isUpdating } = usePlatformUserActions();

  const confirmAction = async (user: NonNullable<typeof data>['users'][number], action: PlatformUserAction) => {
    if (action === 'delete') {
      if (!user.email) return;
      const confirmation = window.prompt(`Digite ${user.email} para excluir o acesso. Os dados históricos do negócio serão preservados.`);
      if (confirmation !== user.email) return;
      await runAction({ action, targetUserId: user.user_id, confirmation });
      return;
    }

    const messages: Record<Exclude<PlatformUserAction, 'delete'>, string> = {
      suspend: 'Suspender a assinatura e bloquear o uso do sistema?',
      activate: 'Reativar a assinatura deste negócio?',
      ban: 'Banir este usuário e suspender a assinatura?',
      unban: 'Remover o banimento deste usuário?',
      revoke_sessions: 'Encerrar todas as sessões ativas deste usuário?',
    };
    if (window.confirm(messages[action])) await runAction({ action, targetUserId: user.user_id });
  };

  const daysRemaining = (endDate: string | null | undefined) => {
    if (!endDate) return null;
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000));
  };

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
        (statusFilter === 'banned' && u.active === false) ||
        (statusFilter === 'orphan' && u.roles.length === 0) ||
        u.subscription?.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data?.users, search, roleFilter, statusFilter]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <PageHeader eyebrow="Gestão da plataforma" title="Usuários do Sistema" />
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
                  <SelectItem value="super_admin">Administrador da Plataforma</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="barbeiro">Colaborador</SelectItem>
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
                  <SelectItem value="banned">Banido</SelectItem>
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
                      <TableHead>Empresa / Perfil</TableHead>
                      <TableHead>Trial / pagamento</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                              {user.company_name && <span className="w-full text-sm font-medium">{user.company_name}</span>}
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
                            <div className="text-xs">
                              <p>{user.subscription?.plan_type === 'trial' ? `${daysRemaining(user.subscription.end_date) ?? '—'} dias restantes` : 'Plano contratado'}</p>
                              <p className="text-muted-foreground">Pagamento: {user.subscription?.payment_status || '—'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.active === false ? (
                              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-500/20">Banido</Badge>
                            ) : user.subscription ? (
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.subscription.plan_type}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isUpdating || user.roles.includes('super_admin')} aria-label="Ações do usuário">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.subscription?.status === 'suspended' ? (
                                  <DropdownMenuItem onClick={() => confirmAction(user, 'activate')}><Play className="mr-2 h-4 w-4" /> Reativar assinatura</DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => confirmAction(user, 'suspend')}><Pause className="mr-2 h-4 w-4" /> Suspender assinatura</DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => confirmAction(user, 'ban')}><Ban className="mr-2 h-4 w-4" /> Banir usuário</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmAction(user, 'unban')}><UserCheck className="mr-2 h-4 w-4" /> Remover banimento</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmAction(user, 'revoke_sessions')}><LogOut className="mr-2 h-4 w-4" /> Encerrar sessões</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => confirmAction(user, 'delete')}><Trash2 className="mr-2 h-4 w-4" /> Excluir acesso</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
