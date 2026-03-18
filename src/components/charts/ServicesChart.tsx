import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieIcon } from 'lucide-react';

interface ServicesChartProps {
  data?: { name: string; value: number }[];
}

const defaultData = [
  { name: 'Corte Masculino', value: 145 },
  { name: 'Corte + Barba', value: 98 },
  { name: 'Barba', value: 67 },
  { name: 'Degradê', value: 52 },
  { name: 'Outros', value: 28 },
];

const COLORS = ['#4FA3FF', '#1F4FA3', '#6BB8FF', '#0D3A8F', '#404040'];

const ServicesChart: React.FC<ServicesChartProps> = ({ data = defaultData }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="rounded-xl border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#4FA3FF] to-[#1F4FA3]">
            <PieIcon className="h-3.5 w-3.5 text-white" />
          </div>
          Serviços Mais Populares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  backgroundColor: '#282828',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '10%' }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-[10px] text-muted-foreground">serviços</p>
            </div>
          </div>
        </div>
        {/* Inline legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesChart;
