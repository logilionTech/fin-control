-- Supabase Schema para FinControl

-- 1. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Usuarios
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'bloqueado')),
  rol TEXT DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  plan TEXT DEFAULT 'gratuito' CHECK (plan IN ('gratuito', 'profesional', 'empresarial'))
);

-- Habilitar RLS en users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins pueden ver todos los usuarios" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Admins pueden actualizar usuarios" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'admin')
);

-- 3. Trigger para crear usuario en public.users automáticamente tras el signup en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nombre, email, rol)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'nombre', 
    new.email,
    CASE WHEN new.email = 'logiliontec@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Tabla de Gastos/Ingresos (expenses)
CREATE TABLE public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  categoria TEXT NOT NULL,
  descripcion TEXT,
  valor DECIMAL(12, 2) NOT NULL
);

-- Habilitar RLS en expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para expenses
CREATE POLICY "Usuarios pueden ver sus propios movimientos" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus propios movimientos" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus propios movimientos" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar sus propios movimientos" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- 5. Tabla de Suscripciones
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  plan TEXT NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'cancelado')),
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS en subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
CREATE POLICY "Usuarios pueden ver sus suscripciones" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

