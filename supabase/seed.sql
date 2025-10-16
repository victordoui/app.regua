-- Seed data for Na Régua Barber System
-- This script populates the database with sample data for testing

-- Insert sample services
INSERT INTO public.services (name, description, price, duration_minutes, active, user_id) VALUES
('Corte Masculino', 'Corte de cabelo masculino tradicional', 25.00, 30, true, '00000000-0000-0000-0000-000000000000'),
('Barba Completa', 'Aparar e modelar barba completa', 20.00, 20, true, '00000000-0000-0000-0000-000000000000'),
('Corte + Barba', 'Pacote completo corte e barba', 40.00, 45, true, '00000000-0000-0000-0000-000000000000'),
('Sobrancelha', 'Design e aparar sobrancelhas', 15.00, 15, true, '00000000-0000-0000-0000-000000000000'),
('Lavagem + Corte', 'Lavagem e corte de cabelo', 35.00, 40, true, '00000000-0000-0000-0000-000000000000'),
('Corte Infantil', 'Corte especial para crianças', 20.00, 25, true, '00000000-0000-0000-0000-000000000000'),
('Hidratação Capilar', 'Tratamento de hidratação para cabelos', 30.00, 35, true, '00000000-0000-0000-0000-000000000000'),
('Relaxamento', 'Relaxamento e alisamento capilar', 50.00, 60, true, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO public.clients (name, phone, email, notes, user_id) VALUES
('João Silva', '(11) 99999-1234', 'joao.silva@email.com', 'Cliente frequente, prefere cortes clássicos', '00000000-0000-0000-0000-000000000000'),
('Pedro Santos', '(11) 98888-5678', 'pedro.santos@email.com', 'Gosta de estilos modernos', '00000000-0000-0000-0000-000000000000'),
('Carlos Oliveira', '(11) 97777-9012', 'carlos.oliveira@email.com', 'Cliente VIP, sempre agenda com antecedência', '00000000-0000-0000-0000-000000000000'),
('Roberto Lima', '(11) 96666-3456', 'roberto.lima@email.com', 'Prefere atendimento pela manhã', '00000000-0000-0000-0000-000000000000'),
('Fernando Costa', '(11) 95555-7890', 'fernando.costa@email.com', 'Cliente novo, primeira visita', '00000000-0000-0000-0000-000000000000'),
('Marcos Pereira', '(11) 94444-2345', 'marcos.pereira@email.com', 'Tem alergia a alguns produtos', '00000000-0000-0000-0000-000000000000'),
('André Rodrigues', '(11) 93333-6789', 'andre.rodrigues@email.com', 'Cliente executivo, horários flexíveis', '00000000-0000-0000-0000-000000000000'),
('Lucas Ferreira', '(11) 92222-0123', 'lucas.ferreira@email.com', 'Jovem, gosta de cortes estilosos', '00000000-0000-0000-0000-000000000000'),
('Rafael Almeida', '(11) 91111-4567', 'rafael.almeida@email.com', 'Cliente fiel há 2 anos', '00000000-0000-0000-0000-000000000000'),
('Gustavo Martins', '(11) 90000-8901', 'gustavo.martins@email.com', 'Prefere barbeiros experientes', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments for the current week
INSERT INTO public.appointments (client_id, service_id, appointment_date, appointment_time, status, notes, total_price, user_id) 
SELECT 
  c.id as client_id,
  s.id as service_id,
  CURRENT_DATE + (random() * 7)::integer as appointment_date,
  (ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'])[floor(random() * 14 + 1)] as appointment_time,
  (ARRAY['pending', 'confirmed', 'completed'])[floor(random() * 3 + 1)] as status,
  'Agendamento de exemplo' as notes,
  s.price as total_price,
  '00000000-0000-0000-0000-000000000000' as user_id
FROM 
  (SELECT id FROM public.clients ORDER BY random() LIMIT 15) c
CROSS JOIN 
  (SELECT id, price FROM public.services ORDER BY random() LIMIT 1) s
ON CONFLICT (id) DO NOTHING;

-- Insert sample client feedback
INSERT INTO public.client_feedback (client_id, rating, feedback_text, service_quality, punctuality, cleanliness, would_recommend)
SELECT 
  c.id as client_id,
  (4 + random())::integer as rating,
  (ARRAY[
    'Excelente atendimento, muito satisfeito!',
    'Serviço de qualidade, recomendo!',
    'Profissional muito competente.',
    'Ambiente limpo e organizado.',
    'Pontualidade exemplar.',
    'Superou minhas expectativas!'
  ])[floor(random() * 6 + 1)] as feedback_text,
  (4 + random())::integer as service_quality,
  (4 + random())::integer as punctuality,
  (4 + random())::integer as cleanliness,
  true as would_recommend
FROM 
  (SELECT id FROM public.clients ORDER BY random() LIMIT 8) c
ON CONFLICT (id) DO NOTHING;

-- Insert sample performance metrics for the current month
INSERT INTO public.performance_metrics (user_id, metric_date, appointments_completed, revenue_generated, client_satisfaction_avg, services_upsold, new_clients_acquired, subscription_conversions)
SELECT 
  '00000000-0000-0000-0000-000000000000' as user_id,
  CURRENT_DATE - (random() * 30)::integer as metric_date,
  (5 + random() * 15)::integer as appointments_completed,
  (200 + random() * 800)::decimal(10,2) as revenue_generated,
  (4.0 + random())::decimal(3,2) as client_satisfaction_avg,
  (random() * 5)::integer as services_upsold,
  (random() * 3)::integer as new_clients_acquired,
  (random() * 2)::integer as subscription_conversions
FROM generate_series(1, 15)
ON CONFLICT (barbeiro_id, metric_date) DO NOTHING;