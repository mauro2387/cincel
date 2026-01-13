-- ============================================
-- CONSTRUCTION OPERATING SYSTEM (COS) - SCHEMA COMPLETO
-- ============================================
-- Sistema nervioso completo para constructoras
-- Versión: 2.0
-- Capas: 1-Core, 2-Comercial, 3-Plata, 4-Ejecución, 5-Control, 6-Inteligencia
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CAPA 1: CORE DEL SISTEMA
-- ============================================

-- TABLA: audit_logs (Auditoría completa de todas las acciones)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: permissions (Permisos granulares)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'create', 'edit', 'delete', 'approve', 'export')),
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: notifications (Notificaciones del sistema)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'task', 'approval', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAPA 2: COMERCIAL (Extender leads existentes)
-- ============================================

-- TABLA: lead_interactions (Historial de interacciones con leads)
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'whatsapp', 'visit', 'quote_sent', 'negotiation', 'other')),
  description TEXT NOT NULL,
  outcome TEXT,
  next_action TEXT,
  next_action_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: lost_reasons (Catálogo de motivos de pérdida)
CREATE TABLE IF NOT EXISTS lost_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT CHECK (category IN ('price', 'timing', 'competition', 'scope', 'trust', 'other')),
  active BOOLEAN DEFAULT true,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAPA 3: PLATA (El corazón del sistema)
-- ============================================

-- TABLA: budget_versions (Versiones de presupuesto - presupuesto vivo)
CREATE TABLE IF NOT EXISTS budget_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(14, 2) NOT NULL,
  margin_percentage DECIMAL(5, 2),
  status TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'superseded')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

-- TABLA: budget_items (Partidas del presupuesto)
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_version_id UUID REFERENCES budget_versions(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES budget_items(id),
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  unit TEXT,
  quantity DECIMAL(12, 4),
  unit_price DECIMAL(12, 2),
  total DECIMAL(14, 2) NOT NULL,
  category TEXT CHECK (category IN ('material', 'labor', 'equipment', 'subcontract', 'overhead', 'margin', 'other')),
  order_number INTEGER NOT NULL,
  level INTEGER DEFAULT 0,
  is_summary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: payments (Pagos y cobros)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN ('advance', 'milestone', 'partial', 'retention', 'final', 'extra', 'refund')),
  concept TEXT NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  currency TEXT DEFAULT 'UYU',
  exchange_rate DECIMAL(10, 4) DEFAULT 1,
  due_date DATE,
  paid_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  paid_amount DECIMAL(14, 2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'other')),
  reference TEXT,
  invoice_number TEXT,
  client_id UUID REFERENCES clients(id),
  supplier_id UUID,
  notes TEXT,
  attachments TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: cash_flow_projections (Proyecciones de flujo de caja)
