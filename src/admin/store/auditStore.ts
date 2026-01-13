/**
 * Audit Store - Registro de auditoría simplificado
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  totalCount: number;
  fetchLogs: (page?: number, limit?: number) => Promise<void>;
  fetchRecordHistory: (tableName: string, recordId: string) => Promise<void>;
}

export const useAuditStore = create<AuditState>()((set) => ({
  logs: [],
  isLoading: false,
  totalCount: 0,

  fetchLogs: async (page = 1, limit = 50) => {
    if (!isSupabaseConfigured() || !supabase) return;
    set({ isLoading: true });
    const start = (page - 1) * limit;
    const { data, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);
    set({ logs: data || [], totalCount: count || 0, isLoading: false });
  },

  fetchRecordHistory: async (tableName: string, recordId: string) => {
    if (!isSupabaseConfigured() || !supabase) return;
    set({ isLoading: true });
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });
    set({ logs: data || [], isLoading: false });
  }
}));
