/**
 * Change Order Store - Órdenes de cambio simplificadas
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface ChangeOrder {
  id: string;
  project_id: string;
  code: string;
  title: string;
  description: string;
  reason: string;
  type: 'addition' | 'modification' | 'deletion';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'invoiced';
  cost_impact: number;
  time_impact_days: number;
  created_at: string;
}

export const CHANGE_ORDER_STATUSES = [
  { value: 'draft', label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending_review', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Aprobada', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  { value: 'invoiced', label: 'Facturada', color: 'bg-blue-100 text-blue-800' }
];

export const CHANGE_ORDER_TYPES = [
  { value: 'addition', label: 'Adición', color: 'bg-green-100 text-green-800' },
  { value: 'modification', label: 'Modificación', color: 'bg-blue-100 text-blue-800' },
  { value: 'deletion', label: 'Eliminación', color: 'bg-red-100 text-red-800' }
];

interface ChangeOrderState {
  changeOrders: ChangeOrder[];
  isLoading: boolean;
  error: string | null;
  fetchChangeOrders: (projectId?: string) => Promise<void>;
  addChangeOrder: (order: Omit<ChangeOrder, 'id' | 'code' | 'created_at'>) => Promise<void>;
}

export const useChangeOrderStore = create<ChangeOrderState>()((set) => ({
  changeOrders: [],
  isLoading: false,
  error: null,

  fetchChangeOrders: async (projectId?: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    set({ isLoading: true });
    try {
      let query = supabase.from('change_orders').select('*').order('created_at', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const { data } = await query;
      set({ changeOrders: data || [], isLoading: false });
    } catch (e) {
      set({ error: 'Error loading change orders', isLoading: false });
    }
  },

  addChangeOrder: async (order) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const code = `OC-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from('change_orders')
      .insert({ ...order, code })
      .select()
      .single();
    if (!error && data) {
      set(state => ({ changeOrders: [data, ...state.changeOrders] }));
    }
  }
}));
