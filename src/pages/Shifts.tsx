import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, Plus, Clock, User, Coffee, Trash2 } from 'lucide-react';
import { useShifts, BarberShift, CreateShiftInput } from '@/hooks/useShifts';
import { useBarbers } from '@/hooks/useBarbers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

const ShiftForm = ({ 
  onSubmit, 
  onClose,
  barbers 
}: { 
  onSubmit: (data: CreateShiftInput) => void; 
  onClose: () => void;
  barbers: any[];
}) => {
  const [formData, setFormData] = useState<CreateShiftInput>({
    barber_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00',
    is_recurring: true,
    break_start: '',
    break_end: ''
  });
  const [isSpecificDate, setIsSpecificDate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    if (isSpecificDate) {
      data.is_recurring = false;
      data.day_of_week = undefined;
    } else {
      data.specific_date = undefined;
    }
    onSubmit(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Barbeiro *</label>
        <Select
          value={formData.barber_id}
          onValueChange={(value) => setFormData({ ...formData, barber_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o barbeiro" />
          </SelectTrigger>
          <SelectContent>
            {barbers.map(barber => (
              <SelectItem key={barber.id} value={barber.id}>{barber.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={isSpecificDate}
          onCheckedChange={setIsSpecificDate}
        />
        <label className="text-sm font-medium">Data específica (exceção)</label>
      </div>

      {isSpecificDate ? (
        <div>
          <label className="text-sm font-medium">Data *</label>
          <Input
            type="date"
            value={formData.specific_date || ''}
            onChange={(e) => setFormData({ ...formData, specific_date: e.target.value })}
            required
          />
        </div>
      ) : (
        <div>
          <label className="text-sm font-medium">Dia da Semana *</label>
          <Select
            value={formData.day_of_week?.toString()}
            onValueChange={(value) => setFormData({ ...formData, day_of_week: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map(day => (
                <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Início do Turno *</label>
          <Input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Fim do Turno *</label>
          <Input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2 flex items-center gap-2">
          <Coffee className="h-4 w-4" />
          Intervalo (opcional)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Início</label>
            <Input
              type="time"
              value={formData.break_start || ''}
              onChange={(e) => setFormData({ ...formData, break_start: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fim</label>
            <Input
              type="time"
              value={formData.break_end || ''}
              onChange={(e) => setFormData({ ...formData, break_end: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar Turno</Button>
      </div>
    </form>
  );
};

const WeeklySchedule = ({ barberId, shifts, onDelete }: { 
  barberId: string; 
  shifts: BarberShift[];
  onDelete: (id: string) => void;
}) => {
  const barberShifts = shifts.filter(s => s.barber_id === barberId && s.is_recurring);

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS_OF_WEEK.map(day => {
        const dayShifts = barberShifts.filter(s => s.day_of_week === day.value);
        return (
          <div key={day.value} className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-2">{day.short}</p>
            <div className="min-h-[80px] bg-muted/50 rounded-lg p-2 space-y-1">
              {dayShifts.length === 0 ? (
                <p className="text-xs text-muted-foreground">Folga</p>
              ) : (
                dayShifts.map(shift => (
                  <div 
                    key={shift.id} 
                    className="bg-primary/10 rounded p-1 text-xs group relative"
                  >
                    <p className="font-medium text-primary">
                      {shift.start_time.slice(0, 5)}-{shift.end_time.slice(0, 5)}
                    </p>
                    {shift.break_start && (
                      <p className="text-muted-foreground">
                        ☕ {shift.break_start.slice(0, 5)}
                      </p>
                    )}
                    <button
                      onClick={() => onDelete(shift.id)}
                      className="absolute -top-1 -right-1 hidden group-hover:block bg-destructive text-white rounded-full p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Shifts = () => {
  const { shifts, isLoading, createShift, deleteShift } = useShifts();
  const { barbers } = useBarbers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');

  const handleCreate = (data: CreateShiftInput) => {
    createShift.mutate(data);
  };

  const filteredShifts = selectedBarber === 'all' 
    ? shifts 
    : shifts.filter(s => s.barber_id === selectedBarber);

  const specificDateShifts = filteredShifts.filter(s => !s.is_recurring);

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarClock className="h-8 w-8 text-primary" />
              Gestão de Turnos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os horários de trabalho dos barbeiros
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Turno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Turno</DialogTitle>
              </DialogHeader>
              <ShiftForm 
                onSubmit={handleCreate} 
                onClose={() => setIsDialogOpen(false)}
                barbers={barbers}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={selectedBarber} onValueChange={setSelectedBarber}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Todos os barbeiros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os barbeiros</SelectItem>
              {barbers.map(barber => (
                <SelectItem key={barber.id} value={barber.id}>{barber.display_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : barbers.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum barbeiro cadastrado</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Weekly Schedules */}
            {(selectedBarber === 'all' ? barbers : barbers.filter(b => b.id === selectedBarber)).map(barber => (
              <Card key={barber.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{barber.display_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Escala Semanal</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <WeeklySchedule 
                    barberId={barber.id} 
                    shifts={shifts}
                    onDelete={(id) => deleteShift.mutate(id)}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Specific Date Exceptions */}
            {specificDateShifts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exceções por Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {specificDateShifts.map(shift => {
                      const barber = barbers.find(b => b.id === shift.barber_id);
                      return (
                        <div key={shift.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              {shift.specific_date && format(new Date(shift.specific_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </Badge>
                            <span className="font-medium">{barber?.display_name}</span>
                            <span className="text-muted-foreground">
                              {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                            </span>
                            {shift.break_start && (
                              <span className="text-sm text-muted-foreground">
                                (Intervalo: {shift.break_start.slice(0, 5)})
                              </span>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteShift.mutate(shift.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shifts;
