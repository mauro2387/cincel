/**
 * Billing Store - Facturación por Hitos + Retenciones
 * El modelo real de construcción: anticipos, avances, retenciones
 */

import { create } from 'zustand';

// ============================================
// TIPOS
// ============================================

export interface Contract {
  id: string;
  project_id: string;
  project_name: string;
  client_id: string;
  client_name: string;
  contract_number: string;
  contract_date: string;
  
  // Montos
  original_amount: number;
  change_orders_amount: number;
  current_amount: number;
  
  // Retención
  retention_percentage: number;
  retention_amount: number;
  retention_released: number;
  retention_pending: number;
  retention_release_date: string | null;
  
  // Facturación
  total_invoiced: number;
  total_collected: number;
  pending_invoice: number;
  pending_collection: number;
  
  // Estado
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  completion_percentage: number;
  
  milestones: ContractMilestone[];
  created_at: string;
  updated_at: string;
}

export interface ContractMilestone {
  id: string;
  contract_id: string;
  order: number;
  name: string;
  description: string;
  
  // Porcentaje y monto
  percentage: number;
  amount: number;
  
  // Condiciones
  trigger_type: 'date' | 'completion' | 'approval' | 'delivery';
  trigger_date: string | null;
  trigger_completion_percent: number | null;
  trigger_description: string | null;
  
  // Estado
  status: 'pending' | 'eligible' | 'invoiced' | 'collected' | 'partial';
  eligible_date: string | null;
  
  // Facturación
  invoice_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_amount: number;
  
  // Cobro
  collected_amount: number;
  collected_date: string | null;
  
  // Retención aplicada
  retention_withheld: number;
  
  notes: string | null;
  created_at: string;
}

export interface SubcontractPayment {
  id: string;
  subcontract_id: string;
  supplier_id: string;
  supplier_name: string;
  project_id: string;
  project_name: string;
  
  // Monto original y actual
  original_amount: number;
  change_orders_amount: number;
  current_amount: number;
  
  // Retención
  retention_percentage: number;
  retention_amount: number;
  retention_released: number;
  
  // Pagos
  total_paid: number;
  pending_payment: number;
  
  // Hitos de pago
  payment_schedule: SubcontractMilestone[];
  
  status: 'active' | 'completed' | 'suspended';
  created_at: string;
}

export interface SubcontractMilestone {
  id: string;
  subcontract_id: string;
  order: number;
  name: string;
  percentage: number;
  amount: number;
  
  // Aprobación
  status: 'pending' | 'submitted' | 'approved' | 'paid' | 'rejected';
  submitted_date: string | null;
  approved_date: string | null;
  approved_by: string | null;
  
  // Pago
  payment_date: string | null;
  payment_amount: number;
  retention_withheld: number;
  
  notes: string | null;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  type: 'client' | 'supplier';
  
  // Relacionado
  project_id: string;
  project_name: string;
  client_id: string | null;
  supplier_id: string | null;
  entity_name: string;
  
  // Montos
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  retention_amount: number;
  total: number;
  
  // Estado
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  
  // Fechas
  invoice_date: string;
  due_date: string;
  paid_date: string | null;
  
  // Pagos
  paid_amount: number;
  pending_amount: number;
  payments: InvoicePayment[];
  
  // Origen
  milestone_id: string | null;
  milestone_name: string | null;
  
  notes: string | null;
  created_at: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  date: string;
  amount: number;
  payment_method: 'transfer' | 'check' | 'cash' | 'card';
  reference: string | null;
  notes: string | null;
}

export interface RetentionSummary {
  // Retenciones de clientes (a nuestro favor cuando se liberen)
  client_retention_total: number;
  client_retention_released: number;
  client_retention_pending: number;
  client_retention_by_project: {
    project_id: string;
    project_name: string;
    amount: number;
    release_date: string | null;
  }[];
  
  // Retenciones a subcontratistas (que debemos liberar)
  subcontract_retention_total: number;
  subcontract_retention_released: number;
  subcontract_retention_pending: number;
  subcontract_retention_by_supplier: {
    supplier_id: string;
    supplier_name: string;
    amount: number;
    release_date: string | null;
  }[];
  
  // Próximas liberaciones
  upcoming_releases: {
    type: 'client' | 'subcontract';
    entity_name: string;
    project_name: string;
    amount: number;
    release_date: string;
    days_until: number;
  }[];
}

// ============================================
// STORE
// ============================================

interface BillingState {
  // Data
  contracts: Contract[];
  subcontractPayments: SubcontractPayment[];
  invoices: Invoice[];
  retentionSummary: RetentionSummary | null;
  
  // Loading
  loading: boolean;
  
  // Actions
  fetchContracts: (projectId?: string) => Promise<void>;
  fetchSubcontractPayments: (projectId?: string) => Promise<void>;
  fetchInvoices: (type?: 'client' | 'supplier') => Promise<void>;
  
  createInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => void;
  registerPayment: (invoiceId: string, payment: Omit<InvoicePayment, 'id'>) => void;
  approveMilestone: (contractId: string, milestoneId: string) => void;
  releaseRetention: (contractId: string, amount: number) => void;
  
