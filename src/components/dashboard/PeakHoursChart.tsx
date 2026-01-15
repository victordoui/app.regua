import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

interface PeakHoursChartProps {
  data: { hour: string; count: number }[];
}

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const getBarColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'hsl(var(--primary))';
    if (intensity > 0.5) return 'hsl(var(--primary) / 0.7)';
    if (intensity > 0.3) return 'hsl(var(--primary) / 0.5)';
    return 'hsl(var(--primary) / 0.3)';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Horários de Pico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value} agendamentos`, 'Total']}
                labelFormatter={(label) => `${label}:00`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/30" /> Baixo
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/70" /> Médio
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" /> Alto
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeakHoursChart;
