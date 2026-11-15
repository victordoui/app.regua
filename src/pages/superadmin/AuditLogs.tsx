import { useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
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
import { usePlatformUsers } from '@/hooks/superadmin/usePlatformUsers';
import type { AuditAction } from '@/types/superAdmin';
import { ScrollText, UserX, UserCheck, Ticket, RefreshCw, Ban, Mail, Send, Settings, MessageSquare, Eye, LogOut } from 'lucide-react';
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
  send_broadcast: { label: 'Enviar Broadcast', icon: <Send className="h-4 w-4" />, color: 'text-primary' },
  create_template: { label: 'Criar Template', icon: <Mail className="h-4 w-4" />, color: 'text-primary' },
  update_template: { label: 'Atualizar Template', icon: <Mail className="h-4 w-4" />, color: 'text-primary' },
  delete_template: { label: 'Excluir Template', icon: <Mail className="h-4 w-4" />, color: 'text-destructive' },
  update_plan_config: { label: 'Atualizar Config. Plano', icon: <Settings className="h-4 w-4" />, color: 'text-primary' },
  resolve_ticket: { label: 'Resolver Ticket', icon: <MessageSquare className="h-4 w-4" />, color: 'text-green-500' },
  assign_ticket: { label: 'Atribuir Ticket', icon: <MessageSquare className="h-4 w-4" />, color: 'text-primary' },
  impersonation_started: { label: 'Acesso de suporte iniciado', icon: <Eye className="h-4 w-4" />, color: 'text-amber-600' },
  impersonation_ended: { label: 'Acesso de suporte encerrado', icon: <LogOut className="h-4 w-4" />, color: 'text-green-600' },
  revoke_sessions: { label: 'Encerrar sessões', icon: <LogOut className="h-4 w-4" />, color: 'text-amber-600' },
};

const AuditLogs = () => {
  const { data: logs, isLoading } = useAuditLogs();
  const { data: platformUserData } = usePlatformUsers();
  const usersById = useMemo(() => new Map(
    (platformUserData?.users || []).map((user) => [user.user_id, user]),
  ), [platformUserData?.users]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <PageHeader eyebrow="Gestão da plataforma" title="Logs de Auditoria" />
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
                    const actor = usersById.get(log.super_admin_id);
                    const target = log.target_user_id ? usersById.get(log.target_user_id) : undefined;
                    const detailTarget = log.details?.company_name || log.details?.target_name || log.details?.plan_type || log.details?.coupon_code || log.details?.ticket_id || log.details?.coupon_id;
                    const actorLabel = actor?.display_name || actor?.email || log.super_admin_id;
                    const targetLabel = target?.company_name || target?.display_name || target?.email || (typeof detailTarget === 'string' ? detailTarget : null) || log.target_user_id || 'Ação da plataforma';

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
                        <TableCell className="max-w-[220px] truncate text-sm" title={actorLabel}>{actorLabel}</TableCell>
                        <TableCell className="max-w-[240px] truncate text-sm" title={targetLabel}>{targetLabel}</TableCell>
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
