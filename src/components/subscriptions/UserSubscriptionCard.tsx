import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { UserSubscription } from '@/types/subscriptions';

interface UserSubscriptionCardProps {
  subscription: UserSubscription;
  onUpdateStatus: (id: string, newStatus: string) => void;
}

const UserSubscriptionCard: React.FC<UserSubscriptionCardProps> = ({ subscription, onUpdateStatus }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{subscription.subscription_plans?.name}</CardTitle>
          <Badge variant={subscription.status === 'active' ? "default" : "secondary"}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Cliente:</span> {subscription.clients?.name}
          </p>
          <p className="text-sm">
            <span className="font-medium">Início:</span> {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm">
            <span className="font-medium">Fim:</span> {new Date(subscription.end_date).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-lg font-bold">
            R$ {subscription.subscription_plans?.price?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(subscription.id, subscription.status === 'active' ? 'cancelled' : 'active')}
          >
            {subscription.status === 'active' ? 'Cancelar' : 'Ativar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionCard;