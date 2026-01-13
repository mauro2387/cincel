-- ============================================
-- ERP CORE - MÓDULOS FINANCIEROS INDISPENSABLES
-- ============================================
-- Sprint 1: Cash Position Real + Compromisos
-- Responde: "¿Me quedo sin plata en 7/14/30 días?"
-- ============================================

-- ============================================
-- CAJA Y BANCOS (Cash Position Real)
-- ============================================

-- TABLA: cash_accounts (Cuentas de caja y bancos)
CREATE TABLE IF NOT EXISTS cash_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'digital_wallet', 'investment')),
  bank_name TEXT,
  account_number TEXT,
  currency TEXT DEFAULT 'UYU',
  initial_balance DECIMAL(14, 2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(14, 2) NOT NULL DEFAULT 0,
  available_balance DECIMAL(14, 2) NOT NULL DEFAULT 0,
  credit_limit DECIMAL(14, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: cash_transactions (Movimientos de caja reales)
CREATE TABLE IF NOT EXISTS cash_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES cash_accounts(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer_in', 'transfer_out')),
  category TEXT NOT NULL CHECK (category IN (
    'client_payment', 'advance_received', 'retention_release',
    'supplier_payment', 'payroll', 'tax', 'overhead', 'petty_cash',
    'bank_fee', 'interest', 'transfer', 'adjustment', 'other'
  )),
  amount DECIMAL(14, 2) NOT NULL,
  balance_after DECIMAL(14, 2) NOT NULL,
  reference TEXT,
  description TEXT NOT NULL,
  
  -- Vinculación a origen
  project_id UUID REFERENCES projects(id),
  receivable_id UUID,
  payable_id UUID,
  transfer_account_id UUID REFERENCES cash_accounts(id),
  
  -- Conciliación
  bank_reference TEXT,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID REFERENCES users(id),
  
  transaction_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONTRATOS Y HITOS DE COBRO
-- ============================================

-- TABLA: contracts (Contratos por obra)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  -- Montos
  contract_amount DECIMAL(14, 2) NOT NULL,
  adjusted_amount DECIMAL(14, 2) NOT NULL, -- después de change orders
  currency TEXT DEFAULT 'UYU',
  
  -- Retención
  retention_percentage DECIMAL(5, 2) DEFAULT 5,
  retention_amount DECIMAL(14, 2) DEFAULT 0,
  retention_release_date DATE,
  retention_released BOOLEAN DEFAULT false,
  
  -- Fechas
  signed_date DATE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_end_date DATE,
  
  -- Estado
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'suspended', 'cancelled')),
  
  -- Documentación
  contract_url TEXT,
  attachments TEXT[],
  notes TEXT,
  
  -- Totales calculados
  total_invoiced DECIMAL(14, 2) DEFAULT 0,
  total_received DECIMAL(14, 2) DEFAULT 0,
  total_pending DECIMAL(14, 2) DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: contract_milestones (Hitos de cobro)
CREATE TABLE IF NOT EXISTS contract_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  
  order_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Montos
  amount DECIMAL(14, 2) NOT NULL,
  percentage DECIMAL(5, 2), -- % del contrato
  retention_amount DECIMAL(14, 2) DEFAULT 0, -- retención de este hito
  net_amount DECIMAL(14, 2) NOT NULL, -- amount - retention
  
  -- Condición de pago
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'advance', 'phase_completion', 'percentage_progress', 
    'inspection_approval', 'delivery', 'final', 'retention_release'
  )),
  trigger_value TEXT, -- ej: "50%" o "Estructura completa"
  
  -- Fechas
  expected_date DATE,
  completed_date DATE,
  invoiced_date DATE,
  paid_date DATE,
  
  -- Estado
  status TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'invoiced', 'partial_paid', 'paid')),
  
  -- Facturación
  invoice_number TEXT,
  invoice_url TEXT,
  
  -- Pago
  paid_amount DECIMAL(14, 2) DEFAULT 0,
  payment_reference TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(contract_id, order_number)
);

-- ============================================
-- CUENTAS POR COBRAR Y PAGAR
-- ============================================

