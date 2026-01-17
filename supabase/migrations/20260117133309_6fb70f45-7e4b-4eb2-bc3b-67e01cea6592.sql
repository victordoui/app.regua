-- Sprint 7: Criar tabela barber_shifts para gestão de turnos de barbeiros

CREATE TABLE IF NOT EXISTS public.barber_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  barber_id UUID NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  specific_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  break_start TIME,
  break_end TIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Validação: horário de início deve ser antes do fim
  CONSTRAINT valid_shift_times CHECK (start_time < end_time),
  
  -- Validação: intervalo deve ter início e fim válidos
  CONSTRAINT valid_break_times CHECK (
    (break_start IS NULL AND break_end IS NULL) OR
    (break_start IS NOT NULL AND break_end IS NOT NULL AND break_start < break_end AND break_start >= start_time AND break_end <= end_time)
  ),
  
  -- Validação: turno recorrente precisa de day_of_week, específico precisa de data
  CONSTRAINT recurring_or_specific CHECK (
    (is_recurring = true AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (is_recurring = false AND specific_date IS NOT NULL AND day_of_week IS NULL)
  )
);

-- Índices para performance
CREATE INDEX idx_barber_shifts_barber ON public.barber_shifts(barber_id);
CREATE INDEX idx_barber_shifts_user ON public.barber_shifts(user_id);
CREATE INDEX idx_barber_shifts_day ON public.barber_shifts(day_of_week) WHERE is_recurring = true;
CREATE INDEX idx_barber_shifts_date ON public.barber_shifts(specific_date) WHERE specific_date IS NOT NULL;

-- Índice único para evitar turnos recorrentes duplicados no mesmo dia
CREATE UNIQUE INDEX idx_unique_recurring_shift 
  ON public.barber_shifts(user_id, barber_id, day_of_week) 
  WHERE is_recurring = true AND status = 'active';

-- Habilitar RLS
ALTER TABLE public.barber_shifts ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their barber shifts" 
  ON public.barber_shifts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their barber shifts" 
  ON public.barber_shifts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their barber shifts" 
  ON public.barber_shifts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their barber shifts" 
  ON public.barber_shifts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_barber_shifts_updated_at
  BEFORE UPDATE ON public.barber_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();