CREATE TABLE IF NOT EXISTS cash_flow_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  projected_income DECIMAL(14, 2) DEFAULT 0,
  projected_expense DECIMAL(14, 2) DEFAULT 0,
  actual_income DECIMAL(14, 2) DEFAULT 0,
  actual_expense DECIMAL(14, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: financial_alerts (Alertas financieras)
CREATE TABLE IF NOT EXISTS financial_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  type TEXT NOT NULL CHECK (type IN ('budget_exceeded', 'margin_risk', 'overdue_payment', 'cash_flow_negative', 'cost_deviation', 'milestone_delay')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(14, 2),
  current_value DECIMAL(14, 2),
  deviation_percentage DECIMAL(5, 2),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAPA 4: EJECUCIÓN DE OBRA
-- ============================================

-- TABLA: suppliers (Proveedores)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  type TEXT CHECK (type IN ('material', 'labor', 'equipment', 'subcontractor', 'services', 'other')),
  category TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Uruguay',
  website TEXT,
  bank_name TEXT,
  bank_account TEXT,
  payment_terms INTEGER DEFAULT 30,
  credit_limit DECIMAL(14, 2),
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  total_purchases DECIMAL(14, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: purchase_requests (Solicitudes de compra)
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'completed', 'cancelled')),
  requested_date DATE NOT NULL,
  required_date DATE,
  total_estimated DECIMAL(14, 2),
  budget_item_id UUID REFERENCES budget_items(id),
  requested_by UUID REFERENCES users(id) NOT NULL,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: purchase_request_items (Items de solicitud de compra)
CREATE TABLE IF NOT EXISTS purchase_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL,
  unit TEXT NOT NULL,
  estimated_unit_price DECIMAL(12, 2),
  estimated_total DECIMAL(14, 2),
  specifications TEXT,
  preferred_supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: purchase_orders (Órdenes de compra)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  purchase_request_id UUID REFERENCES purchase_requests(id),
  project_id UUID REFERENCES projects(id) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'confirmed', 'partial_received', 'received', 'cancelled')),
  order_date DATE NOT NULL,
  expected_date DATE,
  received_date DATE,
  subtotal DECIMAL(14, 2) NOT NULL,
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(14, 2) DEFAULT 0,
  total DECIMAL(14, 2) NOT NULL,
  payment_terms INTEGER DEFAULT 30,
  delivery_address TEXT,
  notes TEXT,
  attachments TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: purchase_order_items (Items de orden de compra)
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
  purchase_request_item_id UUID REFERENCES purchase_request_items(id),
  description TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(14, 2) NOT NULL,
  received_quantity DECIMAL(12, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: goods_receipts (Recepciones de mercadería)
CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  receipt_date DATE NOT NULL,
  received_by UUID REFERENCES users(id) NOT NULL,
  delivery_note TEXT,
  status TEXT NOT NULL CHECK (status IN ('complete', 'partial', 'with_issues')),
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: goods_receipt_items (Items recibidos)
CREATE TABLE IF NOT EXISTS goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goods_receipt_id UUID REFERENCES goods_receipts(id) ON DELETE CASCADE NOT NULL,
  purchase_order_item_id UUID REFERENCES purchase_order_items(id) NOT NULL,
  quantity_received DECIMAL(12, 4) NOT NULL,
  quantity_rejected DECIMAL(12, 4) DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: crews (Cuadrillas de trabajo)
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('own', 'subcontractor')),
  supervisor TEXT,
  supervisor_phone TEXT,
  specialty TEXT,
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  supplier_id UUID REFERENCES suppliers(id),
  members_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: crew_members (Miembros de cuadrilla)
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID REFERENCES crews(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  document_id TEXT,
  role TEXT,
  specialty TEXT,
  hourly_rate DECIMAL(10, 2),
  phone TEXT,
  emergency_contact TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: work_logs (Registro de trabajo diario - Parte diario detallado)
CREATE TABLE IF NOT EXISTS work_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weather TEXT CHECK (weather IN ('sunny', 'cloudy', 'rainy', 'stormy', 'cold', 'hot')),
  temperature_min INTEGER,
  temperature_max INTEGER,
  work_started TIME,
  work_ended TIME,
  total_hours DECIMAL(4, 2),
  summary TEXT NOT NULL,
  progress_description TEXT,
  progress_percentage DECIMAL(5, 2),
  issues TEXT,
  decisions TEXT,
  visitors TEXT,
  safety_incidents TEXT,
  materials_used TEXT,
  equipment_used TEXT,
  next_day_plan TEXT,
  supervisor TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, date)
);

-- TABLA: work_log_crews (Cuadrillas del día)
CREATE TABLE IF NOT EXISTS work_log_crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_log_id UUID REFERENCES work_logs(id) ON DELETE CASCADE NOT NULL,
  crew_id UUID REFERENCES crews(id),
  crew_name TEXT NOT NULL,
  workers_count INTEGER NOT NULL,
  hours_worked DECIMAL(4, 2) NOT NULL,
  task_description TEXT NOT NULL,
  area_worked TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAPA 5: CONTROL TOTAL
-- ============================================