-- TABLA: receivables (Cuentas por cobrar)
CREATE TABLE IF NOT EXISTS receivables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  
  -- Origen
  type TEXT NOT NULL CHECK (type IN ('milestone', 'change_order', 'extra', 'retention', 'other')),
  project_id UUID REFERENCES projects(id) NOT NULL,
  contract_id UUID REFERENCES contracts(id),
  milestone_id UUID REFERENCES contract_milestones(id),
  change_order_id UUID REFERENCES change_orders(id),
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  -- Montos
  amount DECIMAL(14, 2) NOT NULL,
  tax_amount DECIMAL(14, 2) DEFAULT 0,
  total_amount DECIMAL(14, 2) NOT NULL,
  paid_amount DECIMAL(14, 2) DEFAULT 0,
  pending_amount DECIMAL(14, 2) NOT NULL,
  
  -- Facturación
  invoice_number TEXT,
  invoice_date DATE,
  invoice_url TEXT,
  
  -- Fechas
  due_date DATE NOT NULL,
  expected_payment_date DATE,
  
  -- Estado
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled', 'written_off')),
  days_overdue INTEGER DEFAULT 0,
  
  description TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: payables (Cuentas por pagar)
CREATE TABLE IF NOT EXISTS payables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  
  -- Origen
  type TEXT NOT NULL CHECK (type IN ('purchase_order', 'subcontract', 'payroll', 'tax', 'overhead', 'retention', 'other')),
  project_id UUID REFERENCES projects(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  supplier_id UUID REFERENCES suppliers(id),
  
  -- Montos
  amount DECIMAL(14, 2) NOT NULL,
  tax_amount DECIMAL(14, 2) DEFAULT 0,
  total_amount DECIMAL(14, 2) NOT NULL,
  paid_amount DECIMAL(14, 2) DEFAULT 0,
  pending_amount DECIMAL(14, 2) NOT NULL,
  
  -- Factura proveedor
  supplier_invoice_number TEXT,
  supplier_invoice_date DATE,
  supplier_invoice_url TEXT,
  
  -- Fechas
  due_date DATE NOT NULL,
  expected_payment_date DATE,
  
  -- Estado
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled', 'disputed')),
  days_overdue INTEGER DEFAULT 0,
  
  -- Aprobación de pago
  approved_for_payment BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  description TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: payment_allocations (Asignación de pagos parciales)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Puede ser cobro o pago
  transaction_id UUID REFERENCES cash_transactions(id) NOT NULL,
  receivable_id UUID REFERENCES receivables(id),
  payable_id UUID REFERENCES payables(id),
  
  amount DECIMAL(14, 2) NOT NULL,
  allocation_date DATE NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (
    (receivable_id IS NOT NULL AND payable_id IS NULL) OR
    (receivable_id IS NULL AND payable_id IS NOT NULL)
  )
);

-- ============================================
-- RETENCIONES
-- ============================================

-- TABLA: retentions (Control de retenciones)
CREATE TABLE IF NOT EXISTS retentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Origen
  type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
  project_id UUID REFERENCES projects(id) NOT NULL,
  contract_id UUID REFERENCES contracts(id),
  receivable_id UUID REFERENCES receivables(id),
  payable_id UUID REFERENCES payables(id),
  
  -- Montos
  original_amount DECIMAL(14, 2) NOT NULL,
  retention_percentage DECIMAL(5, 2) NOT NULL,
  retention_amount DECIMAL(14, 2) NOT NULL,
  released_amount DECIMAL(14, 2) DEFAULT 0,
  pending_amount DECIMAL(14, 2) NOT NULL,
  
  -- Fechas
  retention_date DATE NOT NULL,
  expected_release_date DATE,
  actual_release_date DATE,
  
  -- Estado
  status TEXT NOT NULL CHECK (status IN ('retained', 'partial_released', 'released', 'forfeited')),
  
  -- Liberación
  release_conditions TEXT,
  released_by UUID REFERENCES users(id),
  release_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VISTAS CALCULADAS PARA DASHBOARD
-- ============================================

-- VISTA: cash_position_summary (Posición de caja actual)
CREATE OR REPLACE VIEW cash_position_summary AS
SELECT 
  a.id as account_id,
  a.code,
  a.name,
  a.type,
  a.currency,
  a.current_balance,
  a.available_balance,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income_mtd,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense_mtd
FROM cash_accounts a
LEFT JOIN cash_transactions t ON t.account_id = a.id 
  AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