  // Computed
  getContractByProject: (projectId: string) => Contract | undefined;
  getPendingMilestones: () => ContractMilestone[];
  getOverdueInvoices: () => Invoice[];
  getTotalPendingRetention: () => number;
}

// Mock data
const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    client_id: 'cli-1',
    client_name: 'Familia Rodríguez',
    contract_number: 'CONT-2025-0034',
    contract_date: '2025-10-15',
    
    original_amount: 2800000,
    change_orders_amount: 185000,
    current_amount: 2985000,
    
    retention_percentage: 5,
    retention_amount: 149250,
    retention_released: 0,
    retention_pending: 149250,
    retention_release_date: '2026-06-15',
    
    total_invoiced: 1490000,
    total_collected: 1340000,
    pending_invoice: 1495000,
    pending_collection: 150000,
    
    status: 'active',
    completion_percentage: 52,
    
    milestones: [
      {
        id: 'ms-1',
        contract_id: 'contract-1',
        order: 1,
        name: 'Anticipo',
        description: 'Anticipo inicial al firmar contrato',
        percentage: 20,
        amount: 597000,
        trigger_type: 'date',
        trigger_date: '2025-10-20',
        trigger_completion_percent: null,
        trigger_description: null,
        status: 'collected',
        eligible_date: '2025-10-15',
        invoice_id: 'inv-1',
        invoice_number: 'FAC-2025-0089',
        invoice_date: '2025-10-18',
        invoice_amount: 567150,
        collected_amount: 567150,
        collected_date: '2025-10-25',
        retention_withheld: 29850,
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'ms-2',
        contract_id: 'contract-1',
        order: 2,
        name: 'Estructura Completa',
        description: 'Al completar 100% de estructura',
        percentage: 30,
        amount: 895500,
        trigger_type: 'completion',
        trigger_date: null,
        trigger_completion_percent: 35,
        trigger_description: 'Estructura hormigón terminada',
        status: 'collected',
        eligible_date: '2025-12-20',
        invoice_id: 'inv-2',
        invoice_number: 'FAC-2025-0142',
        invoice_date: '2025-12-22',
        invoice_amount: 850725,
        collected_amount: 772850,
        collected_date: '2026-01-08',
        retention_withheld: 44775,
        notes: 'Pendiente $77,875 de última cuota',
        created_at: new Date().toISOString(),
      },
      {
        id: 'ms-3',
        contract_id: 'contract-1',
        order: 3,
        name: 'Instalaciones Completas',
        description: 'Sanitaria, eléctrica, gas',
        percentage: 25,
        amount: 746250,
        trigger_type: 'completion',
        trigger_date: null,
        trigger_completion_percent: 65,
        trigger_description: 'Instalaciones finalizadas y probadas',
        status: 'pending',
        eligible_date: null,
        invoice_id: null,
        invoice_number: null,
        invoice_date: null,
        invoice_amount: 0,
        collected_amount: 0,
        collected_date: null,
        retention_withheld: 0,
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'ms-4',
        contract_id: 'contract-1',
        order: 4,
        name: 'Terminaciones',
        description: 'Pisos, revestimientos, pintura',
        percentage: 20,
        amount: 597000,
        trigger_type: 'completion',
        trigger_date: null,
        trigger_completion_percent: 90,
        trigger_description: 'Terminaciones completas',
        status: 'pending',
        eligible_date: null,
        invoice_id: null,
        invoice_number: null,
        invoice_date: null,
        invoice_amount: 0,
        collected_amount: 0,
        collected_date: null,
        retention_withheld: 0,
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'ms-5',
        contract_id: 'contract-1',
        order: 5,
        name: 'Entrega Final',
        description: 'Entrega y recepción definitiva',
        percentage: 5,
        amount: 149250,
        trigger_type: 'delivery',
        trigger_date: null,
        trigger_completion_percent: 100,
        trigger_description: 'Acta de recepción firmada',
        status: 'pending',
        eligible_date: null,
        invoice_id: null,
        invoice_number: null,
        invoice_date: null,
        invoice_amount: 0,
        collected_amount: 0,
        collected_date: null,
        retention_withheld: 0,
        notes: 'Incluye liberación de retención',
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockSubcontractPayments: SubcontractPayment[] = [
  {
    id: 'subpay-1',
    subcontract_id: 'sub-2026-0012',
    supplier_id: 'sup-2',
    supplier_name: 'Instalaciones Eléctricas Ramos',
    project_id: 'proj-1',
    project_name: 'Casa Carrasco Premium',
    
    original_amount: 420000,
    change_orders_amount: 30000,
    current_amount: 450000,
    
    retention_percentage: 10,
    retention_amount: 45000,
    retention_released: 0,
    
    total_paid: 135000,
    pending_payment: 270000,  // 315000 - 45000 retención
    
    payment_schedule: [
      {
        id: 'subms-1',
        subcontract_id: 'sub-2026-0012',
        order: 1,
        name: 'Anticipo',
        percentage: 30,
        amount: 135000,
        status: 'paid',
        submitted_date: '2025-12-10',
        approved_date: '2025-12-12',
        approved_by: 'Ing. Martínez',
        payment_date: '2025-12-18',
        payment_amount: 121500,
        retention_withheld: 13500,
        notes: null,
      },
      {
        id: 'subms-2',
        subcontract_id: 'sub-2026-0012',
        order: 2,
        name: 'Avance 50%',
        percentage: 35,
        amount: 157500,
        status: 'submitted',
        submitted_date: '2026-01-10',
        approved_date: null,
        approved_by: null,
        payment_date: null,
        payment_amount: 0,
        retention_withheld: 0,
        notes: 'Pendiente aprobación',
      },
      {
        id: 'subms-3',
        subcontract_id: 'sub-2026-0012',
        order: 3,
        name: 'Avance Final',
        percentage: 35,
        amount: 157500,
        status: 'pending',
        submitted_date: null,
        approved_date: null,
        approved_by: null,
        payment_date: null,
        payment_amount: 0,
        retention_withheld: 0,
        notes: null,
      },
    ],
    
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

const mockRetentionSummary: RetentionSummary = {
  client_retention_total: 298500,
  client_retention_released: 0,
  client_retention_pending: 298500,
  client_retention_by_project: [
    { project_id: 'proj-1', project_name: 'Casa Carrasco Premium', amount: 149250, release_date: '2026-06-15' },
    { project_id: 'proj-2', project_name: 'Edificio Pocitos', amount: 149250, release_date: '2026-08-01' },
  ],
  
  subcontract_retention_total: 89000,
  subcontract_retention_released: 12000,
  subcontract_retention_pending: 77000,
  subcontract_retention_by_supplier: [
    { supplier_id: 'sup-2', supplier_name: 'Instalaciones Eléctricas Ramos', amount: 45000, release_date: '2026-05-01' },
    { supplier_id: 'sup-3', supplier_name: 'Sanitarios Premium', amount: 32000, release_date: '2026-04-15' },
  ],
  
  upcoming_releases: [
    { type: 'subcontract', entity_name: 'Sanitarios Premium', project_name: 'Casa Carrasco', amount: 32000, release_date: '2026-04-15', days_until: 92 },
    { type: 'subcontract', entity_name: 'Inst. Eléctricas Ramos', project_name: 'Casa Carrasco', amount: 45000, release_date: '2026-05-01', days_until: 108 },
    { type: 'client', entity_name: 'Familia Rodríguez', project_name: 'Casa Carrasco Premium', amount: 149250, release_date: '2026-06-15', days_until: 153 },
  ],
};

export const useBillingStore = create<BillingState>((set, get) => ({
  contracts: mockContracts,
  subcontractPayments: mockSubcontractPayments,
  invoices: [],
  retentionSummary: mockRetentionSummary,
  loading: false,
  
  fetchContracts: async (projectId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchSubcontractPayments: async (projectId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  fetchInvoices: async (type?: 'client' | 'supplier') => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  createInvoice: (invoice) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    set(state => ({ invoices: [...state.invoices, newInvoice] }));
  },
  
  registerPayment: (invoiceId, payment) => {
    const newPayment: InvoicePayment = {
      ...payment,
      id: crypto.randomUUID(),
    };
    set(state => ({
      invoices: state.invoices.map(inv => {
        if (inv.id !== invoiceId) return inv;
        const newPaidAmount = inv.paid_amount + payment.amount;
        return {
          ...inv,
          paid_amount: newPaidAmount,
          pending_amount: inv.total - newPaidAmount,
          status: newPaidAmount >= inv.total ? 'paid' : 'partial',
          paid_date: newPaidAmount >= inv.total ? payment.date : null,
          payments: [...inv.payments, newPayment],
        };
      })
    }));
  },
  
  approveMilestone: (contractId, milestoneId) => {
    set(state => ({
      contracts: state.contracts.map(c => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          milestones: c.milestones.map(ms =>
            ms.id === milestoneId ? {
              ...ms,
              status: 'eligible' as const,
              eligible_date: new Date().toISOString().split('T')[0],
            } : ms
          )
        };
      })
    }));
  },
  
  releaseRetention: (contractId, amount) => {
    set(state => ({
      contracts: state.contracts.map(c =>
        c.id === contractId ? {
          ...c,
          retention_released: c.retention_released + amount,
          retention_pending: c.retention_pending - amount,
        } : c
      )
    }));
  },
  
  getContractByProject: (projectId) => {
    return get().contracts.find(c => c.project_id === projectId);
  },
  
  getPendingMilestones: () => {
    return get().contracts.flatMap(c => 
      c.milestones.filter(ms => ms.status === 'eligible' || ms.status === 'pending')
    );
  },
  
  getOverdueInvoices: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().invoices.filter(inv => 
      inv.status !== 'paid' && inv.status !== 'cancelled' && inv.due_date < today
    );
  },
  
  getTotalPendingRetention: () => {
    return get().contracts.reduce((sum, c) => sum + c.retention_pending, 0);
  },
}));
