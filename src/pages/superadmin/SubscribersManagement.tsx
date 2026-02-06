import { useState } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSubscribers } from '@/hooks/useSuperAdmin';
import { NewSubscriberDialog } from '@/components/superadmin/NewSubscriberDialog';
import type { PlanType, SubscriptionStatus, SubscriberFilters } from '@/types/superAdmin';
import {
  Search,
  MoreVertical,
  Play,
  Pause,
  XCircle,
  RefreshCw,
  Building2,
  UserPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<SubscriptionStatus, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  expired: 'bg-muted text-muted-foreground border-muted',
};

const planLabels: Record<PlanType, string> = {
  trial: 'Trial',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

const SubscribersManagement = () => {
  const [filters, setFilters] = useState<SubscriberFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);

  const {
    subscribers,
    isLoading,
    suspendSubscription,
    activateSubscription,
    cancelSubscription,
    renewSubscription,
    isUpdating,
  } = useSubscribers(filters);

  const filteredSubscribers = subscribers.filter((sub) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      sub.user_id.toLowerCase().includes(search) ||
      sub.plan_type.toLowerCase().includes(search)
    );
  });

  const handleRenew = (id: string) => {
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    renewSubscription(id, newEndDate.toISOString());
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Assinantes</h1>
            <p className="text-muted-foreground">
              Gerencie os donos de barbearias cadastrados na plataforma
            </p>
          </div>
          <Button onClick={() => setShowNewDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Assinante
          </Button>
        </div>

        <NewSubscriberDialog open={showNewDialog} onOpenChange={setShowNewDialog} />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID ou plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    status: value === 'all' ? undefined : (value as SubscriptionStatus),
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="suspended">Suspensos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.plan || 'all'}
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    plan: value === 'all' ? undefined : (value as PlanType),
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Assinantes ({filteredSubscribers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Building2 className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum assinante encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Término</TableHead>
                    <TableHead>Limites</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-sm">
                        {sub.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{planLabels[sub.plan_type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[sub.status]}>
                          {statusLabels[sub.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(sub.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {sub.end_date
                          ? format(new Date(sub.end_date), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {sub.max_barbers} barb. / {sub.max_appointments_month} agend.
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isUpdating}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {sub.status === 'suspended' && (
                              <DropdownMenuItem onClick={() => activateSubscription(sub.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                            {sub.status === 'active' && (
                              <DropdownMenuItem onClick={() => suspendSubscription(sub.id)}>
                                <Pause className="h-4 w-4 mr-2" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleRenew(sub.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renovar (+1 mês)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => cancelSubscription(sub.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SubscribersManagement;
