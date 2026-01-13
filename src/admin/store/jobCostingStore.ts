/**
 * Job Costing Store - El corazón del control financiero de obra
 * Presupuesto vivo, costos reales, comprometidos, proyecciones
 */

import { create } from 'zustand';

// ============================================
// TIPOS
// ============================================

export interface BudgetLineItem {
  id: string;
  project_id: string;
  parent_id: string | null;
  code: string;                    // 01, 01.01, 01.01.01
  description: string;
  unit: string | null;
  quantity: number;
  unit_price: number;
  budget_amount: number;           // Presupuesto base
  actual_spent: number;            // Real gastado (facturas pagadas)
  committed: number;               // Comprometido (OC aprobadas sin pagar)
  pending_invoices: number;        // Facturas pendientes de pago
  eac: number;                     // Estimate At Completion (proyectado final)
  variance_amount: number;         // Diferencia presupuesto vs EAC
  variance_percent: number;        // % de variación
  category: 'structure' | 'electrical' | 'plumbing' | 'hvac' | 'finishing' | 'exterior' | 'permits' | 'labor' | 'equipment' | 'overhead' | 'margin' | 'other';
  level: number;
  is_summary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCostSummary {
  project_id: string;
  project_name: string;
  
  // Presupuesto
  original_budget: number;
  approved_changes: number;
  current_budget: number;          // original + cambios aprobados
  
  // Ejecución
  actual_cost: number;             // Pagado
  committed_cost: number;          // OC aprobadas
  pending_invoices: number;        // Facturas por pagar
  total_exposure: number;          // actual + committed + pending
  
  // Proyección
  eac: number;                     // Estimate At Completion
  etc: number;                     // Estimate To Complete
  
  // Variación
  variance: number;
  variance_percent: number;
  
  // Performance
  cpi: number;                     // Cost Performance Index (EV/AC)
  spi: number;                     // Schedule Performance Index
  
  // Márgenes
  original_margin: number;
  original_margin_percent: number;
  current_margin: number;
  current_margin_percent: number;
  projected_margin: number;
  projected_margin_percent: number;
  
  // Estado
  health: 'excellent' | 'good' | 'warning' | 'critical';
  items_over_budget: number;
  items_at_risk: number;
}

export interface CostTransaction {
  id: string;
  project_id: string;
  budget_line_id: string | null;
  type: 'actual' | 'committed' | 'pending';
  category: string;
  description: string;
  amount: number;
  date: string;
  supplier_id: string | null;
  supplier_name: string | null;
  purchase_order_id: string | null;
  invoice_number: string | null;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  created_at: string;
}

export interface BudgetVersion {
  id: string;
  project_id: string;
  version_number: number;
  name: string;
  description: string;
  total_amount: number;
  margin_percent: number;
  status: 'draft' | 'approved' | 'superseded';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

// ============================================
// STORE
// ============================================

interface JobCostingState {
  // Data
  budgetLines: BudgetLineItem[];
  projectSummaries: ProjectCostSummary[];
  transactions: CostTransaction[];
  budgetVersions: BudgetVersion[];
  
  // Loading
  loading: boolean;
  
  // Actions
  fetchBudgetLines: (projectId: string) => Promise<void>;
  fetchProjectSummary: (projectId: string) => Promise<ProjectCostSummary>;
  fetchAllProjectSummaries: () => Promise<void>;
  addTransaction: (transaction: Omit<CostTransaction, 'id' | 'created_at'>) => void;
  updateBudgetLine: (id: string, updates: Partial<BudgetLineItem>) => void;
  createBudgetVersion: (version: Omit<BudgetVersion, 'id' | 'created_at'>) => void;
  
