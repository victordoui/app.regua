import { useState } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useExpiringSubscriptions, useExpiringStats } from '@/hooks/superadmin/useExpiringSubscriptions';
import { useSubscribers } from '@/hooks/useSuperAdmin';
import { CalendarClock, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PlanType } from '@/types/superAdmin';

const planLabels: Record<PlanType, string> = {
  trial: 'Trial',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const ExpiringSubscriptions = () => {
  const [selectedDays, setSelectedDays] = useState<'7' | '15' | '30'>('7');
  const daysAhead = parseInt(selectedDays);
  
  const { data: subscriptions, isLoading } = useExpiringSubscriptions(daysAhead);
  const { data: stats } = useExpiringStats();
  const { renewSubscription, isUpdating } = useSubscribers();

  const handleRenew = (id: string) => {
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    renewSubscription(id, newEndDate.toISOString());
  };

  const getUrgencyColor = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days <= 3) return 'text-destructive bg-destructive/10 border-destructive/20';
    if (days <= 7) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assinaturas Expirando</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie assinaturas próximas do vencimento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.expiring7Days || 0}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximos 15 dias</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.expiring15Days || 0}</p>
                </div>
                <CalendarClock className="h-10 w-10 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximos 30 dias</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.expiring30Days || 0}</p>
                </div>
                <CalendarClock className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Assinaturas a Vencer
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Lembrete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedDays} onValueChange={(v) => setSelectedDays(v as '7' | '15' | '30')}>
              <TabsList className="mb-4">
                <TabsTrigger value="7">7 dias</TabsTrigger>
                <TabsTrigger value="15">15 dias</TabsTrigger>
                <TabsTrigger value="30">30 dias</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedDays}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !subscriptions || subscriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <CalendarClock className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma assinatura expirando nos próximos {selectedDays} dias</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Expira em</TableHead>
                        <TableHead>Dias Restantes</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub) => {
                        const daysLeft = differenceInDays(new Date(sub.end_date!), new Date());
                        return (
                          <TableRow key={sub.id}>
                            <TableCell className="font-mono text-sm">
                              {sub.user_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{planLabels[sub.plan_type]}</Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(sub.end_date!), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge className={getUrgencyColor(sub.end_date!)}>
                                {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenew(sub.id)}
                                disabled={isUpdating}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Renovar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default ExpiringSubscriptions;
