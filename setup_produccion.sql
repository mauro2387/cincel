-- ============================================
-- SCRIPT COMPLETO DE PRODUCCIÓN - CINCEL CRM
-- ============================================
-- Ejecuta este script en Supabase SQL Editor
-- Este script:
-- 1. Crea todas las tablas necesarias
-- 2. Crea índices para optimización
-- 3. Desactiva RLS para simplificar el acceso
-- 4. Inserta configuración inicial (NO datos demo)
-- 5. Sincroniza el usuario admin con auth.users
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LIMPIAR TABLAS EXISTENTES (CUIDADO: Elimina datos)
-- ============================================
-- Descomenta las siguientes líneas si quieres empezar desde cero
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;
-- DROP TABLE IF EXISTS message_templates CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS quote_items CASCADE;
-- DROP TABLE IF EXISTS quotes CASCADE;
-- DROP TABLE IF EXISTS project_photos CASCADE;
-- DROP TABLE IF EXISTS project_costs CASCADE;
-- DROP TABLE IF EXISTS project_tasks CASCADE;
-- DROP TABLE IF EXISTS project_logs CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLA: users (usuarios del sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'supervisor', 'operations')),
  avatar TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: clients (clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  type TEXT CHECK (type IN ('residential', 'commercial', 'industrial')),
  tax_id TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  notes TEXT,
  tags TEXT[],
  total_value DECIMAL(12, 2) DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: leads
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  probability INTEGER DEFAULT 50,
  estimated_budget DECIMAL(12, 2),
  notes TEXT,
  contact_date TIMESTAMP WITH TIME ZONE,
  estimated_close_date DATE,
  lost_reason TEXT,
  responsible_id UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: projects (obras)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('construction', 'remodeling', 'maintenance', 'other')),
  status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'paused', 'completed', 'cancelled')),
  client_id UUID REFERENCES clients(id) NOT NULL,
  client_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  total_budget DECIMAL(12, 2) NOT NULL,
  current_cost DECIMAL(12, 2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  responsible_id UUID REFERENCES users(id),
  responsible_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: project_logs (bitácora de obras)
-- ============================================
CREATE TABLE IF NOT EXISTS project_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('progress', 'issue', 'decision', 'change', 'visit', 'other')),
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: project_tasks (tareas de obras)
-- ============================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  due_date DATE,
  responsible TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: project_costs (costos de obras)
-- ============================================
CREATE TABLE IF NOT EXISTS project_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  concept TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('material', 'labor', 'equipment', 'subcontract', 'other')),
  amount DECIMAL(12, 2) NOT NULL,
  supplier TEXT,
  invoice TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: project_photos (fotos de obras)
-- ============================================
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: quotes (presupuestos)
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'revision')),
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  validity_days INTEGER DEFAULT 30,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: quote_items (items de presupuestos)
-- ============================================
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  order_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: tasks (tareas generales)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: conversations (conversaciones)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'facebook', 'instagram', 'email', 'phone', 'web')),
  contact_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  contact_avatar TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'closed', 'archived')),
  tags TEXT[],
  assigned_to UUID REFERENCES users(id),
  last_message TEXT,
  last_message_date TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: messages (mensajes)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'image', 'file', 'audio', 'video')),
  is_incoming BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  sender TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: message_templates (plantillas de mensajes)
-- ============================================
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: settings (configuración)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_responsible ON leads(responsible_id);
CREATE INDEX IF NOT EXISTS idx_leads_client ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_responsible ON projects(responsible_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Project related
CREATE INDEX IF NOT EXISTS idx_project_logs_project ON project_logs(project_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_costs_project ON project_costs(project_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_project_photos_project ON project_photos(project_id, date DESC);

-- Quotes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

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

-- Eliminar triggers existentes antes de crearlos
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;

-- Crear triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DESACTIVAR ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SINCRONIZAR USUARIO ADMIN CON AUTH.USERS
-- ============================================
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Obtener el ID del usuario admin desde auth.users
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'admin@cincel.com';
  
  IF auth_user_id IS NOT NULL THEN
    -- Insertar o actualizar el usuario en public.users
    INSERT INTO users (id, email, name, role)
    VALUES (auth_user_id, 'admin@cincel.com', 'Administrador', 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role;
    
    RAISE NOTICE '✅ Usuario admin sincronizado con ID: %', auth_user_id;
  ELSE
    RAISE NOTICE '⚠️  Usuario admin@cincel.com no existe en auth.users';
    RAISE NOTICE '    Créalo en: Authentication > Users > Add User';
  END IF;
END $$;

-- ============================================
-- CONFIGURACIÓN INICIAL (NO DATOS DEMO)
-- ============================================

-- Configuración general
INSERT INTO settings (key, value, description) 
VALUES 
  ('company_name', '"Cincel Construcciones"', 'Nombre de la empresa'),
  ('company_phone', '"+598 XX XXX XXX"', 'Teléfono de la empresa'),
  ('company_email', '"admin@cincel.com"', 'Email de la empresa'),
  ('tax_percentage', '22', 'Porcentaje de IVA'),
  ('currency', '"UYU"', 'Moneda por defecto'),
  ('lead_sources', '["web", "telefono", "referido", "redes_sociales", "email", "otro"]', 'Fuentes de leads'),
  ('pipeline_stages', '["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]', 'Etapas del pipeline')
ON CONFLICT (key) DO NOTHING;

-- Plantillas de mensajes básicas
INSERT INTO message_templates (name, content, category, active) 
VALUES 
  ('Bienvenida', '¡Hola! Gracias por contactar a Cincel Construcciones. ¿En qué podemos ayudarte?', 'general', true),
  ('Seguimiento', 'Hola, ¿cómo estás? Quería hacer un seguimiento sobre tu consulta. ¿Tienes alguna pregunta?', 'seguimiento', true),
  ('Cotización enviada', 'Te hemos enviado la cotización solicitada. Por favor revísala y no dudes en consultarnos cualquier duda.', 'ventas', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
  '✅ SCRIPT EJECUTADO CORRECTAMENTE' as resultado,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tablas,
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM settings) as configuraciones,
  (SELECT COUNT(*) FROM message_templates) as plantillas;

-- ============================================
-- PRÓXIMOS PASOS
-- ============================================
-- 1. ✅ Todas las tablas creadas
-- 2. ✅ Índices y triggers configurados
-- 3. ✅ RLS desactivado para desarrollo
-- 4. ✅ Configuración inicial insertada
-- 5. ⚠️  Si el usuario admin no se sincronizó:
--    - Ve a Authentication > Users
--    - Crea el usuario: admin@cincel.com / cincel2024
--    - Ejecuta nuevamente la sección "SINCRONIZAR USUARIO ADMIN"
-- 6. 🚀 Tu aplicación ya puede conectarse a Supabase
