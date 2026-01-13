/**
 * Goods Receipts Store - Gestión de Recepción de Materiales
 * Alineado con database.types.ts (setup_cos_completo.sql)
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { GoodsReceipt, GoodsReceiptItem, GoodsReceiptStatus } from '../../lib/database.types';

export interface GoodsReceiptWithItems extends GoodsReceipt {
  items?: GoodsReceiptItem[];
  totalItems?: number;
  totalReceivedQty?: number;
}

interface GoodsReceiptsState {
  receipts: GoodsReceiptWithItems[];
  selectedReceiptId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD Receipts
  fetchReceipts: (projectId?: string) => Promise<void>;
  addReceipt: (receipt: Omit<GoodsReceipt, 'id' | 'code' | 'created_at'>) => Promise<void>;
  updateReceipt: (id: string, data: Partial<GoodsReceipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  
  // CRUD Items
  addItem: (item: Omit<GoodsReceiptItem, 'id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, data: Partial<GoodsReceiptItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Selection
  selectReceipt: (id: string | null) => void;
  
  // Getters
  getReceiptById: (id: string) => GoodsReceiptWithItems | undefined;
  getReceiptsByProject: (projectId: string) => GoodsReceiptWithItems[];
  getReceiptsByPO: (purchaseOrderId: string) => GoodsReceiptWithItems[];
  getReceiptsByStatus: (status: GoodsReceiptStatus) => GoodsReceiptWithItems[];
  getPendingReceipts: () => GoodsReceiptWithItems[];
}

// Demo data - aligned with database.types.ts
const DEMO_RECEIPTS: GoodsReceiptWithItems[] = [
  {
    id: 'receipt-1',
    code: 'REC-2024-001',
    purchase_order_id: 'po-1',
    project_id: 'project-1',
    receipt_date: '2024-02-15',
    received_by: 'Juan Pérez',
    delivery_note: 'FACT-12345',
    status: 'complete',
    notes: 'Materiales recibidos en buenas condiciones',
    photos: [],
    created_at: '2024-02-15T10:00:00Z',
    items: [
      {
        id: 'ri-1',
        goods_receipt_id: 'receipt-1',
        purchase_order_item_id: 'poi-1',
        quantity_received: 1000,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-02-15T10:00:00Z',
      },
      {
        id: 'ri-2',
        goods_receipt_id: 'receipt-1',
        purchase_order_item_id: 'poi-2',
        quantity_received: 50,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-02-15T10:00:00Z',
      },
      {
        id: 'ri-3',
        goods_receipt_id: 'receipt-1',
        purchase_order_item_id: 'poi-3',
        quantity_received: 20,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-02-15T10:00:00Z',
      },
    ],
    totalItems: 3,
    totalReceivedQty: 1070,
  },
  {
    id: 'receipt-2',
    code: 'REC-2024-002',
    purchase_order_id: 'po-2',
    project_id: 'project-1',
    receipt_date: '2024-02-20',
    received_by: 'Carlos López',
    delivery_note: 'REM-5678',
    status: 'complete',
    notes: null,
    photos: [],
    created_at: '2024-02-20T14:30:00Z',
    items: [
      {
        id: 'ri-4',
        goods_receipt_id: 'receipt-2',
        purchase_order_item_id: 'poi-4',
        quantity_received: 500,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-02-20T14:30:00Z',
      },
      {
        id: 'ri-5',
        goods_receipt_id: 'receipt-2',
        purchase_order_item_id: 'poi-5',
        quantity_received: 20,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-02-20T14:30:00Z',
      },
    ],
    totalItems: 2,
    totalReceivedQty: 520,
  },
  {
    id: 'receipt-3',
    code: 'REC-2024-003',
    purchase_order_id: 'po-3',
    project_id: 'project-1',
    receipt_date: '2024-03-01',
    received_by: 'Juan Pérez',
    delivery_note: 'FACT-9999',
    status: 'partial',
    notes: 'Entrega parcial - Faltan 5 ventanas',
    photos: [],
    created_at: '2024-03-01T09:00:00Z',
    items: [
      {
        id: 'ri-6',
        goods_receipt_id: 'receipt-3',
        purchase_order_item_id: 'poi-6',
        quantity_received: 5,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-03-01T09:00:00Z',
      },
      {
        id: 'ri-7',
        goods_receipt_id: 'receipt-3',
        purchase_order_item_id: 'poi-7',
        quantity_received: 3,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-03-01T09:00:00Z',
      },
    ],
    totalItems: 2,
    totalReceivedQty: 8,
  },
  {
    id: 'receipt-4',
    code: 'REC-2024-004',
    purchase_order_id: 'po-4',
    project_id: 'project-1',
    receipt_date: '2024-03-10',
    received_by: 'Carlos López',
    delivery_note: 'REM-1234',
    status: 'with_issues',
    notes: 'Material no cumple especificaciones. Se rechaza parcialmente.',
    photos: [],
    created_at: '2024-03-10T11:00:00Z',
    items: [
      {
        id: 'ri-8',
        goods_receipt_id: 'receipt-4',
        purchase_order_item_id: 'poi-8',
        quantity_received: 80,
        quantity_rejected: 20,
        rejection_reason: 'Cerámicos con defectos de fábrica visibles',
        created_at: '2024-03-10T11:00:00Z',
      },
    ],
    totalItems: 1,
    totalReceivedQty: 80,
  },
  {
    id: 'receipt-5',
    code: 'REC-2024-005',
    purchase_order_id: 'po-5',
    project_id: 'project-2',
    receipt_date: '2024-03-15',
    received_by: 'Juan Pérez',
    delivery_note: 'FACT-1111',
    status: 'complete',
    notes: 'Entrega completa de hierros',
    photos: [],
    created_at: '2024-03-15T15:00:00Z',
    items: [
      {
        id: 'ri-9',
        goods_receipt_id: 'receipt-5',
        purchase_order_item_id: 'poi-9',
        quantity_received: 200,
        quantity_rejected: 0,
        rejection_reason: null,
        created_at: '2024-03-15T15:00:00Z',
      },
    ],
    totalItems: 1,
    totalReceivedQty: 200,
  },
];

const generateId = () => crypto.randomUUID();
const generateReceiptCode = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `REC-${year}-${num}`;
};

// Helper to calculate item totals
const calculateTotals = (items: GoodsReceiptItem[]): { totalItems: number; totalReceivedQty: number } => {
  return {
    totalItems: items.length,
    totalReceivedQty: items.reduce((sum, i) => sum + (i.quantity_received || 0), 0),
  };
};

export const useGoodsReceiptsStore = create<GoodsReceiptsState>()((set, get) => ({
  receipts: DEMO_RECEIPTS,
  selectedReceiptId: null,
  isLoading: false,
  error: null,

  fetchReceipts: async (projectId) => {
    if (!isSupabaseConfigured() || !supabase) {
      const filtered = projectId 
        ? DEMO_RECEIPTS.filter(r => r.project_id === projectId)
        : DEMO_RECEIPTS;
      set({ receipts: filtered });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('goods_receipts').select('*').order('receipt_date', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data: receiptsData, error: receiptsError } = await query;
      
      if (receiptsError) throw receiptsError;
      
      // Fetch items for all receipts
      const { data: itemsData, error: itemsError } = await supabase
        .from('goods_receipt_items')
        .select('*');
      
      if (itemsError) throw itemsError;
      
      const receipts = (receiptsData || []).map((receipt: GoodsReceipt) => {
        const items = (itemsData || []).filter((i: GoodsReceiptItem) => i.goods_receipt_id === receipt.id);
        return {
          ...receipt,
          items,
          ...calculateTotals(items)
        };
      });
      
      set({ receipts, isLoading: false });
    } catch (error) {
      console.error('Error fetching receipts:', error);
      set({ error: 'Error al cargar recepciones', isLoading: false });
    }
  },

  addReceipt: async (receiptData) => {
    const newReceipt: GoodsReceiptWithItems = {
      ...receiptData,
      id: generateId(),
      code: generateReceiptCode(),
      created_at: new Date().toISOString(),
      items: [],
      totalItems: 0,
      totalReceivedQty: 0,
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({ receipts: [newReceipt, ...state.receipts] }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('goods_receipts')
        .insert(receiptData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ receipts: [{ ...data, items: [], totalItems: 0, totalReceivedQty: 0 }, ...state.receipts] }));
    } catch (error) {
      console.error('Error adding receipt:', error);
      throw error;
    }
  },

  updateReceipt: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        receipts: state.receipts.map(r => r.id === id ? { ...r, ...data } : r)
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('goods_receipts')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        receipts: state.receipts.map(r => r.id === id ? { ...r, ...data } : r)
      }));
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  },

  deleteReceipt: async (id) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        receipts: state.receipts.filter(r => r.id !== id),
        selectedReceiptId: state.selectedReceiptId === id ? null : state.selectedReceiptId
      }));
      return;
    }
    
    try {
      // Items are deleted via cascade
      const { error } = await supabase
        .from('goods_receipts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        receipts: state.receipts.filter(r => r.id !== id),
        selectedReceiptId: state.selectedReceiptId === id ? null : state.selectedReceiptId
      }));
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  },

  addItem: async (itemData) => {
    const newItem: GoodsReceiptItem = {
      ...itemData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        receipts: state.receipts.map(r => {
          if (r.id === itemData.goods_receipt_id) {
            const items = [...(r.items || []), newItem];
            return { ...r, items, ...calculateTotals(items) };
          }
          return r;
        })
      }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('goods_receipt_items')
        .insert(itemData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        receipts: state.receipts.map(r => {
          if (r.id === itemData.goods_receipt_id) {
            const items = [...(r.items || []), data];
            return { ...r, items, ...calculateTotals(items) };
          }
          return r;
        })
      }));
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  updateItem: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        receipts: state.receipts.map(r => {
          const items = r.items?.map(i => i.id === id ? { ...i, ...data } : i);
          return { ...r, items, ...calculateTotals(items || []) };
        })
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('goods_receipt_items')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        receipts: state.receipts.map(r => {
          const items = r.items?.map(i => i.id === id ? { ...i, ...data } : i);
          return { ...r, items, ...calculateTotals(items || []) };
        })
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        receipts: state.receipts.map(r => {
          const items = r.items?.filter(i => i.id !== id);
          return { ...r, items, ...calculateTotals(items || []) };
        })
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('goods_receipt_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        receipts: state.receipts.map(r => {
          const items = r.items?.filter(i => i.id !== id);
          return { ...r, items, ...calculateTotals(items || []) };
        })
      }));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  selectReceipt: (id) => {
    set({ selectedReceiptId: id });
  },

  getReceiptById: (id) => {
    return get().receipts.find(r => r.id === id);
  },

  getReceiptsByProject: (projectId) => {
    return get().receipts.filter(r => r.project_id === projectId);
  },

  getReceiptsByPO: (purchaseOrderId) => {
    return get().receipts.filter(r => r.purchase_order_id === purchaseOrderId);
  },

  getReceiptsByStatus: (status) => {
    return get().receipts.filter(r => r.status === status);
  },

  getPendingReceipts: () => {
    return get().receipts.filter(r => r.status === 'partial' || r.status === 'with_issues');
  },
}));

// Helper constants - aligned with GoodsReceiptStatus enum
export const RECEIPT_STATUSES: Array<{ value: GoodsReceiptStatus; label: string; icon: string; color: string }> = [
  { value: 'complete', label: 'Completo', icon: '✅', color: 'bg-green-500' },
  { value: 'partial', label: 'Parcial', icon: '⏳', color: 'bg-yellow-500' },
  { value: 'with_issues', label: 'Con Problemas', icon: '⚠️', color: 'bg-red-500' },
];

export const getStatusConfig = (status: GoodsReceiptStatus) => {
  return RECEIPT_STATUSES.find(s => s.value === status) || RECEIPT_STATUSES[0];
};