WHERE a.active = true
GROUP BY a.id, a.code, a.name, a.type, a.currency, a.current_balance, a.available_balance;

-- VISTA: receivables_aging (Antigüedad de cuentas por cobrar)
CREATE OR REPLACE VIEW receivables_aging AS
SELECT
  project_id,
  client_id,
  SUM(CASE WHEN days_overdue <= 0 THEN pending_amount ELSE 0 END) as current,
  SUM(CASE WHEN days_overdue BETWEEN 1 AND 30 THEN pending_amount ELSE 0 END) as overdue_1_30,
  SUM(CASE WHEN days_overdue BETWEEN 31 AND 60 THEN pending_amount ELSE 0 END) as overdue_31_60,
  SUM(CASE WHEN days_overdue BETWEEN 61 AND 90 THEN pending_amount ELSE 0 END) as overdue_61_90,
  SUM(CASE WHEN days_overdue > 90 THEN pending_amount ELSE 0 END) as overdue_90_plus,
  SUM(pending_amount) as total_pending
FROM receivables
WHERE status NOT IN ('paid', 'cancelled', 'written_off')
GROUP BY project_id, client_id;

-- VISTA: payables_aging (Antigüedad de cuentas por pagar)
CREATE OR REPLACE VIEW payables_aging AS
SELECT
  project_id,
  supplier_id,
  SUM(CASE WHEN days_overdue <= 0 THEN pending_amount ELSE 0 END) as current,
  SUM(CASE WHEN days_overdue BETWEEN 1 AND 30 THEN pending_amount ELSE 0 END) as overdue_1_30,
  SUM(CASE WHEN days_overdue BETWEEN 31 AND 60 THEN pending_amount ELSE 0 END) as overdue_31_60,
  SUM(CASE WHEN days_overdue BETWEEN 61 AND 90 THEN pending_amount ELSE 0 END) as overdue_61_90,
  SUM(CASE WHEN days_overdue > 90 THEN pending_amount ELSE 0 END) as overdue_90_plus,
  SUM(pending_amount) as total_pending
FROM payables
WHERE status NOT IN ('paid', 'cancelled')
GROUP BY project_id, supplier_id;

-- VISTA: cash_flow_projection (Proyección de flujo de caja)
CREATE OR REPLACE VIEW cash_flow_projection AS
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    INTERVAL '1 day'
  )::DATE as projection_date
),
expected_income AS (
  SELECT 
    COALESCE(expected_payment_date, due_date) as date,
    SUM(pending_amount) as amount
  FROM receivables
  WHERE status IN ('pending', 'partial', 'overdue')
  GROUP BY COALESCE(expected_payment_date, due_date)
),
expected_expense AS (
  SELECT 
    COALESCE(expected_payment_date, due_date) as date,
    SUM(pending_amount) as amount
  FROM payables
  WHERE status IN ('pending', 'partial', 'overdue')
    AND approved_for_payment = true
  GROUP BY COALESCE(expected_payment_date, due_date)
),
committed_expense AS (
  SELECT 
    expected_date as date,
    SUM(total) as amount
  FROM purchase_orders
  WHERE status IN ('sent', 'confirmed', 'partial_received')
  GROUP BY expected_date
)
SELECT 
  ds.projection_date,
  COALESCE(ei.amount, 0) as expected_income,
  COALESCE(ee.amount, 0) as expected_expense,
  COALESCE(ce.amount, 0) as committed_expense,
  COALESCE(ei.amount, 0) - COALESCE(ee.amount, 0) - COALESCE(ce.amount, 0) as net_flow
FROM date_series ds
LEFT JOIN expected_income ei ON ei.date = ds.projection_date
LEFT JOIN expected_expense ee ON ee.date = ds.projection_date
LEFT JOIN committed_expense ce ON ce.date = ds.projection_date
ORDER BY ds.projection_date;

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cash_accounts_type ON cash_accounts(type);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_account ON cash_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_project ON cash_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_category ON cash_transactions(category);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE INDEX IF NOT EXISTS idx_contract_milestones_contract ON contract_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_milestones_status ON contract_milestones(status);

CREATE INDEX IF NOT EXISTS idx_receivables_project ON receivables(project_id);
CREATE INDEX IF NOT EXISTS idx_receivables_client ON receivables(client_id);
CREATE INDEX IF NOT EXISTS idx_receivables_status ON receivables(status);
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables(due_date);

