import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMySubscription } from '@/hooks/useMySubscription';
import SubscriptionInfoCard from '@/components/subscriptions/SubscriptionInfoCard';

interface SubscriberDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const SubscriberDetailDialog = ({ open, onOpenChange, userId }: SubscriberDetailDialogProps) => {
  const subscriptionData = useMySubscription(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Assinante</DialogTitle>
        </DialogHeader>
        {subscriptionData.isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <SubscriptionInfoCard data={subscriptionData} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriberDetailDialog;
