import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { UserSubscription } from '@/types/subscriptions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserSubscriptionCardProps {
  subscription: UserSubscription;
  onUpdateStatus: (params: { id: string; status: 'active' | 'cancelled' | 'paused' | 'expired' }) => Promise<any>;
}

const UserSubscriptionCard: React.FC<UserSubscriptionCardProps> = ({ subscription, onUpdateStatus }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'cancelled': return 'destructive';
      case 'paused': return 'secondary';
      case 'expired': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{subscription.subscription_plans?.name || 'Plano Desconhecido'}</CardTitle>
          <Badge variant={getStatusBadgeVariant(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Cliente:</span> {subscription.clients?.name || 'Cliente Desconhecido'}
          </p>
          <p className="text-sm">
            <span className="font-medium">Início:</span> {format(new Date(subscription.start_date), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
          <p className="text-sm">
            <span className="font-medium">Fim:</span> {format(new Date(subscription.end_date), 'dd/MM/yyyy', { locale: ptBR })}
          </p>          
          <p className="text-lg font-bold">
            R$ {subscription.subscription_plans?.price?.toFixed(2) || '0.00'}
            <span className="text-sm font-normal text-muted-foreground">/{subscription.subscription_plans?.billing_cycle === 'monthly' ? 'mês' : 'ano'}</span>
          </p>
          {subscription.credits_remaining > 0 && (
            <p className="text-sm text-muted-foreground">
              Créditos restantes: {subscription.credits_remaining}
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          {subscription.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus({ id: subscription.id, status: 'cancelled' })}
            >
              Cancelar
            </Button>
          )}
          {subscription.status === 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus({ id: subscription.id, status: 'active' })}
            >
              Reativar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionCard;