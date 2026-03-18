import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OccupancyChartProps {
  data?: { hour: string; occupancy: number; target: number }[];
}

const defaultData = [
  { hour: '08h', occupancy: 40, target: 70 },
  { hour: '09h', occupancy: 65, target: 70 },
  { hour: '10h', occupancy: 85, target: 70 },
  { hour: '11h', occupancy: 90, target: 70 },
  { hour: '12h', occupancy: 45, target: 70 },
  { hour: '13h', occupancy: 55, target: 70 },
  { hour: '14h', occupancy: 78, target: 70 },
  { hour: '15h', occupancy: 92, target: 70 },
  { hour: '16h', occupancy: 88, target: 70 },
  { hour: '17h', occupancy: 95, target: 70 },
  { hour: '18h', occupancy: 82, target: 70 },
  { hour: '19h', occupancy: 60, target: 70 },
];

const OccupancyChart: React.FC<OccupancyChartProps> = ({ data = defaultData }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Taxa de Ocupação por Horário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="hour" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value}%`, 
                  name === 'occupancy' ? 'Ocupação' : 'Meta'
                ]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                formatter={(value) => (
                  <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                    {value === 'occupancy' ? 'Ocupação' : 'Meta'}
                  </span>
                )}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="target"
              />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                name="occupancy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OccupancyChart;
