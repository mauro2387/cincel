/**
 * Finance Store - Gestión financiera simplificada
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export type PaymentType = 'income' | 'expense';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentCategory = 'client_payment' | 'advance' | 'material' | 'labor' | 'equipment' | 'subcontract' | 'overhead' | 'other';

export interface Payment {
  id: string;
  project_id: string;
  type: PaymentType;
  category: PaymentCategory;
  concept: string;
  amount: number;
  status: PaymentStatus;
  due_date: string;
  paid_date: string | null;
  third_party: string | null;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinancialAlert {
  id: string;
  project_id: string | null;
  type: string;
  message: string;
  acknowledged: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface FinancialSummary {
  totalReceivable: number;
  totalPayable: number;
  netBalance: number;
  overdueAmount: number;
  overdueCount: number;
  pendingIncome: number;
  pendingExpenses: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  incomeByCategory: Array<{ category: string; amount: number; percentage: number }>;
  expensesByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

export interface CashFlowPeriod {
  period: string;
  startingBalance: number;
  projectedIncome: number;
  projectedExpenses: number;
  netFlow: number;
  endingBalance: number;
}

export const PAYMENT_CATEGORIES = [
  { value: 'client_payment', label: 'Pago de Cliente' },
  { value: 'advance', label: 'Anticipo' },
  { value: 'material', label: 'Materiales' },
  { value: 'labor', label: 'Mano de Obra' },
  { value: 'equipment', label: 'Equipos' },
  { value: 'subcontract', label: 'Subcontrato' },
  { value: 'overhead', label: 'Gastos Generales' },
  { value: 'other', label: 'Otros' }
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Pagado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-gray-100 text-gray-500' }
];

export const ALERT_TYPES = [
  { value: 'overdue', label: 'Pago Vencido', icon: '🔴' },
  { value: 'upcoming', label: 'Próximo Vencimiento', icon: '🟡' },
  { value: 'budget_exceeded', label: 'Presupuesto Excedido', icon: '🔴' },
  { value: 'low_cash', label: 'Flujo Bajo', icon: '🟠' }
];

interface FinanceState {
  payments: Payment[];
  alerts: FinancialAlert[];
  summary: FinancialSummary | null;
  cashFlow: CashFlowPeriod[];
  isLoading: boolean;
  
  fetchPayments: (projectId?: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'created_at' | 'paid_date'>) => Promise<void>;
  recordPayment: (id: string) => Promise<void>;
  
  fetchAlerts: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  
  calculateSummary: (projectId?: string) => void;
  calculateCashFlow: (months: number) => void;
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  payments: [],
  alerts: [],
  summary: null,
  cashFlow: [],
  isLoading: false,

  fetchPayments: async (projectId?: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    set({ isLoading: true });
    let query = supabase.from('payments').select('*').order('due_date', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data } = await query;
    set({ payments: data || [], isLoading: false });
  },

  addPayment: async (payment) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data, error } = await supabase
      .from('payments')
      .insert({ ...payment, paid_date: null })
      .select()
      .single();
    if (!error && data) {
      set(state => ({ payments: [data, ...state.payments] }));
      get().calculateSummary();
    }
  },

  recordPayment: async (id: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_date: today })
      .eq('id', id);
    if (!error) {
      set(state => ({
        payments: state.payments.map(p => p.id === id ? { ...p, status: 'paid' as const, paid_date: today } : p)
      }));
      get().calculateSummary();
    }
  },

  fetchAlerts: async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data } = await supabase
      .from('financial_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    set({ alerts: data || [] });
  },

  acknowledgeAlert: async (id: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { error } = await supabase
      .from('financial_alerts')
      .update({ acknowledged: true })
      .eq('id', id);
    if (!error) {
      set(state => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
      }));
    }
  },

  resolveAlert: async (id: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { error } = await supabase
      .from('financial_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      set(state => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, resolved_at: new Date().toISOString() } : a)
      }));
    }
  },

  calculateSummary: (projectId?: string) => {
    const { payments } = get();
    const filtered = projectId ? payments.filter(p => p.project_id === projectId) : payments;
    
    const income = filtered.filter(p => p.type === 'income');
    const expenses = filtered.filter(p => p.type === 'expense');
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7);

    const totalReceivable = income.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const totalPayable = expenses.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const overduePayments = filtered.filter(p => p.status === 'pending' && p.due_date < today);

    const calculateByCategory = (items: Payment[]) => {
      const total = items.reduce((s, p) => s + p.amount, 0);
      const byCategory: Record<string, number> = {};
      items.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + p.amount; });
      return Object.entries(byCategory).map(([category, amount]) => ({
        category, amount, percentage: total > 0 ? (amount / total) * 100 : 0
      }));
    };

    set({
      summary: {
        totalReceivable,
        totalPayable,
        netBalance: totalReceivable - totalPayable,
        overdueAmount: overduePayments.reduce((s, p) => s + p.amount, 0),
        overdueCount: overduePayments.length,
        pendingIncome: income.filter(p => p.status === 'pending').length,
        pendingExpenses: expenses.filter(p => p.status === 'pending').length,
        incomeThisMonth: income.filter(p => p.paid_date?.startsWith(monthStart)).reduce((s, p) => s + p.amount, 0),
        expensesThisMonth: expenses.filter(p => p.paid_date?.startsWith(monthStart)).reduce((s, p) => s + p.amount, 0),
        incomeByCategory: calculateByCategory(income.filter(p => p.status === 'paid')),
        expensesByCategory: calculateByCategory(expenses.filter(p => p.status === 'paid'))
      }
    });
  },

  calculateCashFlow: (months: number) => {
    const { payments } = get();
    const periods: CashFlowPeriod[] = [];
    let balance = 0;
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const period = date.toLocaleDateString('es', { month: 'short', year: 'numeric' });
      const monthStr = date.toISOString().substring(0, 7);
      
      const monthPayments = payments.filter(p => p.due_date.startsWith(monthStr) && p.status !== 'cancelled');
      const projectedIncome = monthPayments.filter(p => p.type === 'income').reduce((s, p) => s + p.amount, 0);
      const projectedExpenses = monthPayments.filter(p => p.type === 'expense').reduce((s, p) => s + p.amount, 0);
      const netFlow = projectedIncome - projectedExpenses;

      periods.push({
        period,
        startingBalance: balance,
        projectedIncome,
        projectedExpenses,
        netFlow,
        endingBalance: balance + netFlow
      });
      balance += netFlow;
    }
    set({ cashFlow: periods });
  }
}));
