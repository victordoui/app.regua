import React, { useState, useMemo } from 'react';
import { Appointment } from '@/types/appointments';
import { format, parseISO, formatDistanceToNow, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowUpDown, 
  Search, 
  Edit, 
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentTableViewProps {
  appointments: Appointment[];
  onEditAppointment: (appointment: Appointment) => void;
}

type SortField = 'client' | 'service' | 'date' | 'barber' | 'status' | 'created';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const AppointmentTableView: React.FC<AppointmentTableViewProps> = ({
  appointments,
  onEditAppointment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort appointments
  const processedAppointments = useMemo(() => {
    let result = [...appointments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(apt => 
        apt.clients?.name?.toLowerCase().includes(term) ||
        apt.services?.name?.toLowerCase().includes(term) ||
        apt.barbers?.full_name?.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'client':
          comparison = (a.clients?.name || '').localeCompare(b.clients?.name || '');
          break;
        case 'service':
          comparison = (a.services?.name || '').localeCompare(b.services?.name || '');
          break;
        case 'date':
          comparison = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - 
                       new Date(`${b.appointment_date}T${b.appointment_time}`).getTime();
          break;
        case 'barber':
          comparison = (a.barbers?.full_name || '').localeCompare(b.barbers?.full_name || '');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [appointments, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = processedAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isNew = (apt: Appointment) => {
    if (!apt.created_at) return false;
    return differenceInHours(new Date(), parseISO(apt.created_at)) < 24;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', text: string }> = {
      pending: { variant: 'secondary', text: 'Pendente' },
      confirmed: { variant: 'default', text: 'Confirmado' },
      completed: { variant: 'outline', text: 'Concluído' },
      cancelled: { variant: 'destructive', text: 'Cancelado' },
      no_show: { variant: 'destructive', text: 'Não compareceu' },
    };
    const cfg = config[status] || config.pending;
    return <Badge variant={cfg.variant}>{cfg.text}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Cliente', 'Serviço', 'Data', 'Horário', 'Barbeiro', 'Status', 'Criado em'];
    const rows = processedAppointments.map(apt => [
      apt.clients?.name || 'N/A',
      apt.services?.name || 'N/A',
      format(parseISO(apt.appointment_date), 'dd/MM/yyyy'),
      apt.appointment_time,
      apt.barbers?.full_name || 'N/A',
      apt.status,
      apt.created_at ? format(parseISO(apt.created_at), 'dd/MM/yyyy HH:mm') : 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agendamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <TableHead 
      onClick={() => handleSort(field)}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          "h-3 w-3 transition-colors",
          sortField === field ? "text-primary" : "text-muted-foreground/50"
        )} />
      </div>
    </TableHead>
  );

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, serviço ou barbeiro..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="client">Cliente</SortableHeader>
              <SortableHeader field="service">Serviço</SortableHeader>
              <SortableHeader field="date">Data/Hora</SortableHeader>
              <SortableHeader field="barber">Barbeiro</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="created">Criado em</SortableHeader>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedAppointments.map((apt) => (
                <TableRow 
                  key={apt.id}
                  className={cn(isNew(apt) && "bg-amber-50/50 dark:bg-amber-950/20")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isNew(apt) && (
                        <Badge className="bg-amber-500 text-amber-950 text-[9px] py-0 px-1">
                          <Sparkles className="w-2 h-2" />
                        </Badge>
                      )}
                      <span className="font-medium">{apt.clients?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{apt.services?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(parseISO(apt.appointment_date), 'dd/MM/yyyy')}</div>
                      <div className="text-muted-foreground">{apt.appointment_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.barbers?.full_name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-primary">
                        {apt.created_at 
                          ? formatDistanceToNow(parseISO(apt.created_at), { addSuffix: true, locale: ptBR })
                          : 'N/A'
                        }
                      </div>
                      {apt.created_at && (
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(apt.created_at), 'dd/MM HH:mm')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditAppointment(apt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, processedAppointments.length)} de {processedAppointments.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTableView;
