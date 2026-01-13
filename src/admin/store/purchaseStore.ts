/**
 * Purchase Store - Compras y Proveedores simplificado
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  rating: number;
  total_orders: number;
  total_purchases: number;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  project_id: string;
  supplier_id: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
}

interface PurchaseState {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code' | 'rating' | 'total_orders' | 'total_purchases' | 'created_at'>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  
  fetchPurchaseOrders: (projectId?: string) => Promise<void>;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'code' | 'created_at'>) => Promise<void>;
  updateOrderStatus: (id: string, status: PurchaseOrder['status']) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>()((set) => ({
  suppliers: [],
  purchaseOrders: [],
  isLoading: false,

  fetchSuppliers: async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    set({ isLoading: true });
    const { data } = await supabase.from('suppliers').select('*').order('name');
    set({ suppliers: data || [], isLoading: false });
  },

  addSupplier: async (supplier) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const code = `PROV-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...supplier, code, rating: 0, total_orders: 0, total_purchases: 0 })
      .select()
      .single();
    if (!error && data) {
      set(state => ({ suppliers: [...state.suppliers, data] }));
    }
  },

  updateSupplier: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { error } = await supabase.from('suppliers').update(data).eq('id', id);
    if (!error) {
      set(state => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...data } : s)
      }));
    }
  },

  fetchPurchaseOrders: async (projectId?: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    set({ isLoading: true });
    let query = supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data } = await query;
    set({ purchaseOrders: data || [], isLoading: false });
  },

  addPurchaseOrder: async (order) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const code = `OC-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({ ...order, code })
      .select()
      .single();
    if (!error && data) {
      set(state => ({ purchaseOrders: [data, ...state.purchaseOrders] }));
    }
  },

  updateOrderStatus: async (id, status) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);
    if (!error) {
      set(state => ({
        purchaseOrders: state.purchaseOrders.map(o => o.id === id ? { ...o, status } : o)
      }));
    }
  }
}));
