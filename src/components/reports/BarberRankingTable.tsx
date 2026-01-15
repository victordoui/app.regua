import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { BarberPerformanceData } from '@/hooks/useBarberPerformance';

interface BarberRankingTableProps {
  barbers: BarberPerformanceData[];
}

const BarberRankingTable: React.FC<BarberRankingTableProps> = ({ barbers }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground font-medium">{index + 1}º</span>;
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ranking de Barbeiros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Barbeiro</TableHead>
                <TableHead className="text-center">Atendimentos</TableHead>
                <TableHead className="text-center">Receita</TableHead>
                <TableHead className="text-center">Taxa Conclusão</TableHead>
                <TableHead className="text-center">Avaliação</TableHead>
                <TableHead>Top Serviços</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barbers.map((barber, index) => (
                <TableRow key={barber.id}>
                  <TableCell className="text-center">
                    {getRankBadge(index)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(barber.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{barber.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {barber.cancelledAppointments} cancelados
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-lg">{barber.completedAppointments}</span>
                      <span className="text-xs text-muted-foreground">
                        de {barber.totalAppointments}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-green-600">
                      R$ {barber.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-bold ${getCompletionColor(barber.completionRate)}`}>
                        {barber.completionRate.toFixed(0)}%
                      </span>
                      <Progress value={barber.completionRate} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {barber.averageRating > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{barber.averageRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {barber.topServices.slice(0, 2).map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {service.name} ({service.count})
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {barbers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum barbeiro encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarberRankingTable;
