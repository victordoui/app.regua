import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface BarberOccupancy {
  id: string;
  name: string;
  appointmentsToday: number;
  completedToday: number;
  occupancyRate: number;
  revenue: number;
}

interface BarberOccupancyCardProps {
  barbers: BarberOccupancy[];
}

const BarberOccupancyCard: React.FC<BarberOccupancyCardProps> = ({ barbers }) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Ocupação por Barbeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        {barbers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Nenhum barbeiro encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {barbers.map((barber, index) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(barber.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{barber.name}</p>
                    <span className={`text-sm font-bold ${getOccupancyColor(barber.occupancyRate)}`}>
                      {barber.occupancyRate.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={barber.occupancyRate} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {barber.completedToday}/{barber.appointmentsToday} atendimentos
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      R$ {barber.revenue.toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarberOccupancyCard;
