/**
 * Notifications Store - Centro de notificaciones del sistema
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Notification, NotificationType } from '../../lib/database.types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'read_at'>) => Promise<void>;
  
  // Getters
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
}

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    user_id: 'user-1',
    type: 'task',
    title: 'Tarea vencida',
    message: 'La tarea "Revisar presupuesto García" venció hace 2 días',
    link: '/admin/tareas',
    read: false,
    read_at: null,
    metadata: { task_id: 'task-1' },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'user-1',
    type: 'approval',
    title: 'OC pendiente de aprobación',
    message: 'Orden de compra OC-00023 requiere tu aprobación',
    link: '/admin/compras',
    read: false,
    read_at: null,
    metadata: { po_id: 'po-1' },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: 'user-1',
    type: 'alert',
    title: 'Presupuesto excedido',
    message: 'La obra "Casa García" ha superado el presupuesto en un 5%',
    link: '/admin/obras/obra-1',
    read: false,
    read_at: null,
    metadata: { project_id: 'obra-1', deviation: 5 },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: 'user-1',
    type: 'success',
    title: 'Pago recibido',
    message: 'Se recibió el pago de $50,000 del cliente Martínez',
    link: '/admin/finanzas',
    read: true,
    read_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metadata: { payment_id: 'pay-1', amount: 50000 },
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'user-1',
    type: 'warning',
    title: 'Material próximo a agotarse',
    message: 'El stock de cemento Portland está por debajo del mínimo',
    link: '/admin/compras',
    read: true,
    read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { material: 'cemento' },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    user_id: 'user-1',
    type: 'info',
    title: 'Nuevo lead asignado',
    message: 'Se te ha asignado el lead "Roberto Pérez - Ampliación"',
    link: '/admin/pipeline',
    read: false,
    read_at: null,
    metadata: { lead_id: 'lead-5' },
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  notifications: DEMO_NOTIFICATIONS,
  unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.read).length,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      // Use demo data
      set({ 
        notifications: DEMO_NOTIFICATIONS,
        unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.read).length 
      });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      const notifications = data || [];
      set({ 
        notifications,
        unreadCount: notifications.filter((n: Notification) => !n.read).length,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ error: 'Error al cargar notificaciones', isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode
      set(state => {
        const notifications = state.notifications.map(n => 
          n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
        );
        return { 
          notifications,
          unreadCount: notifications.filter(n => !n.read).length 
        };
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => {
        const notifications = state.notifications.map(n => 
          n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
        );
        return { 
          notifications,
          unreadCount: notifications.filter(n => !n.read).length 
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode
      set(state => ({
        notifications: state.notifications.map(n => ({ 
          ...n, 
          read: true, 
          read_at: new Date().toISOString() 
        })),
        unreadCount: 0
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('read', false);
      
      if (error) throw error;
      
      set(state => ({
        notifications: state.notifications.map(n => ({ 
          ...n, 
          read: true, 
          read_at: new Date().toISOString() 
        })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  deleteNotification: async (id: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode
      set(state => {
        const notifications = state.notifications.filter(n => n.id !== id);
        return { 
          notifications,
          unreadCount: notifications.filter(n => !n.read).length 
        };
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => {
        const notifications = state.notifications.filter(n => n.id !== id);
        return { 
          notifications,
          unreadCount: notifications.filter(n => !n.read).length 
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  addNotification: async (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode
      set(state => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },

  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read);
  },

  getNotificationsByType: (type: NotificationType) => {
    return get().notifications.filter(n => n.type === type);
  },
}));

// Notification icon helper
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    task: '📋',
    approval: '✍️',
    alert: '🔔',
  };
  return icons[type] || '📬';
};

// Notification color helper
export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    task: 'bg-purple-100 text-purple-800 border-purple-200',
    approval: 'bg-orange-100 text-orange-800 border-orange-200',
    alert: 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};
