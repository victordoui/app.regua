import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentFormData, BarberData, Client, Service } from "@/types/appointments";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<BarberData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for now
      setAppointments([
        {
          id: '1',
          client_id: '1',
          service_id: '1',
          barbeiro_id: '1',
          appointment_date: '2024-01-20',
          appointment_time: '14:00',
          status: 'completed',
          notes: 'Cliente satisfeito',
          total_price: 50,
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      
      setClients([
        {
          id: '1',
          name: 'João Silva',
          phone: '11999999999',
          email: 'joao@email.com',
          created_at: new Date().toISOString()
        }
      ]);
      
      setServices([
        {
          id: '1',
          name: 'Corte Masculino',
          description: 'Corte de cabelo padrão',
          price: 50,
          duration_minutes: 30,
          active: true
        }
      ]);
      
      setBarbers([
        {
          id: '1',
          user_id: '1',
          full_name: 'Carlos Barbeiro',
          email: 'carlos@email.com',
          role: 'barbeiro'
        }
      ]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveAppointment = useCallback(async (formData: AppointmentFormData, id: string | null) => {
    try {
      if (id) {
        // Update existing appointment
        setAppointments(prev => 
          prev.map(apt => apt.id === id 
            ? { ...apt, ...formData, updated_at: new Date().toISOString() }
            : apt
          )
        );
        toast({
          title: "Agendamento atualizado com sucesso!",
        });
      } else {
        // Create new appointment
        const newAppointment: Appointment = {
          id: Date.now().toString(),
          ...formData,
          status: 'pending',
          user_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAppointments(prev => [newAppointment, ...prev]);
        toast({
          title: "Agendamento criado com sucesso!",
        });
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar agendamento",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const updateAppointmentStatus = useCallback(async (appointmentId: string, newStatus: string) => {
    try {
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId 
          ? { ...apt, status: newStatus, updated_at: new Date().toISOString() }
          : apt
        )
      );
      toast({
        title: "Status atualizado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast({
        title: "Agendamento excluído com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    appointments,
    clients,
    services,
    barbers,
    loading,
    saveAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    fetchData
  };
};