/**
 * Quality Store - Gestión de Control de Calidad
 * Alineado con database.types.ts (setup_cos_completo.sql)
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { 
  QualityChecklist, 
  ChecklistItem, 
  ChecklistStatus, 
  ChecklistCategory,
  ChecklistItemStatus 
} from '../../lib/database.types';

export interface ChecklistWithItems extends QualityChecklist {
  items?: ChecklistItem[];
  completedItems?: number;
  totalItems?: number;
  completionPercentage?: number;
}

interface QualityState {
  checklists: ChecklistWithItems[];
  selectedChecklistId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD Checklists
  fetchChecklists: (projectId?: string) => Promise<void>;
  addChecklist: (checklist: Omit<QualityChecklist, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateChecklist: (id: string, data: Partial<QualityChecklist>) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  
  // CRUD Items
  addItem: (item: Omit<ChecklistItem, 'id' | 'created_at' | 'checked_at' | 'checked_by'>) => Promise<void>;
  updateItem: (id: string, data: Partial<ChecklistItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  checkItem: (id: string, inspectorId: string, status: ChecklistItemStatus, notes?: string) => Promise<void>;
  
  // Selection
  selectChecklist: (id: string | null) => void;
  
  // Getters
  getChecklistById: (id: string) => ChecklistWithItems | undefined;
  getChecklistsByProject: (projectId: string) => ChecklistWithItems[];
  getChecklistsByStatus: (status: ChecklistStatus) => ChecklistWithItems[];
  getPendingChecklists: () => ChecklistWithItems[];
}

// Demo data - aligned with database.types.ts
const DEMO_CHECKLISTS: ChecklistWithItems[] = [
  {
    id: 'checklist-1',
    project_id: 'project-1',
    name: 'Control de Cimientos',
    category: 'foundation',
    status: 'approved',
    due_date: '2024-02-15',
    completed_date: '2024-02-15',
    inspector: 'Juan Pérez',
    approved_by: 'admin-1',
    approved_at: '2024-02-15T14:30:00Z',
    score: 100,
    notes: 'Todos los elementos cumplen con las especificaciones',
    photos: [],
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-15T14:30:00Z',
    items: [
      {
        id: 'item-1',
        checklist_id: 'checklist-1',
        description: 'Profundidad de excavación según planos',
        order_number: 1,
        category: 'excavation',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-10T09:00:00Z',
        notes: 'Profundidad correcta: 1.2m',
        photo_url: null,
        created_at: '2024-01-20T10:00:00Z',
      },
      {
        id: 'item-2',
        checklist_id: 'checklist-1',
        description: 'Armadura según especificaciones técnicas',
        order_number: 2,
        category: 'reinforcement',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-12T10:00:00Z',
        notes: 'Hierro de 10mm c/15cm',
        photo_url: null,
        created_at: '2024-01-20T10:00:00Z',
      },
      {
        id: 'item-3',
        checklist_id: 'checklist-1',
        description: 'Nivel y alineación de encofrado',
        order_number: 3,
        category: 'formwork',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-13T11:00:00Z',
        notes: null,
        photo_url: null,
        created_at: '2024-01-20T10:00:00Z',
      },
      {
        id: 'item-4',
        checklist_id: 'checklist-1',
        description: 'Dosificación del hormigón',
        order_number: 4,
        category: 'concrete',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-14T08:00:00Z',
        notes: 'H25, testigos enviados a laboratorio',
        photo_url: null,
        created_at: '2024-01-20T10:00:00Z',
      },
      {
        id: 'item-5',
        checklist_id: 'checklist-1',
        description: 'Curado del hormigón',
        order_number: 5,
        category: 'curing',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-15T14:00:00Z',
        notes: '7 días de curado completos',
        photo_url: null,
        created_at: '2024-01-20T10:00:00Z',
      },
    ],
    completedItems: 5,
    totalItems: 5,
    completionPercentage: 100,
  },
  {
    id: 'checklist-2',
    project_id: 'project-1',
    name: 'Control de Estructura',
    category: 'structure',
    status: 'in_progress',
    due_date: '2024-03-15',
    completed_date: null,
    inspector: 'Juan Pérez',
    approved_by: null,
    approved_at: null,
    score: null,
    notes: null,
    photos: [],
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
    items: [
      {
        id: 'item-6',
        checklist_id: 'checklist-2',
        description: 'Columnas a plomo',
        order_number: 1,
        category: 'columns',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-25T10:00:00Z',
        notes: null,
        photo_url: null,
        created_at: '2024-02-20T10:00:00Z',
      },
      {
        id: 'item-7',
        checklist_id: 'checklist-2',
        description: 'Vigas a nivel',
        order_number: 2,
        category: 'beams',
        status: 'passed',
        checked_by: 'user-1',
        checked_at: '2024-02-26T09:00:00Z',
        notes: 'Espesor 1.5cm uniforme',
        photo_url: null,
        created_at: '2024-02-20T10:00:00Z',
      },
      {
        id: 'item-8',
        checklist_id: 'checklist-2',
        description: 'Losa de entrepiso',
        order_number: 3,
        category: 'slab',
        status: 'pending',
        checked_by: null,
        checked_at: null,
        notes: null,
        photo_url: null,
        created_at: '2024-02-20T10:00:00Z',
      },
      {
        id: 'item-9',
        checklist_id: 'checklist-2',
        description: 'Uniones estructurales',
        order_number: 4,
        category: 'joints',
        status: 'pending',
        checked_by: null,
        checked_at: null,
        notes: null,
        photo_url: null,
        created_at: '2024-02-20T10:00:00Z',
      },
    ],
    completedItems: 2,
    totalItems: 4,
    completionPercentage: 50,
  },
  {
    id: 'checklist-3',
    project_id: 'project-1',
    name: 'Instalación Eléctrica',
    category: 'electrical',
    status: 'pending',
    due_date: '2024-04-01',
    completed_date: null,
    inspector: null,
    approved_by: null,
    approved_at: null,
    score: null,
    notes: null,
    photos: [],
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
    items: [
      {
        id: 'item-11',
        checklist_id: 'checklist-3',
        description: 'Cañería según planos',
        order_number: 1,
        category: 'conduit',
        status: 'pending',
        checked_by: null,
        checked_at: null,
        notes: null,
        photo_url: null,
        created_at: '2024-03-01T10:00:00Z',
      },
      {
        id: 'item-12',
        checklist_id: 'checklist-3',
        description: 'Cajas a altura correcta',
        order_number: 2,
        category: 'boxes',
        status: 'pending',
        checked_by: null,
        checked_at: null,
        notes: null,
        photo_url: null,
        created_at: '2024-03-01T10:00:00Z',
      },
      {
        id: 'item-13',
        checklist_id: 'checklist-3',
        description: 'Cableado con sección adecuada',
        order_number: 3,
        category: 'wiring',
        status: 'pending',
        checked_by: null,
        checked_at: null,
        notes: null,
        photo_url: null,
        created_at: '2024-03-01T10:00:00Z',
      },
      {
        id: 'item-14',
        checklist_id: 'checklist-3',
        description: 'Tablero principal',
        order_number: 4,
        category: 'panel',
        status: 'pending',
        checked_by: null,
        checked_at: null,
        notes: null,
        photo_url: null,
        created_at: '2024-03-01T10:00:00Z',
      },
    ],
    completedItems: 0,
    totalItems: 4,
    completionPercentage: 0,
  },
  {
    id: 'checklist-4',
    project_id: 'project-1',
    name: 'Instalación Sanitaria',
    category: 'plumbing',
    status: 'pending',
    due_date: '2024-04-15',
    completed_date: null,
    inspector: null,
    approved_by: null,
    approved_at: null,
    score: null,
    notes: null,
    photos: [],
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z',
    items: [],
    completedItems: 0,
    totalItems: 0,
    completionPercentage: 0,
  },
  {
    id: 'checklist-5',
    project_id: 'project-2',
    name: 'Inspección Final',
    category: 'final_inspection',
    status: 'pending',
    due_date: '2024-05-01',
    completed_date: null,
    inspector: null,
    approved_by: null,
    approved_at: null,
    score: null,
    notes: null,
    photos: [],
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    items: [],
    completedItems: 0,
    totalItems: 0,
    completionPercentage: 0,
  },
];

const generateId = () => crypto.randomUUID();

// Helper to recalculate completion stats
const calculateCompletion = (items: ChecklistItem[]): { completedItems: number; totalItems: number; completionPercentage: number } => {
  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'passed').length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  return { completedItems, totalItems, completionPercentage };
};

export const useQualityStore = create<QualityState>()((set, get) => ({
  checklists: DEMO_CHECKLISTS,
  selectedChecklistId: null,
  isLoading: false,
  error: null,

  fetchChecklists: async (projectId) => {
    if (!isSupabaseConfigured() || !supabase) {
      const filtered = projectId 
        ? DEMO_CHECKLISTS.filter(c => c.project_id === projectId)
        : DEMO_CHECKLISTS;
      set({ checklists: filtered });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('quality_checklists').select('*').order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data: checklistsData, error: checklistsError } = await query;
      
      if (checklistsError) throw checklistsError;
      
      // Fetch items for all checklists
      const { data: itemsData, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .order('order_number');
      
      if (itemsError) throw itemsError;
      
      const checklists = (checklistsData || []).map((checklist: QualityChecklist) => {
        const items = (itemsData || []).filter((i: ChecklistItem) => i.checklist_id === checklist.id);
        return {
          ...checklist,
          items,
          ...calculateCompletion(items)
        };
      });
      
      set({ checklists, isLoading: false });
    } catch (error) {
      console.error('Error fetching checklists:', error);
      set({ error: 'Error al cargar checklists', isLoading: false });
    }
  },

  addChecklist: async (checklistData) => {
    const newChecklist: ChecklistWithItems = {
      ...checklistData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [],
      completedItems: 0,
      totalItems: 0,
      completionPercentage: 0,
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({ checklists: [newChecklist, ...state.checklists] }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('quality_checklists')
        .insert(checklistData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ checklists: [{ ...data, items: [], completedItems: 0, totalItems: 0, completionPercentage: 0 }, ...state.checklists] }));
    } catch (error) {
      console.error('Error adding checklist:', error);
      throw error;
    }
  },

  updateChecklist: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        checklists: state.checklists.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('quality_checklists')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        checklists: state.checklists.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
      }));
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  },

  deleteChecklist: async (id) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        checklists: state.checklists.filter(c => c.id !== id),
        selectedChecklistId: state.selectedChecklistId === id ? null : state.selectedChecklistId
      }));
      return;
    }
    
    try {
      // Items are deleted via cascade
      const { error } = await supabase
        .from('quality_checklists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        checklists: state.checklists.filter(c => c.id !== id),
        selectedChecklistId: state.selectedChecklistId === id ? null : state.selectedChecklistId
      }));
    } catch (error) {
      console.error('Error deleting checklist:', error);
      throw error;
    }
  },

  addItem: async (itemData) => {
    const newItem: ChecklistItem = {
      ...itemData,
      id: generateId(),
      created_at: new Date().toISOString(),
      checked_at: null,
      checked_by: null,
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        checklists: state.checklists.map(c => {
          if (c.id === itemData.checklist_id) {
            const items = [...(c.items || []), newItem];
            return { ...c, items, ...calculateCompletion(items) };
          }
          return c;
        })
      }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(itemData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        checklists: state.checklists.map(c => {
          if (c.id === itemData.checklist_id) {
            const items = [...(c.items || []), data];
            return { ...c, items, ...calculateCompletion(items) };
          }
          return c;
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
        checklists: state.checklists.map(c => {
          const items = c.items?.map(i => i.id === id ? { ...i, ...data } : i);
          return { ...c, items, ...calculateCompletion(items || []) };
        })
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        checklists: state.checklists.map(c => {
          const items = c.items?.map(i => i.id === id ? { ...i, ...data } : i);
          return { ...c, items, ...calculateCompletion(items || []) };
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
        checklists: state.checklists.map(c => {
          const items = c.items?.filter(i => i.id !== id);
          return { ...c, items, ...calculateCompletion(items || []) };
        })
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        checklists: state.checklists.map(c => {
          const items = c.items?.filter(i => i.id !== id);
          return { ...c, items, ...calculateCompletion(items || []) };
        })
      }));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  checkItem: async (id, inspectorId, status, notes) => {
    const updateData: Partial<ChecklistItem> = {
      status,
      checked_by: inspectorId,
      checked_at: new Date().toISOString(),
      notes: notes || null,
    };
    
    await get().updateItem(id, updateData);
    
    // Check if all items are checked to update checklist status
    const checklist = get().checklists.find(c => c.items?.some(i => i.id === id));
    if (checklist) {
      const allItemsPassed = checklist.items?.every(i => i.status === 'passed' || i.status === 'na' || i.id === id && status === 'passed');
      
      if (allItemsPassed && checklist.status !== 'approved') {
        await get().updateChecklist(checklist.id, { 
          status: 'completed' as ChecklistStatus,
          completed_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });
      }
    }
  },

  selectChecklist: (id) => {
    set({ selectedChecklistId: id });
  },

  getChecklistById: (id) => {
    return get().checklists.find(c => c.id === id);
  },

  getChecklistsByProject: (projectId) => {
    return get().checklists.filter(c => c.project_id === projectId);
  },

  getChecklistsByStatus: (status) => {
    return get().checklists.filter(c => c.status === status);
  },

  getPendingChecklists: () => {
    return get().checklists.filter(c => c.status === 'pending' || c.status === 'in_progress');
  },
}));

// Helper constants - aligned with ChecklistCategory and ChecklistStatus enums
export const CHECKLIST_STATUSES: Array<{ value: ChecklistStatus; label: string; icon: string; color: string; textColor: string }> = [
  { value: 'pending', label: 'Pendiente', icon: '⏳', color: 'bg-gray-500', textColor: 'text-gray-600' },
  { value: 'in_progress', label: 'En Progreso', icon: '🔄', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { value: 'completed', label: 'Completado', icon: '✔️', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { value: 'approved', label: 'Aprobado', icon: '✅', color: 'bg-green-500', textColor: 'text-green-600' },
];

export const CHECKLIST_CATEGORIES: Array<{ value: ChecklistCategory; label: string }> = [
  { value: 'foundation', label: 'Cimientos' },
  { value: 'structure', label: 'Estructura' },
  { value: 'electrical', label: 'Eléctrica' },
  { value: 'plumbing', label: 'Sanitaria' },
  { value: 'finishing', label: 'Terminaciones' },
  { value: 'safety', label: 'Seguridad' },
  { value: 'final_inspection', label: 'Inspección Final' },
  { value: 'other', label: 'Otro' },
];

export const CHECKLIST_ITEM_STATUSES: Array<{ value: ChecklistItemStatus; label: string; icon: string; color: string }> = [
  { value: 'pending', label: 'Pendiente', icon: '⏳', color: 'bg-gray-500' },
  { value: 'passed', label: 'Aprobado', icon: '✅', color: 'bg-green-500' },
  { value: 'failed', label: 'Rechazado', icon: '❌', color: 'bg-red-500' },
  { value: 'na', label: 'N/A', icon: '➖', color: 'bg-gray-400' },
];

export const getStatusConfig = (status: ChecklistStatus) => {
  return CHECKLIST_STATUSES.find(s => s.value === status) || CHECKLIST_STATUSES[0];
};

export const getCategoryLabel = (category: ChecklistCategory): string => {
  return CHECKLIST_CATEGORIES.find(c => c.value === category)?.label || category;
};

export const getItemStatusConfig = (status: ChecklistItemStatus) => {
  return CHECKLIST_ITEM_STATUSES.find(s => s.value === status) || CHECKLIST_ITEM_STATUSES[0];
};
