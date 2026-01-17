-- Adicionar coluna allow_guest_booking em barbershop_settings
ALTER TABLE barbershop_settings 
ADD COLUMN IF NOT EXISTS allow_guest_booking BOOLEAN DEFAULT true;

-- Tabela principal de combos
CREATE TABLE IF NOT EXISTS service_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de junção combo <-> serviços
CREATE TABLE IF NOT EXISTS service_combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES service_combos(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(combo_id, service_id)
);

-- Habilitar RLS
ALTER TABLE service_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_combo_items ENABLE ROW LEVEL SECURITY;

-- Policies para service_combos (owner)
CREATE POLICY "Users can view their own combos" ON service_combos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own combos" ON service_combos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own combos" ON service_combos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own combos" ON service_combos
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para service_combo_items (baseado no owner do combo)
CREATE POLICY "Users can view own combo items" ON service_combo_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM service_combos WHERE id = combo_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own combo items" ON service_combo_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM service_combos WHERE id = combo_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own combo items" ON service_combo_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM service_combos WHERE id = combo_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own combo items" ON service_combo_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM service_combos WHERE id = combo_id AND user_id = auth.uid()
  ));

-- Policy pública para clientes visualizarem combos ativos
CREATE POLICY "Public can view active combos" ON service_combos
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view active combo items" ON service_combo_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM service_combos WHERE id = combo_id AND active = true
  ));

-- Trigger para updated_at
CREATE TRIGGER update_service_combos_updated_at
  BEFORE UPDATE ON service_combos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();