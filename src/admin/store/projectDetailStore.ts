/**
 * Project Detail Store - Gestión de detalles de obra
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Types
export interface ProjectLog {
  id: string;
  project_id: string;
  date: string;
  title: string;
  description: string;
  type: 'progress' | 'issue' | 'decision' | 'change' | 'visit' | 'other';
  author: string;
  created_at: string;
}

export interface ProjectPhoto {
  id: string;
  project_id: string;
  url: string;
  description: string | null;
  date: string;
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responsible: string | null;
  due_date: string | null;
  created_at: string;
}

export interface ProjectCost {
  id: string;
  project_id: string;
  concept: string;
  category: 'material' | 'labor' | 'equipment' | 'subcontract' | 'other';
  amount: number;
  date: string;
  supplier: string | null;
  invoice: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkLog {
  id: string;
  project_id: string;
  date: string;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'cold' | 'hot';
  summary: string;
  progress_description: string | null;
  issues: string | null;
  next_day_plan: string | null;
  supervisor: string;
  approved: boolean;
  photos: string[];
  created_at: string;
}

export interface ProjectFinancials {
  totalBudget: number;
  currentCost: number;
  remainingBudget: number;
  costPercentage: number;
  isOverBudget: boolean;
  costsByCategory: Array<{ category: string; amount: number; percentage: number }>;
  projectedFinalCost: number;
  marginPercentage: number;
  budgetDeviation: number;
}

interface ProjectDetailState {
  logs: ProjectLog[];
  photos: ProjectPhoto[];
  tasks: ProjectTask[];
  costs: ProjectCost[];
  workLogs: WorkLog[];
  financials: ProjectFinancials | null;
  isLoading: boolean;
  error: string | null;

  // Logs
  fetchLogs: (projectId: string) => Promise<void>;
  addLog: (log: Omit<ProjectLog, 'id' | 'created_at'>) => Promise<void>;

  // Photos
  fetchPhotos: (projectId: string) => Promise<void>;
  addPhoto: (photo: Omit<ProjectPhoto, 'id' | 'created_at'>) => Promise<void>;

  // Tasks
  fetchTasks: (projectId: string) => Promise<void>;
  addTask: (task: Omit<ProjectTask, 'id' | 'created_at'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: ProjectTask['status']) => Promise<void>;

  // Costs
  fetchCosts: (projectId: string) => Promise<void>;
  addCost: (cost: Omit<ProjectCost, 'id' | 'created_at'>) => Promise<void>;

  // Work Logs
  fetchWorkLogs: (projectId: string) => Promise<void>;
  addWorkLog: (workLog: Omit<WorkLog, 'id' | 'created_at'>) => Promise<void>;

  // Financials
  calculateFinancials: (totalBudget: number) => void;

  // Utilities
  loadAllProjectData: (projectId: string, totalBudget: number) => Promise<void>;
  clearProjectData: () => void;
}

export const useProjectDetailStore = create<ProjectDetailState>()((set, get) => ({
  logs: [],
  photos: [],
  tasks: [],
  costs: [],
  workLogs: [],
  financials: null,
  isLoading: false,
  error: null,

  fetchLogs: async (projectId: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data } = await supabase
        .from('project_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      set({ logs: data || [] });
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  },

  addLog: async (log) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data, error } = await supabase
      .from('project_logs')
      .insert(log)
      .select()
      .single();
    if (!error && data) {
      set(state => ({ logs: [data, ...state.logs] }));
    }
  },

  fetchPhotos: async (projectId: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data } = await supabase
        .from('project_photos')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      set({ photos: data || [] });
    } catch (e) {
      console.error('Error fetching photos:', e);
    }
  },

  addPhoto: async (photo) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data, error } = await supabase
      .from('project_photos')
      .insert(photo)
      .select()
      .single();
    if (!error && data) {
      set(state => ({ photos: [data, ...state.photos] }));
    }
  },

  fetchTasks: async (projectId: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
      set({ tasks: data || [] });
    } catch (e) {
      console.error('Error fetching tasks:', e);
    }
  },

  addTask: async (task) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data, error } = await supabase
      .from('project_tasks')
      .insert(task)
      .select()
      .single();
    if (!error && data) {
      set(state => ({ tasks: [...state.tasks, data] }));
    }
  },

  updateTaskStatus: async (taskId: string, status: ProjectTask['status']) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { error } = await supabase
      .from('project_tasks')
      .update({ status })
      .eq('id', taskId);
    if (!error) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
      }));
    }
  },

  fetchCosts: async (projectId: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data } = await supabase
        .from('project_costs')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      set({ costs: data || [] });
    } catch (e) {
      console.error('Error fetching costs:', e);
    }
  },

  addCost: async (cost) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data, error } = await supabase
      .from('project_costs')
      .insert(cost)
      .select()
      .single();
    if (!error && data) {
      set(state => ({ costs: [data, ...state.costs] }));
      get().calculateFinancials(get().financials?.totalBudget || 0);
    }
  },

  fetchWorkLogs: async (projectId: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    try {
      const { data } = await supabase
        .from('work_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      set({ workLogs: data || [] });
    } catch (e) {
      console.error('Error fetching work logs:', e);
    }
  },

  addWorkLog: async (workLog) => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data, error } = await supabase
      .from('work_logs')
      .insert(workLog)
      .select()
      .single();
    if (!error && data) {
      set(state => ({ workLogs: [data, ...state.workLogs] }));
    }
  },

  calculateFinancials: (totalBudget: number) => {
    const { costs } = get();
    const currentCost = costs.reduce((sum, c) => sum + Number(c.amount), 0);
    const remainingBudget = totalBudget - currentCost;
    const costPercentage = totalBudget > 0 ? (currentCost / totalBudget) * 100 : 0;

    const costsByCategory = ['material', 'labor', 'equipment', 'subcontract', 'other'].map(cat => {
      const amount = costs.filter(c => c.category === cat).reduce((sum, c) => sum + Number(c.amount), 0);
      return { category: cat, amount, percentage: currentCost > 0 ? (amount / currentCost) * 100 : 0 };
    }).filter(c => c.amount > 0);

    set({
      financials: {
        totalBudget,
        currentCost,
        remainingBudget,
        costPercentage,
        isOverBudget: currentCost > totalBudget,
        costsByCategory,
        projectedFinalCost: currentCost,
        marginPercentage: totalBudget > 0 ? ((totalBudget - currentCost) / totalBudget) * 100 : 0,
        budgetDeviation: totalBudget > 0 ? ((currentCost - totalBudget) / totalBudget) * 100 : 0
      }
    });
  },

  loadAllProjectData: async (projectId: string, totalBudget: number) => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchLogs(projectId),
      get().fetchPhotos(projectId),
      get().fetchTasks(projectId),
      get().fetchCosts(projectId),
      get().fetchWorkLogs(projectId)
    ]);
    get().calculateFinancials(totalBudget);
    set({ isLoading: false });
  },

  clearProjectData: () => {
    set({
      logs: [],
      photos: [],
      tasks: [],
      costs: [],
      workLogs: [],
      financials: null,
      isLoading: false,
      error: null
    });
  }
}));
