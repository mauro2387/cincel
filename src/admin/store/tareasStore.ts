/**
 * Tareas Store - Sistema de Tareas y Recordatorios
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured } from '../../lib/supabase';

export type TareaEstado = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
export type TareaPrioridad = 'baja' | 'media' | 'alta' | 'urgente';
export type TareaTipo = 'llamada' | 'reunion' | 'visita' | 'seguimiento' | 'cotizacion' | 'otro';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TareaTipo;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  
  // Relaciones
  asignado_a?: string;
  lead_id?: string;
  cliente_id?: string;
  obra_id?: string;
  
  // Fechas
  fecha_vencimiento?: string;
  fecha_recordatorio?: string;
  fecha_completada?: string;
  
  // Metadata
  etiquetas: string[];
  notas?: string;
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Recordatorio {
  id: string;
  tarea_id: string;
  fecha: string;
  notificado: boolean;
  tipo: 'email' | 'push' | 'ambos';
}

interface TareasState {
  tareas: Tarea[];
  recordatorios: Recordatorio[];
  filtroEstado: TareaEstado | 'todas';
  filtroPrioridad: TareaPrioridad | 'todas';
  filtroAsignado: string | 'todos';
  
  // CRUD
  addTarea: (tarea: Omit<Tarea, 'id' | 'created_at' | 'updated_at'>) => string;
  updateTarea: (id: string, updates: Partial<Tarea>) => void;
  deleteTarea: (id: string) => void;
  completarTarea: (id: string) => void;
  
  // Recordatorios
  addRecordatorio: (recordatorio: Omit<Recordatorio, 'id'>) => void;
  marcarNotificado: (id: string) => void;
  
  // Filtros
  setFiltroEstado: (estado: TareaEstado | 'todas') => void;
  setFiltroPrioridad: (prioridad: TareaPrioridad | 'todas') => void;
  setFiltroAsignado: (asignado: string | 'todos') => void;
  
  // Getters
  getTareasFiltradas: () => Tarea[];
  getTareasHoy: () => Tarea[];
  getTareasVencidas: () => Tarea[];
  getTareasPorLead: (leadId: string) => Tarea[];
  getTareasPorCliente: (clienteId: string) => Tarea[];
  getTareasPorObra: (obraId: string) => Tarea[];
  getRecordatoriosPendientes: () => Recordatorio[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const demoTareas: Tarea[] = [
  {
    id: 'task-1',
    titulo: 'Llamar a María González',
    descripcion: 'Seguimiento de cotización de remodelación de cocina',
    tipo: 'llamada',
    estado: 'pendiente',
    prioridad: 'alta',
    asignado_a: 'Roberto',
    lead_id: 'lead-1',
    fecha_vencimiento: '2026-01-06T17:00:00Z',
    etiquetas: ['seguimiento', 'cotización'],
    created_by: 'admin',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'task-2',
    titulo: 'Visita técnica - Bodega Industrial',
    descripcion: 'Revisión de avance de estructura metálica',
    tipo: 'visita',
    estado: 'en_progreso',
    prioridad: 'media',
    asignado_a: 'Miguel',
    obra_id: 'obra-2',
    fecha_vencimiento: '2026-01-07T10:00:00Z',
    etiquetas: ['obra', 'supervisión'],
    created_by: 'admin',
    created_at: '2026-01-04T14:00:00Z',
    updated_at: '2026-01-06T08:00:00Z',
  },
  {
    id: 'task-3',
    titulo: 'Preparar cotización ampliación',
    descripcion: 'Cotización para Despacho Martínez - 200m² oficinas',
    tipo: 'cotizacion',
    estado: 'pendiente',
    prioridad: 'urgente',
    asignado_a: 'Ana',
    lead_id: 'lead-3',
    fecha_vencimiento: '2026-01-07T12:00:00Z',
    etiquetas: ['cotización', 'comercial'],
    created_by: 'admin',
    created_at: '2026-01-05T16:00:00Z',
    updated_at: '2026-01-05T16:00:00Z',
  },
  {
    id: 'task-4',
    titulo: 'Reunión con proveedor de acero',
    descripcion: 'Negociar precios para próximo proyecto',
    tipo: 'reunion',
    estado: 'pendiente',
    prioridad: 'media',
    asignado_a: 'Roberto',
    fecha_vencimiento: '2026-01-08T11:00:00Z',
    etiquetas: ['proveedores', 'compras'],
    created_by: 'admin',
    created_at: '2026-01-03T10:00:00Z',
    updated_at: '2026-01-03T10:00:00Z',
  },
  {
    id: 'task-5',
    titulo: 'Seguimiento Instagram - Carlos Mendez',
    descripcion: 'Responder mensaje de Instagram sobre remodelación',
    tipo: 'seguimiento',
    estado: 'pendiente',
    prioridad: 'alta',
    asignado_a: 'Roberto',
    lead_id: 'lead-new-1',
    fecha_vencimiento: '2026-01-06T18:00:00Z',
    etiquetas: ['redes sociales', 'lead nuevo'],
    created_by: 'admin',
    created_at: '2026-01-06T15:50:00Z',
    updated_at: '2026-01-06T15:50:00Z',
  },
  {
    id: 'task-6',
    titulo: 'Enviar factura - Obra García',
    descripcion: 'Factura por avance del 40% de la obra',
    tipo: 'otro',
    estado: 'completada',
    prioridad: 'alta',
    asignado_a: 'Ana',
    obra_id: 'obra-1',
    cliente_id: 'cliente-1',
    fecha_vencimiento: '2026-01-05T18:00:00Z',
    fecha_completada: '2026-01-05T17:30:00Z',
    etiquetas: ['facturación', 'cobranza'],
    created_by: 'admin',
    created_at: '2026-01-04T10:00:00Z',
    updated_at: '2026-01-05T17:30:00Z',
  },
];

export const useTareasStore = create<TareasState>()(
  persist(
    (set, get) => ({
      tareas: isSupabaseConfigured() ? [] : demoTareas,
      recordatorios: [],
      filtroEstado: 'todas',
      filtroPrioridad: 'todas',
      filtroAsignado: 'todos',

      addTarea: (tarea) => {
        const id = generateId();
        set((state) => ({
          tareas: [
            {
              ...tarea,
              id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...state.tareas,
          ],
        }));
        return id;
      },

      updateTarea: (id, updates) =>
        set((state) => ({
          tareas: state.tareas.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
          ),
        })),

      deleteTarea: (id) =>
        set((state) => ({
          tareas: state.tareas.filter((t) => t.id !== id),
          recordatorios: state.recordatorios.filter((r) => r.tarea_id !== id),
        })),

      completarTarea: (id) =>
        set((state) => ({
          tareas: state.tareas.map((t) =>
            t.id === id
              ? {
                  ...t,
                  estado: 'completada',
                  fecha_completada: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : t
          ),
        })),

      addRecordatorio: (recordatorio) =>
        set((state) => ({
          recordatorios: [...state.recordatorios, { ...recordatorio, id: generateId() }],
        })),

      marcarNotificado: (id) =>
        set((state) => ({
          recordatorios: state.recordatorios.map((r) =>
            r.id === id ? { ...r, notificado: true } : r
          ),
        })),

      setFiltroEstado: (estado) => set({ filtroEstado: estado }),
      setFiltroPrioridad: (prioridad) => set({ filtroPrioridad: prioridad }),
      setFiltroAsignado: (asignado) => set({ filtroAsignado: asignado }),

      getTareasFiltradas: () => {
        const { tareas, filtroEstado, filtroPrioridad, filtroAsignado } = get();
        
        return tareas
          .filter((t) => {
            if (filtroEstado !== 'todas' && t.estado !== filtroEstado) return false;
            if (filtroPrioridad !== 'todas' && t.prioridad !== filtroPrioridad) return false;
            if (filtroAsignado !== 'todos' && t.asignado_a !== filtroAsignado) return false;
            return true;
          })
          .sort((a, b) => {
            // Ordenar por prioridad, luego por fecha
            const prioridadOrder = { urgente: 0, alta: 1, media: 2, baja: 3 };
            const prioDiff = prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
            if (prioDiff !== 0) return prioDiff;
            
            if (a.fecha_vencimiento && b.fecha_vencimiento) {
              return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime();
            }
            return 0;
          });
      },

      getTareasHoy: () => {
        const tareas = get().tareas;
        const hoy = new Date().toISOString().split('T')[0];
        
        return tareas.filter(
          (t) =>
            t.estado !== 'completada' &&
            t.estado !== 'cancelada' &&
            t.fecha_vencimiento?.startsWith(hoy)
        );
      },

      getTareasVencidas: () => {
        const tareas = get().tareas;
        const ahora = new Date();
        
        return tareas.filter(
          (t) =>
            t.estado !== 'completada' &&
            t.estado !== 'cancelada' &&
            t.fecha_vencimiento &&
            new Date(t.fecha_vencimiento) < ahora
        );
      },

      getTareasPorLead: (leadId) => get().tareas.filter((t) => t.lead_id === leadId),
      getTareasPorCliente: (clienteId) => get().tareas.filter((t) => t.cliente_id === clienteId),
      getTareasPorObra: (obraId) => get().tareas.filter((t) => t.obra_id === obraId),

      getRecordatoriosPendientes: () =>
        get().recordatorios.filter((r) => !r.notificado && new Date(r.fecha) <= new Date()),
    }),
    {
      name: 'cincel-tareas-storage',
    }
  )
);
