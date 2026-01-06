-- =====================================================
-- CINCEL CRM - Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE lead_estado AS ENUM (
  'nuevo',
  'contactado', 
  'calificado',
  'relevamiento_agendado',
  'relevamiento_realizado',
  'presupuesto_armado',
  'presupuesto_enviado',
  'negociacion',
  'aprobado',
  'en_obra',
  'finalizado',
  'perdido'
);

CREATE TYPE lead_origen AS ENUM (
  'whatsapp',
  'instagram', 
  'facebook',
  'web',
  'referido',
  'google',
  'telefono',
  'otro'
);

CREATE TYPE tipo_obra AS ENUM (
  'reforma',
  'obra_nueva',
  'ampliacion',
  'mantenimiento',
  'piscina',
  'comercial',
  'otro'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'comercial',
  'obra',
  'administrativo'
);

CREATE TYPE presupuesto_estado AS ENUM (
  'borrador',
  'enviado',
  'aceptado',
  'rechazado',
  'vencido'
);

CREATE TYPE obra_estado AS ENUM (
  'planificacion',
  'en_ejecucion',
  'pausada',
  'finalizada',
  'cancelada'
);

CREATE TYPE mensaje_canal AS ENUM (
  'whatsapp',
  'instagram',
  'facebook',
  'email',
  'interno'
);

CREATE TYPE mensaje_direccion AS ENUM (
  'entrante',
  'saliente'
);

CREATE TYPE actividad_tipo AS ENUM (
  'llamada',
  'mensaje',
  'email',
  'visita',
  'reunion',
  'nota',
  'cambio_estado',
  'presupuesto',
  'tarea',
  'otro'
);

CREATE TYPE tarea_prioridad AS ENUM (
  'baja',
  'media',
  'alta',
  'urgente'
);

CREATE TYPE gasto_categoria AS ENUM (
  'materiales',
  'mano_obra',
  'transporte',
  'herramientas',
  'permisos',
  'otros'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'comercial',
  avatar_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  zona TEXT,
  direccion TEXT,
  origen lead_origen NOT NULL DEFAULT 'web',
  tipo_obra tipo_obra,
  presupuesto_estimado DECIMAL(15,2),
  urgencia TEXT,
  estado lead_estado NOT NULL DEFAULT 'nuevo',
  responsable_id UUID REFERENCES public.users(id),
  motivo_perdida TEXT,
  tags TEXT[] DEFAULT '{}',
  notas_internas TEXT,
  ultima_interaccion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  rut TEXT,
  tipo TEXT NOT NULL DEFAULT 'particular' CHECK (tipo IN ('particular', 'empresa')),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Presupuestos
CREATE TABLE public.presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id),
  cliente_id UUID REFERENCES public.clientes(id),
  obra_id UUID,
  numero TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal_mano_obra DECIMAL(15,2) NOT NULL DEFAULT 0,
  subtotal_materiales DECIMAL(15,2) NOT NULL DEFAULT 0,
  subtotal_viaticos DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 22,
  iva_monto DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  estado presupuesto_estado NOT NULL DEFAULT 'borrador',
  validez_dias INTEGER NOT NULL DEFAULT 30,
  condiciones TEXT,
  pdf_url TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Obras
CREATE TABLE public.obras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  presupuesto_id UUID REFERENCES public.presupuestos(id),
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  zona TEXT,
  tipo tipo_obra NOT NULL,
  estado obra_estado NOT NULL DEFAULT 'planificacion',
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  responsable_id UUID REFERENCES public.users(id),
  porcentaje_avance INTEGER NOT NULL DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
  presupuesto_aprobado DECIMAL(15,2),
  costo_real DECIMAL(15,2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK to presupuestos after obras exists
ALTER TABLE public.presupuestos 
  ADD CONSTRAINT fk_presupuestos_obra 
  FOREIGN KEY (obra_id) REFERENCES public.obras(id);

-- Mensajes (Inbox unificado)
CREATE TABLE public.mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id),
  cliente_id UUID REFERENCES public.clientes(id),
  canal mensaje_canal NOT NULL,
  external_thread_id TEXT,
  external_message_id TEXT,
  direccion mensaje_direccion NOT NULL,
  contenido TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  leido BOOLEAN NOT NULL DEFAULT false,
  respondido BOOLEAN NOT NULL DEFAULT false,
  enviado_por UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Actividades (Timeline)
CREATE TABLE public.actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id),
  cliente_id UUID REFERENCES public.clientes(id),
  obra_id UUID REFERENCES public.obras(id),
  presupuesto_id UUID REFERENCES public.presupuestos(id),
  tipo actividad_tipo NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  metadata JSONB,
  usuario_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tareas
