import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';

interface TodayMetricsPanelProps {
  todayAppointments: number;
  todayRevenue: number;
  todayCompleted: number;
  todayPending: number;
  avgServiceTime: number;
}

const TodayMetricsPanel: React.FC<TodayMetricsPanelProps> = ({
  todayAppointments,
  todayRevenue,
  todayCompleted,
  todayPending,
  avgServiceTime
}) => {
  const metrics = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.toString(),
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: 'Receita do Dia',
      value: `R$ ${todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      label: 'Concluídos',
      value: todayCompleted.toString(),
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      label: 'Pendentes',
      value: todayPending.toString(),
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      label: 'Tempo Médio',
      value: `${avgServiceTime} min`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${metric.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TodayMetricsPanel;