CREATE INDEX IF NOT EXISTS idx_payables_project ON payables(project_id);
CREATE INDEX IF NOT EXISTS idx_payables_supplier ON payables(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payables_status ON payables(status);
CREATE INDEX IF NOT EXISTS idx_payables_due_date ON payables(due_date);

CREATE INDEX IF NOT EXISTS idx_retentions_project ON retentions(project_id);
CREATE INDEX IF NOT EXISTS idx_retentions_status ON retentions(status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar saldo de cuenta después de transacción
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cash_accounts
    SET current_balance = current_balance + 
      CASE WHEN NEW.type IN ('income', 'transfer_in') THEN NEW.amount ELSE -NEW.amount END,
        available_balance = available_balance + 
      CASE WHEN NEW.type IN ('income', 'transfer_in') THEN NEW.amount ELSE -NEW.amount END,
        updated_at = NOW()
    WHERE id = NEW.account_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cash_accounts
    SET current_balance = current_balance - 
      CASE WHEN OLD.type IN ('income', 'transfer_in') THEN OLD.amount ELSE -OLD.amount END,
        available_balance = available_balance - 
      CASE WHEN OLD.type IN ('income', 'transfer_in') THEN OLD.amount ELSE -OLD.amount END,
        updated_at = NOW()
    WHERE id = OLD.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_balance_on_transaction ON cash_transactions;
CREATE TRIGGER update_balance_on_transaction
AFTER INSERT OR DELETE ON cash_transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Trigger: Actualizar días de mora
CREATE OR REPLACE FUNCTION update_days_overdue()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_overdue := GREATEST(0, CURRENT_DATE - NEW.due_date);
  IF NEW.days_overdue > 0 AND NEW.status = 'pending' THEN
    NEW.status := 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_receivable_overdue ON receivables;
CREATE TRIGGER update_receivable_overdue
BEFORE INSERT OR UPDATE ON receivables
FOR EACH ROW EXECUTE FUNCTION update_days_overdue();

DROP TRIGGER IF EXISTS update_payable_overdue ON payables;
CREATE TRIGGER update_payable_overdue
BEFORE INSERT OR UPDATE ON payables
FOR EACH ROW EXECUTE FUNCTION update_days_overdue();

-- Trigger: Actualizar totales de contrato
CREATE OR REPLACE FUNCTION update_contract_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contracts c
  SET 
    total_invoiced = COALESCE((
      SELECT SUM(amount) FROM receivables r 
      WHERE r.contract_id = c.id AND r.invoice_number IS NOT NULL
    ), 0),
    total_received = COALESCE((
      SELECT SUM(paid_amount) FROM receivables r 
      WHERE r.contract_id = c.id
    ), 0),
    total_pending = c.adjusted_amount - COALESCE((
      SELECT SUM(paid_amount) FROM receivables r 
      WHERE r.contract_id = c.id
    ), 0),
    updated_at = NOW()
  WHERE c.id = COALESCE(NEW.contract_id, OLD.contract_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contract_on_receivable ON receivables;
CREATE TRIGGER update_contract_on_receivable
AFTER INSERT OR UPDATE OR DELETE ON receivables
FOR EACH ROW EXECUTE FUNCTION update_contract_totals();

-- ============================================
-- DESACTIVAR RLS
-- ============================================

ALTER TABLE cash_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE receivables DISABLE ROW LEVEL SECURITY;
ALTER TABLE payables DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations DISABLE ROW LEVEL SECURITY;
ALTER TABLE retentions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Cuentas de caja/banco por defecto
INSERT INTO cash_accounts (code, name, type, initial_balance, current_balance, available_balance, is_default) VALUES
  ('CAJA-001', 'Caja Principal', 'cash', 50000, 50000, 50000, true),
  ('BROU-001', 'BROU Cuenta Corriente', 'bank', 250000, 250000, 250000, false),
  ('ITAU-001', 'Itaú Cuenta Empresa', 'bank', 180000, 180000, 180000, false)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
  '✅ ERP CORE SCHEMA EJECUTADO' as resultado,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND table_name IN (
    'cash_accounts', 'cash_transactions', 'contracts', 'contract_milestones',
    'receivables', 'payables', 'payment_allocations', 'retentions'
  )) as tablas_erp_core;
