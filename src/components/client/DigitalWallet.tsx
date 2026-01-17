import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Gift, Star, Ticket, ChevronRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface DigitalWalletProps {
  loyaltyPoints?: number;
  giftCardBalance?: number;
  availableCoupons?: number;
  nextRewardAt?: number;
  onViewDetails?: () => void;
}

export const DigitalWallet = ({
  loyaltyPoints = 0,
  giftCardBalance = 0,
  availableCoupons = 0,
  nextRewardAt = 100,
  onViewDetails,
}: DigitalWalletProps) => {
  const progressPercent = Math.min((loyaltyPoints / nextRewardAt) * 100, 100);
  const pointsToNextReward = Math.max(nextRewardAt - loyaltyPoints, 0);

  const items = [
    {
      icon: Star,
      label: "Pontos",
      value: loyaltyPoints,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Gift,
      label: "Gift Card",
      value: `R$ ${giftCardBalance.toFixed(2)}`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Ticket,
      label: "Cupons",
      value: availableCoupons,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Minha Carteira
          </span>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails} className="gap-1 text-xs">
              Ver tudo
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${item.bgColor} text-center`}
            >
              <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress to next reward */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Próxima recompensa
            </span>
            <Badge variant="secondary" className="text-xs">
              {pointsToNextReward} pts restantes
            </Badge>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {loyaltyPoints} / {nextRewardAt} pontos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
