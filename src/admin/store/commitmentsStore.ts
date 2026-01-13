/**
 * Commitments Store - Compromisos (Lo que nadie ve y te deja seco)
 * Solicitudes → Aprobación → Compromiso
 */

import { create } from 'zustand';

// ============================================
// TIPOS
// ============================================

export interface PurchaseRequest {
  id: string;
  code: string;
  project_id: string;
  project_name: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'completed' | 'cancelled';
  requested_date: string;
  required_date: string;
  total_estimated: number;
  budget_line_id: string | null;
  budget_line_code: string | null;
  requested_by: string;
  requested_by_name: string;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  items: PurchaseRequestItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestItem {
  id: string;
  purchase_request_id: string;
  description: string;
  quantity: number;
  unit: string;
  estimated_unit_price: number;
  estimated_total: number;
  specifications: string | null;
  preferred_supplier_id: string | null;
  preferred_supplier_name: string | null;
}

export interface Commitment {
  id: string;
  type: 'purchase_order' | 'subcontract' | 'payroll' | 'service' | 'other';
  source_id: string;               // ID de la OC, subcontrato, etc.
  source_code: string;
  project_id: string;
  project_name: string;
  supplier_id: string | null;
  supplier_name: string | null;
  description: string;
  
  // Montos
  total_amount: number;
  invoiced_amount: number;         // Facturado
  paid_amount: number;             // Pagado
  pending_amount: number;          // Sin facturar (el compromiso real)
  
  // Fechas
  commitment_date: string;
  expected_invoice_date: string | null;
  expected_payment_date: string | null;
  
  // Estado
  status: 'active' | 'partially_invoiced' | 'fully_invoiced' | 'cancelled';
  budget_line_id: string | null;
  budget_line_code: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface CommitmentsSummary {
  // Totales
  total_commitments: number;
  total_committed_amount: number;
  total_invoiced: number;
  total_pending_invoice: number;   // Compromisos sin factura = RIESGO
  
  // Por tipo
  by_type: {
    type: string;
    count: number;
    amount: number;
    pending: number;
  }[];
  
  // Por proyecto
  by_project: {
    project_id: string;
    project_name: string;
    committed: number;
    pending: number;
  }[];
  
  // Por vencimiento
  due_this_week: number;
  due_this_month: number;
  overdue: number;
  
  // Alertas
  high_value_commitments: number;  // > $100k sin facturar
  old_commitments: number;         // > 30 días sin facturar
}

export interface ApprovalWorkflow {
  id: string;
  request_id: string;
  request_type: 'purchase_request' | 'change_order' | 'payment';
  current_step: number;
  total_steps: number;
  status: 'pending' | 'approved' | 'rejected';
  approvers: ApprovalStep[];
  created_at: string;
}

export interface ApprovalStep {
  step: number;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  comments: string | null;
  amount_limit: number | null;
}

// ============================================
// STORE
// ============================================

interface CommitmentsState {
  // Data
  purchaseRequests: PurchaseRequest[];
  commitments: Commitment[];
  summary: CommitmentsSummary | null;
  approvalWorkflows: ApprovalWorkflow[];
  
  // Loading
  loading: boolean;
  
  // Actions
  fetchPurchaseRequests: (projectId?: string) => Promise<void>;
  fetchCommitments: (projectId?: string) => Promise<void>;
  createPurchaseRequest: (request: Omit<PurchaseRequest, 'id' | 'code' | 'created_at' | 'updated_at'>) => void;
  approvePurchaseRequest: (id: string, approverId: string, approverName: string) => void;
  rejectPurchaseRequest: (id: string, reason: string) => void;
  convertToCommitment: (purchaseRequestId: string, purchaseOrderId: string) => void;
  updateCommitmentInvoiced: (id: string, invoicedAmount: number) => void;
  
