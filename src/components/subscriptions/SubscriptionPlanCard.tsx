import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Power, PowerOff, CheckCircle, Scissors } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscriptions';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onToggleStatus: (planId: string, currentStatus: boolean) => void;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ plan, onEdit, onToggleStatus }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <Badge variant={plan.active ? "default" : "secondary"}>
            {plan.active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        <div className="text-2xl font-bold mb-4">
          R$ {plan.price.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground">/{plan.billing_cycle}</span>
        </div>
        <div className="space-y-2 mb-4">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(plan.id, plan.active)}
          >
            {plan.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlanCard;