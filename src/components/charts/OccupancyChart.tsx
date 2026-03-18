import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

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
    <Card className="rounded-xl border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#4FA3FF] to-[#1F4FA3]">
            <Activity className="h-3.5 w-3.5 text-white" />
          </div>
          Taxa de Ocupação por Horário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4FA3FF" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#4FA3FF" stopOpacity={0} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#B0B0B0', fontSize: 12 }}
                axisLine={{ stroke: '#404040' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#B0B0B0', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'occupancy' ? 'Ocupação' : 'Meta'
                ]}
                contentStyle={{
                  backgroundColor: '#282828',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
                labelStyle={{ color: '#B0B0B0' }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#B0B0B0', fontSize: '12px' }}>
                    {value === 'occupancy' ? 'Ocupação' : 'Meta'}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#404040"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                name="target"
              />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="#4FA3FF"
                strokeWidth={2.5}
                dot={{ fill: '#4FA3FF', strokeWidth: 0, r: 3, filter: 'url(#glow)' }}
                activeDot={{ r: 6, fill: '#4FA3FF', stroke: '#1A1A1A', strokeWidth: 2 }}
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
