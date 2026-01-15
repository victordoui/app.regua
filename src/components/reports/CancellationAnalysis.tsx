import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, XCircle, UserX } from 'lucide-react';
import { CancellationAnalysis as CancellationData } from '@/hooks/useBarberPerformance';

interface CancellationAnalysisProps {
  data: CancellationData;
}

const CancellationAnalysis: React.FC<CancellationAnalysisProps> = ({ data }) => {
  const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))'];

  const pieData = [
    { name: 'Cancelados', value: data.totalCancelled },
    { name: 'No-Show', value: data.totalNoShow }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Summary Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Análise de Cancelamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-3xl font-bold text-destructive">{data.totalCancelled}</p>
              <p className="text-xs text-muted-foreground">Cancelados</p>
              <p className="text-sm font-medium text-destructive mt-1">
                {data.cancellationRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10">
              <UserX className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="text-3xl font-bold text-amber-600">{data.totalNoShow}</p>
              <p className="text-xs text-muted-foreground">No-Show</p>
              <p className="text-sm font-medium text-amber-600 mt-1">
                {data.noShowRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Pie Chart */}
          {(data.totalCancelled > 0 || data.totalNoShow > 0) && (
            <div className="h-[150px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Day of Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cancelamentos por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDayOfWeek} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip 
                  formatter={(value: number) => [value, 'Cancelamentos']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--destructive))" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Dias com mais cancelamentos podem indicar 
              conflitos de agenda ou horários menos convenientes para clientes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancellationAnalysis;