-- TABLA: change_orders (Órdenes de cambio - CRÍTICO)
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('client_request', 'design_change', 'site_condition', 'regulation', 'optimization', 'error_correction', 'other')),
  type TEXT NOT NULL CHECK (type IN ('addition', 'deduction', 'modification', 'time_extension')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_review', 'pending_client', 'approved', 'rejected', 'cancelled')),
  
  -- Impacto en costo
  original_budget DECIMAL(14, 2),
  cost_impact DECIMAL(14, 2) NOT NULL,
  new_budget DECIMAL(14, 2),
  
  -- Impacto en tiempo
  original_days INTEGER,
  time_impact_days INTEGER DEFAULT 0,
  new_deadline DATE,
  
  -- Aprobaciones
  requested_by UUID REFERENCES users(id) NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  client_approved BOOLEAN,
  client_approved_at TIMESTAMP WITH TIME ZONE,
  client_approved_by TEXT,
  final_approved_by UUID REFERENCES users(id),
  final_approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Documentación
  attachments TEXT[],
  client_signature_url TEXT,
  notes TEXT,
  
  -- Facturación
  invoiced BOOLEAN DEFAULT false,
  invoice_id UUID,
  invoiced_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: change_order_items (Items de orden de cambio)
CREATE TABLE IF NOT EXISTS change_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  change_order_id UUID REFERENCES change_orders(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(12, 4),
  unit TEXT,
  unit_price DECIMAL(12, 2),
  total DECIMAL(14, 2) NOT NULL,
  is_addition BOOLEAN DEFAULT true,
  budget_item_id UUID REFERENCES budget_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: documents (Documentos versionados)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('contract', 'permit', 'plan', 'specification', 'report', 'photo', 'invoice', 'receipt', 'correspondence', 'change_order', 'other')),
  name TEXT NOT NULL,
  description TEXT,
  current_version INTEGER DEFAULT 1,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  tags TEXT[],
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: document_versions (Versiones de documentos)
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  change_summary TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- TABLA: quality_checklists (Checklists de calidad)
CREATE TABLE IF NOT EXISTS quality_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'structure', 'electrical', 'plumbing', 'finishing', 'safety', 'final_inspection', 'other')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'approved')),
  due_date DATE,
  completed_date DATE,
  inspector TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5, 2),
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: checklist_items (Items de checklist)
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES quality_checklists(id) ON DELETE CASCADE NOT NULL,
  order_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'passed', 'failed', 'na')),
  notes TEXT,
  photo_url TEXT,
  checked_by TEXT,
  checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: incidents (Incidentes de seguridad y calidad)
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('safety', 'quality', 'environmental', 'delay', 'damage', 'theft', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  date_occurred TIMESTAMP WITH TIME ZONE NOT NULL,
  date_reported TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reported_by UUID REFERENCES users(id) NOT NULL,
  witnesses TEXT,
  immediate_actions TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  cost_impact DECIMAL(14, 2),
  time_impact_days INTEGER,
  status TEXT NOT NULL CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  photos TEXT[],
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CAPA 6: INTELIGENCIA
-- ============================================

-- TABLA: cost_analytics (Análisis de costos históricos)
CREATE TABLE IF NOT EXISTS cost_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  project_type TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  unit TEXT,
  unit_cost DECIMAL(12, 2) NOT NULL,
  total_quantity DECIMAL(14, 4),
  total_cost DECIMAL(14, 2),
  budget_vs_real_percentage DECIMAL(5, 2),
  region TEXT,
  year INTEGER,
  month INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: supplier_ratings (Historial de calificación de proveedores)
CREATE TABLE IF NOT EXISTS supplier_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  rating_quality DECIMAL(3, 2) CHECK (rating_quality >= 0 AND rating_quality <= 5),
  rating_delivery DECIMAL(3, 2) CHECK (rating_delivery >= 0 AND rating_delivery <= 5),
  rating_price DECIMAL(3, 2) CHECK (rating_price >= 0 AND rating_price <= 5),
  rating_service DECIMAL(3, 2) CHECK (rating_service >= 0 AND rating_service <= 5),
  overall_rating DECIMAL(3, 2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  comments TEXT,
  rated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: project_learnings (Aprendizajes por proyecto)
CREATE TABLE IF NOT EXISTS project_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'failure', 'improvement', 'risk', 'innovation')),
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  recommendation TEXT,
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: ai_predictions (Predicciones del sistema)
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('cost_overrun', 'delay_risk', 'margin_loss', 'cash_flow_issue', 'quality_risk')),
  confidence DECIMAL(5, 2),
  predicted_value DECIMAL(14, 2),
  actual_value DECIMAL(14, 2),
  prediction_date DATE NOT NULL,
  target_date DATE,
  factors JSONB,
  recommendation TEXT,
  accuracy_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES ADICIONALES
-- ============================================

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Lead interactions
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_type ON lead_interactions(type);

-- Budget
CREATE INDEX IF NOT EXISTS idx_budget_versions_project ON budget_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_version ON budget_items(budget_version_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_parent ON budget_items(parent_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);

-- Financial alerts
CREATE INDEX IF NOT EXISTS idx_financial_alerts_project ON financial_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_type ON financial_alerts(type);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_severity ON financial_alerts(severity);

-- Suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);

-- Purchase requests
CREATE INDEX IF NOT EXISTS idx_purchase_requests_project ON purchase_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);

-- Purchase orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_project ON purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- Crews
CREATE INDEX IF NOT EXISTS idx_crews_type ON crews(type);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);

-- Work logs
CREATE INDEX IF NOT EXISTS idx_work_logs_project ON work_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_date ON work_logs(date DESC);

-- Change orders
CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- Quality checklists
CREATE INDEX IF NOT EXISTS idx_quality_checklists_project ON quality_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_checklists_status ON quality_checklists(status);

-- Incidents
CREATE INDEX IF NOT EXISTS idx_incidents_project ON incidents(project_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);