  // Computed
  getBudgetLinesByProject: (projectId: string) => BudgetLineItem[];
  getTransactionsByProject: (projectId: string) => CostTransaction[];
  getProjectHealth: (projectId: string) => 'excellent' | 'good' | 'warning' | 'critical';
}

// Mock data for demonstration
const mockBudgetLines: BudgetLineItem[] = [
  {
    id: '1',
    project_id: 'proj-1',
    parent_id: null,
    code: '01',
    description: 'OBRA GRUESA',
    unit: null,
    quantity: 1,
    unit_price: 0,
    budget_amount: 850000,
    actual_spent: 520000,
    committed: 180000,
    pending_invoices: 45000,
    eac: 890000,
    variance_amount: -40000,
    variance_percent: -4.7,
    category: 'structure',
    level: 0,
    is_summary: true,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    project_id: 'proj-1',
    parent_id: '1',
    code: '01.01',
    description: 'Excavaciones y movimiento de tierra',
    unit: 'm³',
    quantity: 450,
    unit_price: 120,
    budget_amount: 54000,
    actual_spent: 58500,
    committed: 0,
    pending_invoices: 0,
    eac: 58500,
    variance_amount: -4500,
    variance_percent: -8.3,
    category: 'structure',
    level: 1,
    is_summary: false,
    notes: 'Hubo más excavación por nivel freático',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    project_id: 'proj-1',
    parent_id: '1',
    code: '01.02',
    description: 'Hormigón armado',
    unit: 'm³',
    quantity: 320,
    unit_price: 1800,
    budget_amount: 576000,
    actual_spent: 380000,
    committed: 150000,
    pending_invoices: 35000,
    eac: 595000,
    variance_amount: -19000,
    variance_percent: -3.3,
    category: 'structure',
    level: 1,
    is_summary: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    project_id: 'proj-1',
    parent_id: '1',
    code: '01.03',
    description: 'Mampostería',
    unit: 'm²',
    quantity: 680,
    unit_price: 280,
    budget_amount: 190400,
    actual_spent: 65000,
    committed: 30000,
    pending_invoices: 10000,
    eac: 205000,
    variance_amount: -14600,
    variance_percent: -7.7,
    category: 'structure',
    level: 1,
    is_summary: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    project_id: 'proj-1',
    parent_id: null,
    code: '02',
    description: 'INSTALACIÓN SANITARIA',
    unit: null,
    quantity: 1,
    unit_price: 0,
    budget_amount: 180000,
    actual_spent: 45000,
    committed: 85000,
    pending_invoices: 12000,
    eac: 175000,
    variance_amount: 5000,
    variance_percent: 2.8,
    category: 'plumbing',
    level: 0,
    is_summary: true,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    project_id: 'proj-1',
    parent_id: null,
    code: '03',
    description: 'INSTALACIÓN ELÉCTRICA',
    unit: null,
    quantity: 1,
    unit_price: 0,
    budget_amount: 220000,
    actual_spent: 78000,
    committed: 95000,
    pending_invoices: 18000,
    eac: 235000,
    variance_amount: -15000,
    variance_percent: -6.8,
    category: 'electrical',
    level: 0,
    is_summary: true,
    notes: 'Aumento por tablero adicional',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    project_id: 'proj-1',
    parent_id: null,
    code: '04',
    description: 'TERMINACIONES',
    unit: null,
    quantity: 1,
    unit_price: 0,
    budget_amount: 450000,
    actual_spent: 120000,
    committed: 180000,
    pending_invoices: 25000,
    eac: 480000,
    variance_amount: -30000,
    variance_percent: -6.7,
    category: 'finishing',
    level: 0,
    is_summary: true,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockProjectSummary: ProjectCostSummary = {
  project_id: 'proj-1',
  project_name: 'Casa Carrasco Premium',
  
  original_budget: 1700000,
  approved_changes: 85000,
  current_budget: 1785000,
  
  actual_cost: 763000,
  committed_cost: 540000,
  pending_invoices: 100000,
  total_exposure: 1403000,
  
  eac: 1880000,
  etc: 477000,
  
  variance: -95000,
  variance_percent: -5.3,
  
  cpi: 0.95,
  spi: 0.88,
  
  original_margin: 340000,
  original_margin_percent: 20,
  current_margin: 245000,
  current_margin_percent: 13.7,
  projected_margin: 205000,
  projected_margin_percent: 10.9,
  
  health: 'warning',
  items_over_budget: 4,
  items_at_risk: 2,
};

export const useJobCostingStore = create<JobCostingState>((set, get) => ({
  budgetLines: mockBudgetLines,
  projectSummaries: [mockProjectSummary],
  transactions: [],
  budgetVersions: [],
  loading: false,
  
  fetchBudgetLines: async (_projectId: string) => {
    set({ loading: true });
    // Simular fetch
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchProjectSummary: async (projectId: string) => {
    const summary = get().projectSummaries.find(s => s.project_id === projectId);
    return summary || mockProjectSummary;
  },
  
  fetchAllProjectSummaries: async () => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  addTransaction: (transaction) => {
    const newTransaction: CostTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    set(state => ({ transactions: [...state.transactions, newTransaction] }));
  },
  
  updateBudgetLine: (id, updates) => {
    set(state => ({
      budgetLines: state.budgetLines.map(line =>
        line.id === id ? { ...line, ...updates, updated_at: new Date().toISOString() } : line
      )
    }));
  },
  
  createBudgetVersion: (version) => {
    const newVersion: BudgetVersion = {
      ...version,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    set(state => ({ budgetVersions: [...state.budgetVersions, newVersion] }));
  },
  
  getBudgetLinesByProject: (projectId) => {
    return get().budgetLines.filter(line => line.project_id === projectId);
  },
  
  getTransactionsByProject: (projectId) => {
    return get().transactions.filter(t => t.project_id === projectId);
  },
  
  getProjectHealth: (projectId) => {
    const summary = get().projectSummaries.find(s => s.project_id === projectId);
    return summary?.health || 'good';
  },
}));
