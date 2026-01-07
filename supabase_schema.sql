-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA CINCEL CRM
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'vendedor', 'supervisor', 'operaciones')),
  avatar TEXT,
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  empresa TEXT,
  tipo TEXT CHECK (tipo IN ('residencial', 'comercial', 'industrial')),
  rfc TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  notas TEXT,
  etiquetas TEXT[],
  valor_total DECIMAL(12, 2) DEFAULT 0,
  proyectos_activos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: leads
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT NOT NULL,
  empresa TEXT,
  origen TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('nuevo', 'contactado', 'calificado', 'propuesta', 'negociacion', 'ganado', 'perdido')),
  probabilidad INTEGER DEFAULT 50,
  presupuesto_estimado DECIMAL(12, 2),
  notas TEXT,
  fecha_contacto TIMESTAMP WITH TIME ZONE,
  fecha_cierre_estimada DATE,
  razon_perdida TEXT,
  responsable_id UUID REFERENCES usuarios(id),
  cliente_id UUID REFERENCES clientes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: obras
-- ============================================
CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('construccion', 'remodelacion', 'mantenimiento', 'otro')),
  estado TEXT NOT NULL CHECK (estado IN ('planificacion', 'en_progreso', 'pausada', 'completada', 'cancelada')),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  cliente_nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado_republica TEXT NOT NULL,
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  presupuesto_total DECIMAL(12, 2) NOT NULL,
  costo_actual DECIMAL(12, 2) DEFAULT 0,
  porcentaje_avance INTEGER DEFAULT 0,
  responsable_id UUID REFERENCES usuarios(id),
  responsable_nombre TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: obras_bitacora
-- ============================================
CREATE TABLE IF NOT EXISTS obras_bitacora (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('avance', 'problema', 'decision', 'cambio', 'visita', 'otro')),
  autor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: obras_tareas
-- ============================================
CREATE TABLE IF NOT EXISTS obras_tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  responsable TEXT,
  completado_el TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: obras_costos
-- ============================================
CREATE TABLE IF NOT EXISTS obras_costos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('material', 'mano_obra', 'equipo', 'subcontrato', 'otro')),
  monto DECIMAL(12, 2) NOT NULL,
  proveedor TEXT,
  factura TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: obras_fotos
-- ============================================
CREATE TABLE IF NOT EXISTS obras_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID REFERENCES obras(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: presupuestos
-- ============================================
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  cliente_nombre TEXT NOT NULL,
  proyecto TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'rechazado', 'revision')),
  subtotal DECIMAL(12, 2) NOT NULL,
  iva DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  vigencia_dias INTEGER DEFAULT 30,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  notas TEXT,
  terminos_condiciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: presupuestos_items
-- ============================================
CREATE TABLE IF NOT EXISTS presupuestos_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE NOT NULL,
  orden INTEGER NOT NULL,
  concepto TEXT NOT NULL,
  descripcion TEXT,
  cantidad DECIMAL(10, 2) NOT NULL,
  unidad TEXT NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: tareas
-- ============================================
CREATE TABLE IF NOT EXISTS tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('llamada', 'reunion', 'seguimiento', 'email', 'visita', 'otro')),
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  prioridad TEXT NOT NULL CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  asignado_a TEXT,
  relacionado_tipo TEXT,
  relacionado_id TEXT,
  relacionado_nombre TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: conversaciones
-- ============================================
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'facebook', 'instagram', 'email', 'telefono', 'web')),
  contacto_id TEXT NOT NULL,
  contacto_nombre TEXT NOT NULL,
  contacto_telefono TEXT,
  contacto_email TEXT,
  contacto_avatar TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('activa', 'cerrada', 'archivada')),
  etiquetas TEXT[],
  asignado_a TEXT,
  ultimo_mensaje TEXT,
  ultimo_mensaje_fecha TIMESTAMP WITH TIME ZONE,
  mensajes_sin_leer INTEGER DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: mensajes
-- ============================================
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('texto', 'imagen', 'archivo', 'audio', 'video')),
  es_entrante BOOLEAN DEFAULT true,
  leido BOOLEAN DEFAULT false,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  remitente TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: plantillas_mensajes
-- ============================================
CREATE TABLE IF NOT EXISTS plantillas_mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  contenido TEXT NOT NULL,
  categoria TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: configuracion
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================

-- Clientes
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_created_at ON clientes(created_at DESC);

-- Leads
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_responsable ON leads(responsable_id);
CREATE INDEX idx_leads_cliente ON leads(cliente_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Obras
CREATE INDEX idx_obras_estado ON obras(estado);
CREATE INDEX idx_obras_cliente ON obras(cliente_id);
CREATE INDEX idx_obras_responsable ON obras(responsable_id);
CREATE INDEX idx_obras_created_at ON obras(created_at DESC);

-- Obras relacionadas
CREATE INDEX idx_obras_bitacora_obra ON obras_bitacora(obra_id, fecha DESC);
CREATE INDEX idx_obras_tareas_obra ON obras_tareas(obra_id, estado);
CREATE INDEX idx_obras_costos_obra ON obras_costos(obra_id, fecha DESC);
CREATE INDEX idx_obras_fotos_obra ON obras_fotos(obra_id, fecha DESC);

-- Presupuestos
CREATE INDEX idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX idx_presupuestos_cliente ON presupuestos(cliente_id);
CREATE INDEX idx_presupuestos_created_at ON presupuestos(created_at DESC);

-- Tareas
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_prioridad ON tareas(prioridad);
CREATE INDEX idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);

-- Conversaciones
CREATE INDEX idx_conversaciones_canal ON conversaciones(canal);
CREATE INDEX idx_conversaciones_estado ON conversaciones(estado);
CREATE INDEX idx_conversaciones_contacto ON conversaciones(contacto_id);
CREATE INDEX idx_conversaciones_updated_at ON conversaciones(updated_at DESC);

-- Mensajes
CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id, fecha DESC);
CREATE INDEX idx_mensajes_leido ON mensajes(leido);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_tareas_updated_at BEFORE UPDATE ON obras_tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plantillas_updated_at BEFORE UPDATE ON plantillas_mensajes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuario admin por defecto (contraseña: admin123)
INSERT INTO usuarios (email, nombre, rol) 
VALUES ('admin@cincel.com', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) 
VALUES 
  ('etapas_pipeline', '["nuevo", "contactado", "calificado", "propuesta", "negociacion", "ganado", "perdido"]', 'Etapas del pipeline de ventas'),
  ('origenes_lead', '["web", "telefono", "email", "referido", "redes_sociales", "evento", "otro"]', 'Orígenes de leads'),
  ('iva_porcentaje', '16', 'Porcentaje de IVA')
ON CONFLICT (clave) DO NOTHING;

-- Plantillas de mensajes iniciales
INSERT INTO plantillas_mensajes (nombre, contenido, categoria) 
VALUES 
  ('Bienvenida', '¡Hola! Gracias por contactar a Cincel Construcciones. ¿En qué podemos ayudarte?', 'general'),
  ('Cotización enviada', 'Hemos enviado tu cotización. ¿Tienes alguna pregunta?', 'ventas'),
  ('Seguimiento', 'Hola, ¿cómo vas? ¿Tienes alguna duda sobre nuestra propuesta?', 'seguimiento')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Opcional - Comentado)
-- ============================================

-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
-- etc...

-- CREATE POLICY "Usuarios pueden ver sus propios registros" ON leads
--   FOR SELECT USING (auth.uid() = responsable_id OR auth.uid() IN (SELECT id FROM usuarios WHERE rol = 'admin'));