-- Cost analytics
CREATE INDEX IF NOT EXISTS idx_cost_analytics_category ON cost_analytics(category);
CREATE INDEX IF NOT EXISTS idx_cost_analytics_project ON cost_analytics(project_id);

-- ============================================
-- TRIGGERS PARA NUEVAS TABLAS
-- ============================================

-- Payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Budget versions
DROP TRIGGER IF EXISTS update_budget_versions_updated_at ON budget_versions;
CREATE TRIGGER update_budget_versions_updated_at BEFORE UPDATE ON budget_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cash flow projections
DROP TRIGGER IF EXISTS update_cash_flow_projections_updated_at ON cash_flow_projections;
CREATE TRIGGER update_cash_flow_projections_updated_at BEFORE UPDATE ON cash_flow_projections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Suppliers
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Purchase requests
DROP TRIGGER IF EXISTS update_purchase_requests_updated_at ON purchase_requests;
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Purchase orders
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crews
DROP TRIGGER IF EXISTS update_crews_updated_at ON crews;
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Work logs
DROP TRIGGER IF EXISTS update_work_logs_updated_at ON work_logs;
CREATE TRIGGER update_work_logs_updated_at BEFORE UPDATE ON work_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Change orders
DROP TRIGGER IF EXISTS update_change_orders_updated_at ON change_orders;
CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON change_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Documents
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Quality checklists
DROP TRIGGER IF EXISTS update_quality_checklists_updated_at ON quality_checklists;
CREATE TRIGGER update_quality_checklists_updated_at BEFORE UPDATE ON quality_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Incidents
DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DESACTIVAR RLS EN NUEVAS TABLAS
-- ============================================

ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_projections DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE crews DISABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_crews DISABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_learnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCIÓN: Trigger de auditoría automática
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', old_data, current_setting('app.current_user_id', true)::UUID);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    -- Get changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(old_data) o
    FULL OUTER JOIN jsonb_each(new_data) n USING (key)
    WHERE o.value IS DISTINCT FROM n.value;
    
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', old_data, new_data, changed_fields, current_setting('app.current_user_id', true)::UUID);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', new_data, current_setting('app.current_user_id', true)::UUID);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers de auditoría para tablas críticas
DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_change_orders ON change_orders;
CREATE TRIGGER audit_change_orders AFTER INSERT OR UPDATE OR DELETE ON change_orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_purchase_orders ON purchase_orders;
CREATE TRIGGER audit_purchase_orders AFTER INSERT OR UPDATE OR DELETE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================
-- FUNCIÓN: Actualizar costos del proyecto automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_project_current_cost()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects 
  SET current_cost = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM project_costs 
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_cost_on_change ON project_costs;
CREATE TRIGGER update_project_cost_on_change 
AFTER INSERT OR UPDATE OR DELETE ON project_costs
    FOR EACH ROW EXECUTE FUNCTION update_project_current_cost();

-- ============================================
-- FUNCIÓN: Generar código automático
-- ============================================

CREATE OR REPLACE FUNCTION generate_code(prefix TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  result TEXT;
BEGIN
  EXECUTE format('SELECT COALESCE(MAX(SUBSTRING(code FROM ''%s-(\d+)$'')::INTEGER), 0) + 1 FROM %I WHERE code LIKE ''%s-%%''', 
    prefix, table_name, prefix) INTO next_num;
  result := prefix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES: Motivos de pérdida
-- ============================================

INSERT INTO lost_reasons (name, description, category) VALUES
  ('Precio muy alto', 'El cliente consideró que el precio era demasiado alto', 'price'),
  ('Encontró mejor precio', 'El cliente encontró una opción más económica', 'price'),
  ('Fuera de presupuesto', 'El proyecto excedía el presupuesto del cliente', 'price'),
  ('Timing inadecuado', 'El momento no era adecuado para el cliente', 'timing'),
  ('Proyecto postergado', 'El cliente decidió postergar el proyecto', 'timing'),
  ('Eligió competencia', 'El cliente eligió trabajar con otra empresa', 'competition'),
  ('Mejor propuesta técnica', 'Otra empresa presentó mejor solución técnica', 'competition'),
  ('Alcance no satisfactorio', 'El alcance propuesto no cumplía expectativas', 'scope'),
  ('Cambio de requerimientos', 'Los requerimientos cambiaron significativamente', 'scope'),
  ('Falta de confianza', 'El cliente no generó suficiente confianza', 'trust'),
  ('Malas referencias', 'El cliente recibió malas referencias', 'trust'),
  ('Otro motivo', 'Otro motivo no especificado', 'other')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 
  '✅ COS SCHEMA COMPLETO EJECUTADO' as resultado,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tablas;

-- Mostrar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
