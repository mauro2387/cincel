/**
 * Receivables & Payables Store - ERP Core
 * Gestión de cuentas por cobrar y pagar con proyección
 * Responde: "¿Cuánto me deben? ¿Cuánto debo? ¿Cuándo entra/sale la plata?"
 */

import { create } from 'zustand';
import type { 
  Receivable, 
  Payable, 
  ReceivableType,
  ReceivableStatus,
  PayableType,
  PayableStatus,
  ReceivablesAging,
  PayablesAging
} from '../../lib/database.types';

// ============================================
// TIPOS AUXILIARES
// ============================================

export const RECEIVABLE_TYPES: { value: ReceivableType; label: string; icon: string }[] = [
  { value: 'milestone', label: 'Hito de Contrato', icon: '🎯' },
  { value: 'change_order', label: 'Orden de Cambio', icon: '📝' },
  { value: 'extra', label: 'Trabajo Extra', icon: '➕' },
  { value: 'retention', label: 'Liberación Retención', icon: '🔓' },
  { value: 'other', label: 'Otro', icon: '📄' },
];

export const RECEIVABLE_STATUSES: { value: ReceivableStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Borrador', color: 'bg-gray-400' },
  { value: 'pending', label: 'Pendiente', color: 'bg-blue-500' },
  { value: 'partial', label: 'Pago Parcial', color: 'bg-yellow-500' },
  { value: 'paid', label: 'Cobrado', color: 'bg-green-500' },
  { value: 'overdue', label: 'Vencido', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-gray-500' },
  { value: 'written_off', label: 'Incobrable', color: 'bg-red-700' },
];

export const PAYABLE_TYPES: { value: PayableType; label: string; icon: string }[] = [
  { value: 'purchase_order', label: 'Orden de Compra', icon: '📦' },
  { value: 'subcontract', label: 'Subcontrato', icon: '🏗️' },
  { value: 'payroll', label: 'Nómina', icon: '👷' },
  { value: 'tax', label: 'Impuestos', icon: '📋' },
  { value: 'overhead', label: 'Gastos Generales', icon: '🏢' },
  { value: 'retention', label: 'Retención a Devolver', icon: '🔒' },
  { value: 'other', label: 'Otro', icon: '📄' },
];

export const PAYABLE_STATUSES: { value: PayableStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Borrador', color: 'bg-gray-400' },
  { value: 'pending', label: 'Pendiente', color: 'bg-blue-500' },
  { value: 'partial', label: 'Pago Parcial', color: 'bg-yellow-500' },
  { value: 'paid', label: 'Pagado', color: 'bg-green-500' },
  { value: 'overdue', label: 'Vencido', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-gray-500' },
  { value: 'disputed', label: 'En Disputa', color: 'bg-orange-500' },
];

export const getReceivableTypeConfig = (type: ReceivableType) =>
  RECEIVABLE_TYPES.find(t => t.value === type) || RECEIVABLE_TYPES[4];

export const getReceivableStatusConfig = (status: ReceivableStatus) =>
  RECEIVABLE_STATUSES.find(s => s.value === status) || RECEIVABLE_STATUSES[0];

export const getPayableTypeConfig = (type: PayableType) =>
  PAYABLE_TYPES.find(t => t.value === type) || PAYABLE_TYPES[6];

export const getPayableStatusConfig = (status: PayableStatus) =>
  PAYABLE_STATUSES.find(s => s.value === status) || PAYABLE_STATUSES[0];

// ============================================
// DATOS DEMO
// ============================================

const mockReceivables: Receivable[] = [
  {
    id: 'rec-1',
    code: 'CXC-2026-0001',
    type: 'milestone',
    project_id: 'proj-1',
    contract_id: 'cont-1',
    milestone_id: 'ms-2',
    change_order_id: null,
    client_id: 'cli-1',
    amount: 2500000,
    tax_amount: 550000,
    total_amount: 3050000,
    paid_amount: 850000,
    pending_amount: 2200000,
    invoice_number: 'FAC-2026-0042',
    invoice_date: '2026-01-05',
    invoice_url: null,
    due_date: '2026-01-20',
    expected_payment_date: '2026-01-22',
    status: 'partial',
    days_overdue: 0,
    description: 'Hito 2: Estructura completa - Casa Carrasco',
    notes: 'Cliente solicitó pago en 2 cuotas',
    created_by: 'admin-1',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-10T14:30:00Z',
  },
  {
    id: 'rec-2',
    code: 'CXC-2026-0002',
    type: 'change_order',
    project_id: 'proj-1',
    contract_id: 'cont-1',
    milestone_id: null,
    change_order_id: 'co-1',
    client_id: 'cli-1',
    amount: 180000,
    tax_amount: 39600,
    total_amount: 219600,
    paid_amount: 0,
    pending_amount: 219600,
    invoice_number: 'FAC-2026-0045',
    invoice_date: '2026-01-08',
    invoice_url: null,
    due_date: '2026-01-25',
    expected_payment_date: '2026-01-28',
    status: 'pending',
    days_overdue: 0,
    description: 'Orden de Cambio #1: Ampliación terraza - Casa Carrasco',
    notes: null,
    created_by: 'admin-1',
    created_at: '2026-01-08T11:00:00Z',
    updated_at: '2026-01-08T11:00:00Z',
  },
  {
    id: 'rec-3',
    code: 'CXC-2026-0003',
    type: 'milestone',
    project_id: 'proj-2',
    contract_id: 'cont-2',
    milestone_id: 'ms-5',
    change_order_id: null,
    client_id: 'cli-2',
    amount: 1800000,
    tax_amount: 396000,
    total_amount: 2196000,
    paid_amount: 0,
    pending_amount: 2196000,
    invoice_number: null,
    invoice_date: null,
    invoice_url: null,
    due_date: '2026-02-15',
    expected_payment_date: '2026-02-20',
    status: 'draft',
    days_overdue: 0,
    description: 'Hito 3: Instalaciones - Edificio Pocitos',
    notes: 'Pendiente facturar cuando complete inspección',
    created_by: 'admin-1',
    created_at: '2026-01-12T09:00:00Z',
    updated_at: '2026-01-12T09:00:00Z',
  },
  {
    id: 'rec-4',
    code: 'CXC-2025-0089',
    type: 'milestone',
    project_id: 'proj-3',
    contract_id: 'cont-3',
    milestone_id: 'ms-10',
    change_order_id: null,
    client_id: 'cli-3',
    amount: 450000,
    tax_amount: 99000,
    total_amount: 549000,
    paid_amount: 0,
    pending_amount: 549000,
    invoice_number: 'FAC-2025-0112',
    invoice_date: '2025-12-01',
    invoice_url: null,
    due_date: '2025-12-20',
    expected_payment_date: null,
    status: 'overdue',
    days_overdue: 24,
    description: 'Hito Final: Entrega - Reforma Oficina Centro',
    notes: 'Cliente con dificultades de pago. Contactar.',
    created_by: 'admin-1',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-13T08:00:00Z',
  },
];

const mockPayables: Payable[] = [
  {
    id: 'pay-1',
    code: 'CXP-2026-0001',
    type: 'purchase_order',
    project_id: 'proj-1',
    purchase_order_id: 'po-1',
    supplier_id: 'sup-1',
    amount: 245000,
    tax_amount: 53900,
    total_amount: 298900,
    paid_amount: 298900,
    pending_amount: 0,
    supplier_invoice_number: 'FP-78901',
    supplier_invoice_date: '2026-01-08',
    supplier_invoice_url: null,
    due_date: '2026-01-18',
    expected_payment_date: null,
    status: 'paid',
    days_overdue: 0,
    approved_for_payment: true,
    approved_by: 'admin-1',
    approved_at: '2026-01-10T09:00:00Z',
    description: 'OC-2026-0015: Materiales estructura - Ferretería Industrial',
    notes: null,
    created_by: 'admin-1',
    created_at: '2026-01-08T14:00:00Z',
    updated_at: '2026-01-11T10:00:00Z',
  },
  {
    id: 'pay-2',
    code: 'CXP-2026-0002',
    type: 'payroll',
    project_id: null,
    purchase_order_id: null,
    supplier_id: null,
    amount: 380000,
    tax_amount: 0,
    total_amount: 380000,
    paid_amount: 380000,
    pending_amount: 0,
    supplier_invoice_number: 'NOM-2026-01-Q1',
    supplier_invoice_date: '2026-01-13',
    supplier_invoice_url: null,
    due_date: '2026-01-15',
    expected_payment_date: null,
    status: 'paid',
    days_overdue: 0,
    approved_for_payment: true,
    approved_by: 'admin-1',
    approved_at: '2026-01-12T16:00:00Z',
    description: 'Nómina Enero 2026 - Primera quincena',
    notes: null,
    created_by: 'admin-1',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-13T09:00:00Z',
  },
  {
    id: 'pay-3',
    code: 'CXP-2026-0003',
    type: 'purchase_order',
    project_id: 'proj-1',
    purchase_order_id: 'po-2',
    supplier_id: 'sup-2',
    amount: 520000,
    tax_amount: 114400,
    total_amount: 634400,
    paid_amount: 0,
    pending_amount: 634400,
    supplier_invoice_number: 'FC-2026-0234',
    supplier_invoice_date: '2026-01-10',
    supplier_invoice_url: null,
    due_date: '2026-02-10',
    expected_payment_date: '2026-02-08',
    status: 'pending',
    days_overdue: 0,
    approved_for_payment: true,
    approved_by: 'admin-1',
    approved_at: '2026-01-12T11:00:00Z',
    description: 'OC-2026-0018: Aberturas aluminio - Aluminios del Este',
    notes: 'Pagar antes del 8/2 para obtener 5% descuento',
    created_by: 'admin-1',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-12T11:00:00Z',
  },
  {
    id: 'pay-4',
    code: 'CXP-2026-0004',
    type: 'subcontract',
    project_id: 'proj-1',
    purchase_order_id: null,
    supplier_id: 'sup-3',
    amount: 280000,
    tax_amount: 61600,
    total_amount: 341600,
    paid_amount: 170800,
    pending_amount: 170800,
    supplier_invoice_number: 'SC-0045',
    supplier_invoice_date: '2026-01-05',
    supplier_invoice_url: null,
    due_date: '2026-01-20',
    expected_payment_date: '2026-01-20',
    status: 'partial',
    days_overdue: 0,
    approved_for_payment: true,
    approved_by: 'admin-1',
    approved_at: '2026-01-08T14:00:00Z',
    description: 'Subcontrato Eléctrico - Avance 50%',
    notes: 'Segundo pago contra finalización',
    created_by: 'admin-1',
    created_at: '2026-01-05T16:00:00Z',
    updated_at: '2026-01-10T15:00:00Z',
  },
  {
    id: 'pay-5',
    code: 'CXP-2025-0156',
    type: 'purchase_order',
    project_id: 'proj-2',
    purchase_order_id: 'po-old-1',
    supplier_id: 'sup-4',
    amount: 185000,
    tax_amount: 40700,
    total_amount: 225700,
    paid_amount: 0,
    pending_amount: 225700,
    supplier_invoice_number: 'F-45678',
    supplier_invoice_date: '2025-12-15',
    supplier_invoice_url: null,
    due_date: '2026-01-05',
    expected_payment_date: null,
    status: 'overdue',
    days_overdue: 8,
    approved_for_payment: false,
    approved_by: null,
    approved_at: null,
    description: 'OC-2025-0089: Sanitarios - Disputa por calidad',
    notes: 'En disputa: productos llegaron dañados. Negociando descuento.',
    created_by: 'admin-1',
    created_at: '2025-12-15T10:00:00Z',
    updated_at: '2026-01-08T09:00:00Z',
  },
];

// ============================================
// STORE INTERFACE
// ============================================

interface ReceivablesPayablesState {
  receivables: Receivable[];
  payables: Payable[];
  selectedReceivableId: string | null;
  selectedPayableId: string | null;
  loading: boolean;
  
  // Acciones - Receivables
  fetchReceivables: (projectId?: string) => Promise<void>;
  addReceivable: (receivable: Omit<Receivable, 'id' | 'code' | 'created_at' | 'updated_at'>) => void;
  updateReceivable: (id: string, updates: Partial<Receivable>) => void;
  invoiceReceivable: (id: string, invoiceNumber: string) => void;
  recordPayment: (id: string, amount: number) => void;
  selectReceivable: (id: string | null) => void;
  
  // Acciones - Payables
  fetchPayables: (projectId?: string) => Promise<void>;
  addPayable: (payable: Omit<Payable, 'id' | 'code' | 'created_at' | 'updated_at'>) => void;
  updatePayable: (id: string, updates: Partial<Payable>) => void;
  approveForPayment: (id: string) => void;
  recordPayablePayment: (id: string, amount: number) => void;
  selectPayable: (id: string | null) => void;
  
  // Getters
  getReceivablesAging: () => ReceivablesAging;
  getPayablesAging: () => PayablesAging;
  getTotalReceivables: () => number;
  getTotalPayables: () => number;
  getOverdueReceivables: () => Receivable[];
  getOverduePayables: () => Payable[];
  getExpectedIncome: (days: number) => number;
  getExpectedExpense: (days: number) => number;
  getProjectReceivables: (projectId: string) => Receivable[];
  getProjectPayables: (projectId: string) => Payable[];
}

// ============================================
// STORE
// ============================================

export const useReceivablesPayablesStore = create<ReceivablesPayablesState>((set, get) => ({
  receivables: mockReceivables,
  payables: mockPayables,
  selectedReceivableId: null,
  selectedPayableId: null,
  loading: false,
  
  // Receivables
  fetchReceivables: async (_projectId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  addReceivable: (receivable) => {
    const code = `CXC-${new Date().getFullYear()}-${String(get().receivables.length + 1).padStart(4, '0')}`;
    const newReceivable: Receivable = {
      ...receivable,
      id: crypto.randomUUID(),
      code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set(state => ({ receivables: [...state.receivables, newReceivable] }));
  },
  
  updateReceivable: (id, updates) => {
    set(state => ({
      receivables: state.receivables.map(r =>
        r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
      ),
    }));
  },
  
  invoiceReceivable: (id, invoiceNumber) => {
    const receivable = get().receivables.find(r => r.id === id);
    if (!receivable) return;
    
    set(state => ({
      receivables: state.receivables.map(r =>
        r.id === id ? {
          ...r,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          status: 'pending' as ReceivableStatus,
          updated_at: new Date().toISOString(),
        } : r
      ),
    }));
  },
  
  recordPayment: (id, amount) => {
    const receivable = get().receivables.find(r => r.id === id);
    if (!receivable) return;
    
    const newPaidAmount = receivable.paid_amount + amount;
    const newPendingAmount = receivable.total_amount - newPaidAmount;
    const newStatus: ReceivableStatus = newPendingAmount <= 0 ? 'paid' : 'partial';
    
    set(state => ({
      receivables: state.receivables.map(r =>
        r.id === id ? {
          ...r,
          paid_amount: newPaidAmount,
          pending_amount: Math.max(0, newPendingAmount),
          status: newStatus,
          updated_at: new Date().toISOString(),
        } : r
      ),
    }));
  },
  
  selectReceivable: (id) => set({ selectedReceivableId: id }),
  
  // Payables
  fetchPayables: async (_projectId?: string) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ loading: false });
  },
  
  addPayable: (payable) => {
    const code = `CXP-${new Date().getFullYear()}-${String(get().payables.length + 1).padStart(4, '0')}`;
    const newPayable: Payable = {
      ...payable,
      id: crypto.randomUUID(),
      code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set(state => ({ payables: [...state.payables, newPayable] }));
  },
  
  updatePayable: (id, updates) => {
    set(state => ({
      payables: state.payables.map(p =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
    }));
  },
  
  approveForPayment: (id) => {
    set(state => ({
      payables: state.payables.map(p =>
        p.id === id ? {
          ...p,
          approved_for_payment: true,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : p
      ),
    }));
  },
  
  recordPayablePayment: (id, amount) => {
    const payable = get().payables.find(p => p.id === id);
    if (!payable) return;
    
    const newPaidAmount = payable.paid_amount + amount;
    const newPendingAmount = payable.total_amount - newPaidAmount;
    const newStatus: PayableStatus = newPendingAmount <= 0 ? 'paid' : 'partial';
    
    set(state => ({
      payables: state.payables.map(p =>
        p.id === id ? {
          ...p,
          paid_amount: newPaidAmount,
          pending_amount: Math.max(0, newPendingAmount),
          status: newStatus,
          updated_at: new Date().toISOString(),
        } : p
      ),
    }));
  },
  
  selectPayable: (id) => set({ selectedPayableId: id }),
  
  // Getters
  getReceivablesAging: () => {
    const { receivables } = get();
    const pending = receivables.filter(r => r.status !== 'paid' && r.status !== 'cancelled' && r.status !== 'written_off');
    
    return {
      current: pending.filter(r => r.days_overdue <= 0).reduce((sum, r) => sum + r.pending_amount, 0),
      overdue_1_30: pending.filter(r => r.days_overdue > 0 && r.days_overdue <= 30).reduce((sum, r) => sum + r.pending_amount, 0),
      overdue_31_60: pending.filter(r => r.days_overdue > 30 && r.days_overdue <= 60).reduce((sum, r) => sum + r.pending_amount, 0),
      overdue_61_90: pending.filter(r => r.days_overdue > 60 && r.days_overdue <= 90).reduce((sum, r) => sum + r.pending_amount, 0),
      overdue_90_plus: pending.filter(r => r.days_overdue > 90).reduce((sum, r) => sum + r.pending_amount, 0),
      total: pending.reduce((sum, r) => sum + r.pending_amount, 0),
    };
  },
  
  getPayablesAging: () => {
    const { payables } = get();
    const pending = payables.filter(p => p.status !== 'paid' && p.status !== 'cancelled');
    
    return {
      current: pending.filter(p => p.days_overdue <= 0).reduce((sum, p) => sum + p.pending_amount, 0),
      overdue_1_30: pending.filter(p => p.days_overdue > 0 && p.days_overdue <= 30).reduce((sum, p) => sum + p.pending_amount, 0),
      overdue_31_60: pending.filter(p => p.days_overdue > 30 && p.days_overdue <= 60).reduce((sum, p) => sum + p.pending_amount, 0),
      overdue_61_90: pending.filter(p => p.days_overdue > 60 && p.days_overdue <= 90).reduce((sum, p) => sum + p.pending_amount, 0),
      overdue_90_plus: pending.filter(p => p.days_overdue > 90).reduce((sum, p) => sum + p.pending_amount, 0),
      total: pending.reduce((sum, p) => sum + p.pending_amount, 0),
    };
  },
  
  getTotalReceivables: () => {
    return get().receivables
      .filter(r => r.status !== 'paid' && r.status !== 'cancelled' && r.status !== 'written_off')
      .reduce((sum, r) => sum + r.pending_amount, 0);
  },
  
  getTotalPayables: () => {
    return get().payables
      .filter(p => p.status !== 'paid' && p.status !== 'cancelled')
      .reduce((sum, p) => sum + p.pending_amount, 0);
  },
  
  getOverdueReceivables: () => {
    return get().receivables.filter(r => r.status === 'overdue');
  },
  
  getOverduePayables: () => {
    return get().payables.filter(p => p.status === 'overdue');
  },
  
  getExpectedIncome: (days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return get().receivables
      .filter(r => {
        if (r.status === 'paid' || r.status === 'cancelled' || r.status === 'written_off') return false;
        const expectedDate = r.expected_payment_date || r.due_date;
        return new Date(expectedDate) <= futureDate;
      })
      .reduce((sum, r) => sum + r.pending_amount, 0);
  },
  
  getExpectedExpense: (days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return get().payables
      .filter(p => {
        if (p.status === 'paid' || p.status === 'cancelled') return false;
        const expectedDate = p.expected_payment_date || p.due_date;
        return new Date(expectedDate) <= futureDate;
      })
      .reduce((sum, p) => sum + p.pending_amount, 0);
  },
  
  getProjectReceivables: (projectId: string) => {
    return get().receivables.filter(r => r.project_id === projectId);
  },
  
  getProjectPayables: (projectId: string) => {
    return get().payables.filter(p => p.project_id === projectId);
  },
}));
