-- Enum para roles de aplicação
CREATE TYPE public.app_role AS ENUM ('admin', 'barbeiro', 'cliente');

-- Tabela de roles separada (segurança - evita privilege escalation)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    barbershop_user_id UUID NULL, -- Para clientes: qual barbearia ele pertence
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role, barbershop_user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver seus próprios roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Política: admins podem gerenciar roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Função de verificação de role (security definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se é cliente de uma barbearia específica
CREATE OR REPLACE FUNCTION public.is_client_of(_user_id UUID, _barbershop_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = 'cliente' 
      AND barbershop_user_id = _barbershop_user_id
  )
$$;

-- Tabela de perfis de cliente (informações adicionais)
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    barbershop_user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    cpf TEXT,
    birth_date DATE,
    avatar_url TEXT,
    address_cep TEXT,
    address_street TEXT,
    address_number TEXT,
    address_city TEXT,
    address_state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para client_profiles
CREATE POLICY "Users can view their own client profile"
ON public.client_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client profile"
ON public.client_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client profile"
ON public.client_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Barbeiros podem ver perfis de clientes da sua barbearia
CREATE POLICY "Barbershop owners can view their clients"
ON public.client_profiles
FOR SELECT
USING (auth.uid() = barbershop_user_id);

-- Trigger para criar role de cliente automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_client_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, barbershop_user_id)
    VALUES (NEW.user_id, 'cliente', NEW.barbershop_user_id)
    ON CONFLICT (user_id, role, barbershop_user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_client_profile_created
    AFTER INSERT ON public.client_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_client_profile();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_client_profiles_updated_at
    BEFORE UPDATE ON public.client_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();