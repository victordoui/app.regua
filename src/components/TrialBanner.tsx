import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';
import { useMySubscription } from '@/hooks/useMySubscription';

const TrialBanner = () => {
  const navigate = useNavigate();
  const { subscription, daysRemaining, isLoading } = useMySubscription();

  if (isLoading || !subscription) return null;

  const isTrial = subscription.plan_type === 'trial' && subscription.status === 'active';
  if (!isTrial) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 py-1 px-2 text-xs font-medium">
        <Clock className="h-3 w-3" />
        Trial {daysRemaining !== null ? `• ${daysRemaining}d` : ''}
      </Badge>
      <Button
        size="sm"
        variant="default"
        className="h-7 text-xs gap-1"
        onClick={() => navigate('/upgrade')}
      >
        <Sparkles className="h-3 w-3" />
        Assinar Plano
      </Button>
    </div>
  );
};

export default TrialBanner;