  // Computed
  getPendingApprovals: () => PurchaseRequest[];
  getCommitmentsByProject: (projectId: string) => Commitment[];
  getTotalPendingCommitments: () => number;
  getCommitmentsForCashFlow: (startDate: string, endDate: string) => Commitment[];
}

// Mock data
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: 'pr-1',
    code: 'SC-2026-0045',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    title: 'Materiales Instalación Eléctrica',
    description: 'Cables, tableros y accesorios para instalación eléctrica completa',
    priority: 'high',
    status: 'pending_approval',
    requested_date: '2026-01-12',
    required_date: '2026-01-20',
    total_estimated: 185000,
    budget_line_id: '6',
    budget_line_code: '03',
    requested_by: 'user-1',
    requested_by_name: 'Carlos Méndez',
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    rejection_reason: null,
    items: [
      {
        id: 'pri-1',
        purchase_request_id: 'pr-1',
        description: 'Cable NYA 2.5mm² (rollo 100m)',
        quantity: 15,
        unit: 'rollo',
        estimated_unit_price: 4500,
        estimated_total: 67500,
        specifications: 'Color variado según circuito',
        preferred_supplier_id: 'sup-elec-1',
        preferred_supplier_name: 'Electrocables SA',
      },
      {
        id: 'pri-2',
        purchase_request_id: 'pr-1',
        description: 'Tablero General 24 módulos',
        quantity: 1,
        unit: 'unidad',
        estimated_unit_price: 45000,
        estimated_total: 45000,
        specifications: 'Con riel DIN y borneras',
        preferred_supplier_id: 'sup-elec-1',
        preferred_supplier_name: 'Electrocables SA',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pr-2',
    code: 'SC-2026-0046',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    title: 'Alquiler Grúa Torre',
    description: 'Alquiler mensual grúa torre para estructura',
    priority: 'urgent',
    status: 'approved',
    requested_date: '2026-01-10',
    required_date: '2026-01-15',
    total_estimated: 320000,
    budget_line_id: '1',
    budget_line_code: '01',
    requested_by: 'user-2',
    requested_by_name: 'Roberto Silva',
    approved_by: 'user-admin',
    approved_by_name: 'Ing. Martínez',
    approved_at: '2026-01-11T10:30:00Z',
    rejection_reason: null,
    items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockCommitments: Commitment[] = [
  {
    id: 'com-1',
    type: 'purchase_order',
    source_id: 'oc-2026-0089',
    source_code: 'OC-2026-0089',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    supplier_id: 'sup-1',
    supplier_name: 'Cementos del Plata',
    description: 'Hormigón elaborado H30 - 180 m³',
    total_amount: 380000,
    invoiced_amount: 280000,
    paid_amount: 280000,
    pending_amount: 100000,
    commitment_date: '2026-01-05',
    expected_invoice_date: '2026-01-20',
    expected_payment_date: '2026-02-05',
    status: 'partially_invoiced',
    budget_line_id: '3',
    budget_line_code: '01.02',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'com-2',
    type: 'subcontract',
    source_id: 'sub-2026-0012',
    source_code: 'SUB-2026-0012',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    supplier_id: 'sup-2',
    supplier_name: 'Instalaciones Eléctricas Ramos',
    description: 'Instalación eléctrica completa',
    total_amount: 450000,
    invoiced_amount: 135000,
    paid_amount: 135000,
    pending_amount: 315000,
    commitment_date: '2025-12-15',
    expected_invoice_date: null,
    expected_payment_date: null,
    status: 'partially_invoiced',
    budget_line_id: '6',
    budget_line_code: '03',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'com-3',
    type: 'purchase_order',
    source_id: 'oc-2026-0102',
    source_code: 'OC-2026-0102',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    supplier_id: 'sup-3',
    supplier_name: 'Sanitarios Premium',
    description: 'Artefactos sanitarios completos',
    total_amount: 280000,
    invoiced_amount: 0,
    paid_amount: 0,
    pending_amount: 280000,
    commitment_date: '2026-01-08',
    expected_invoice_date: '2026-02-01',
    expected_payment_date: '2026-02-15',
    status: 'active',
    budget_line_id: '5',
    budget_line_code: '02',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'com-4',
    type: 'payroll',
    source_id: 'pay-2026-01',
    source_code: 'NOM-2026-01',
    project_id: '',
    project_name: 'General',
    supplier_id: null,
    supplier_name: null,
    description: 'Nómina Enero 2026',
    total_amount: 520000,
    invoiced_amount: 520000,
    paid_amount: 420000,
    pending_amount: 100000,
    commitment_date: '2026-01-01',
    expected_invoice_date: null,
    expected_payment_date: '2026-01-25',
    status: 'partially_invoiced',
    budget_line_id: null,
    budget_line_code: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockSummary: CommitmentsSummary = {
  total_commitments: 12,
  total_committed_amount: 2850000,
  total_invoiced: 1680000,
  total_pending_invoice: 1170000,
  
  by_type: [
    { type: 'purchase_order', count: 6, amount: 1450000, pending: 580000 },
    { type: 'subcontract', count: 3, amount: 850000, pending: 415000 },
    { type: 'payroll', count: 2, amount: 420000, pending: 100000 },
    { type: 'service', count: 1, amount: 130000, pending: 75000 },
  ],
  
  by_project: [
    { project_id: 'proj-1', project_name: 'Casa Carrasco Premium', committed: 1890000, pending: 795000 },
    { project_id: 'proj-2', project_name: 'Edificio Pocitos', committed: 640000, pending: 275000 },
    { project_id: '', project_name: 'General', committed: 320000, pending: 100000 },
  ],
  
  due_this_week: 385000,
  due_this_month: 1250000,
  overdue: 145000,
  
  high_value_commitments: 3,
  old_commitments: 2,
};

export const useCommitmentsStore = create<CommitmentsState>((set, get) => ({
  purchaseRequests: mockPurchaseRequests,
  commitments: mockCommitments,
  summary: mockSummary,
  approvalWorkflows: [],
  loading: false,
  
  fetchPurchaseRequests: async (_projectId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchCommitments: async (_projectId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  createPurchaseRequest: (request) => {
    const code = `SC-2026-${String(get().purchaseRequests.length + 47).padStart(4, '0')}`;
    const newRequest: PurchaseRequest = {
      ...request,
      id: crypto.randomUUID(),
      code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set(state => ({ purchaseRequests: [...state.purchaseRequests, newRequest] }));
  },
  
  approvePurchaseRequest: (id, approverId, approverName) => {
    set(state => ({
      purchaseRequests: state.purchaseRequests.map(pr =>
        pr.id === id ? {
          ...pr,
          status: 'approved' as const,
          approved_by: approverId,
          approved_by_name: approverName,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : pr
      )
    }));
  },
  
  rejectPurchaseRequest: (id, reason) => {
    set(state => ({
      purchaseRequests: state.purchaseRequests.map(pr =>
        pr.id === id ? {
          ...pr,
          status: 'rejected' as const,
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        } : pr
      )
    }));
  },
  
  convertToCommitment: (purchaseRequestId, purchaseOrderId) => {
    const pr = get().purchaseRequests.find(p => p.id === purchaseRequestId);
    if (!pr) return;
    
    const newCommitment: Commitment = {
      id: crypto.randomUUID(),
      type: 'purchase_order',
      source_id: purchaseOrderId,
      source_code: `OC-${purchaseOrderId.slice(-8)}`,
      project_id: pr.project_id,
      project_name: pr.project_name,
      supplier_id: null,
      supplier_name: null,
      description: pr.title,
      total_amount: pr.total_estimated,
      invoiced_amount: 0,
      paid_amount: 0,
      pending_amount: pr.total_estimated,
      commitment_date: new Date().toISOString().split('T')[0],
      expected_invoice_date: null,
      expected_payment_date: null,
      status: 'active',
      budget_line_id: pr.budget_line_id,
      budget_line_code: pr.budget_line_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set(state => ({
      commitments: [...state.commitments, newCommitment],
      purchaseRequests: state.purchaseRequests.map(p =>
        p.id === purchaseRequestId ? { ...p, status: 'ordered' as const } : p
      )
    }));
  },
  
  updateCommitmentInvoiced: (id, invoicedAmount) => {
    set(state => ({
      commitments: state.commitments.map(c =>
        c.id === id ? {
          ...c,
          invoiced_amount: invoicedAmount,
          pending_amount: c.total_amount - invoicedAmount,
          status: invoicedAmount >= c.total_amount ? 'fully_invoiced' as const : 'partially_invoiced' as const,
          updated_at: new Date().toISOString(),
        } : c
      )
    }));
  },
  
  getPendingApprovals: () => {
    return get().purchaseRequests.filter(pr => pr.status === 'pending_approval');
  },
  
  getCommitmentsByProject: (projectId) => {
    return get().commitments.filter(c => c.project_id === projectId);
  },
  
  getTotalPendingCommitments: () => {
    return get().commitments.reduce((sum, c) => sum + c.pending_amount, 0);
  },
  
  getCommitmentsForCashFlow: (startDate, endDate) => {
    return get().commitments.filter(c => {
      if (!c.expected_payment_date) return false;
      return c.expected_payment_date >= startDate && c.expected_payment_date <= endDate;
    });
  },
}));
