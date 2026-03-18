import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  data?: { month: string; revenue: number }[];
}

const defaultData = [
  { month: 'Ago', revenue: 12500 },
  { month: 'Set', revenue: 15800 },
  { month: 'Out', revenue: 14200 },
  { month: 'Nov', revenue: 18500 },
  { month: 'Dez', revenue: 22000 },
  { month: 'Jan', revenue: 16800 },
];

const RevenueChart: React.FC<RevenueChartProps> = ({ data = defaultData }) => {
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;

  return (
    <Card className="rounded-xl border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#4FA3FF] to-[#1F4FA3]">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          Faturamento Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4FA3FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4FA3FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#B0B0B0', fontSize: 12 }}
                axisLine={{ stroke: '#404040' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: '#B0B0B0', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                contentStyle={{
                  backgroundColor: '#282828',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
                labelStyle={{ color: '#B0B0B0' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4FA3FF"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={{ fill: '#4FA3FF', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#4FA3FF', stroke: '#1A1A1A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
