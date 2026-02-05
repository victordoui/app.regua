import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuditLogs } from '@/hooks/useSuperAdmin';
import type { AuditAction } from '@/types/superAdmin';
import { ScrollText, UserX, UserCheck, Ticket, RefreshCw, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const actionLabels: Record<AuditAction, { label: string; icon: React.ReactNode; color: string }> = {
  ban_user: { label: 'Banir Usuário', icon: <Ban className="h-4 w-4" />, color: 'text-destructive' },
  unban_user: { label: 'Desbanir Usuário', icon: <UserCheck className="h-4 w-4" />, color: 'text-green-500' },
  suspend_subscription: { label: 'Suspender Assinatura', icon: <UserX className="h-4 w-4" />, color: 'text-amber-500' },
  activate_subscription: { label: 'Ativar Assinatura', icon: <UserCheck className="h-4 w-4" />, color: 'text-green-500' },
  cancel_subscription: { label: 'Cancelar Assinatura', icon: <UserX className="h-4 w-4" />, color: 'text-destructive' },
  renew_subscription: { label: 'Renovar Assinatura', icon: <RefreshCw className="h-4 w-4" />, color: 'text-primary' },
  change_plan: { label: 'Alterar Plano', icon: <RefreshCw className="h-4 w-4" />, color: 'text-primary' },
  delete_user: { label: 'Excluir Usuário', icon: <UserX className="h-4 w-4" />, color: 'text-destructive' },
  create_coupon: { label: 'Criar Cupom', icon: <Ticket className="h-4 w-4" />, color: 'text-primary' },
  update_coupon: { label: 'Atualizar Cupom', icon: <Ticket className="h-4 w-4" />, color: 'text-primary' },
  delete_coupon: { label: 'Excluir Cupom', icon: <Ticket className="h-4 w-4" />, color: 'text-destructive' },
};

const AuditLogs = () => {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Histórico de ações realizadas pelos administradores da plataforma
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Últimas Ações ({logs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <ScrollText className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma ação registrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Alvo</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const actionInfo = actionLabels[log.action] || {
                      label: log.action,
                      icon: <ScrollText className="h-4 w-4" />,
                      color: 'text-muted-foreground',
                    };

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${actionInfo.color}`}>
                            {actionInfo.icon}
                            <span>{actionInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.super_admin_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.target_user_id ? `${log.target_user_id.slice(0, 8)}...` : '-'}
                        </TableCell>
                        <TableCell>
                          {log.details ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {JSON.stringify(log.details).slice(0, 50)}
                              {JSON.stringify(log.details).length > 50 ? '...' : ''}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AuditLogs;
