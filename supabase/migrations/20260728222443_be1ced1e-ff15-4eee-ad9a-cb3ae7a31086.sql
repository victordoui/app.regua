ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_barbeiro_id_fkey
  FOREIGN KEY (barbeiro_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_barbeiro_id ON public.appointments(barbeiro_id);