CREATE TABLE public.tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID REFERENCES public.obras(id),
  lead_id UUID REFERENCES public.leads(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  asignado_a UUID REFERENCES public.users(id),
  fecha_vencimiento DATE,
  completada BOOLEAN NOT NULL DEFAULT false,
  prioridad tarea_prioridad NOT NULL DEFAULT 'media',
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bitácora de Obra
CREATE TABLE public.bitacora_obra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES public.obras(id),
  fecha DATE NOT NULL,
  resumen TEXT NOT NULL,
  clima TEXT,
  incidentes TEXT,
  fotos TEXT[] DEFAULT '{}',
  usuario_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gastos
CREATE TABLE public.gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES public.obras(id),
  fecha DATE NOT NULL,
  proveedor TEXT,
  categoria gasto_categoria NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  comprobante_url TEXT,
  usuario_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_leads_estado ON public.leads(estado);
CREATE INDEX idx_leads_responsable ON public.leads(responsable_id);
CREATE INDEX idx_leads_origen ON public.leads(origen);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX idx_mensajes_lead ON public.mensajes(lead_id);
CREATE INDEX idx_mensajes_canal ON public.mensajes(canal);
CREATE INDEX idx_mensajes_created_at ON public.mensajes(created_at DESC);
CREATE INDEX idx_mensajes_no_leido ON public.mensajes(leido) WHERE leido = false;

CREATE INDEX idx_actividades_lead ON public.actividades(lead_id);
CREATE INDEX idx_actividades_obra ON public.actividades(obra_id);
CREATE INDEX idx_actividades_created_at ON public.actividades(created_at DESC);

CREATE INDEX idx_obras_cliente ON public.obras(cliente_id);
CREATE INDEX idx_obras_estado ON public.obras(estado);

CREATE INDEX idx_presupuestos_lead ON public.presupuestos(lead_id);
CREATE INDEX idx_presupuestos_cliente ON public.presupuestos(cliente_id);

CREATE INDEX idx_tareas_obra ON public.tareas(obra_id);
CREATE INDEX idx_tareas_asignado ON public.tareas(asignado_a);
CREATE INDEX idx_tareas_pendientes ON public.tareas(completada) WHERE completada = false;

CREATE INDEX idx_gastos_obra ON public.gastos(obra_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_presupuestos_updated_at
  BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_tareas_updated_at
  BEFORE UPDATE ON public.tareas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate presupuesto number
CREATE OR REPLACE FUNCTION generate_presupuesto_numero()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero = 'PPTO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('presupuesto_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS presupuesto_seq START 1;

CREATE TRIGGER tr_presupuesto_numero
  BEFORE INSERT ON public.presupuestos
  FOR EACH ROW EXECUTE FUNCTION generate_presupuesto_numero();

-- Update obra costo_real when gasto is added
CREATE OR REPLACE FUNCTION update_obra_costo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.obras
  SET costo_real = (
    SELECT COALESCE(SUM(monto), 0)
    FROM public.gastos
    WHERE obra_id = NEW.obra_id
  )
  WHERE id = NEW.obra_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_gasto_update_obra
  AFTER INSERT OR UPDATE OR DELETE ON public.gastos
  FOR EACH ROW EXECUTE FUNCTION update_obra_costo();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (simplified - all authenticated can access)
CREATE POLICY "Users can view all" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Leads viewable by authenticated" ON public.leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Clientes viewable by authenticated" ON public.clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Obras viewable by authenticated" ON public.obras FOR ALL TO authenticated USING (true);
CREATE POLICY "Presupuestos viewable by authenticated" ON public.presupuestos FOR ALL TO authenticated USING (true);
CREATE POLICY "Mensajes viewable by authenticated" ON public.mensajes FOR ALL TO authenticated USING (true);
CREATE POLICY "Actividades viewable by authenticated" ON public.actividades FOR ALL TO authenticated USING (true);
CREATE POLICY "Tareas viewable by authenticated" ON public.tareas FOR ALL TO authenticated USING (true);
CREATE POLICY "Bitacora viewable by authenticated" ON public.bitacora_obra FOR ALL TO authenticated USING (true);
CREATE POLICY "Gastos viewable by authenticated" ON public.gastos FOR ALL TO authenticated USING (true);

-- =====================================================
-- SEED DATA (for testing)
-- =====================================================

-- Note: Run this after creating a user in Supabase Auth
-- INSERT INTO public.users (id, email, nombre, role) 
-- VALUES ('YOUR_AUTH_USER_ID', 'admin@cincel.com', 'Administrador', 'admin');
