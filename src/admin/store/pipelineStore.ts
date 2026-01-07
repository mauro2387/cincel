/**
 * Pipeline Kanban Store - Gestión del pipeline de leads con estados
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { 
  LeadEstado, 
  LeadOrigen, 
  TipoObra 
} from '../../lib/database.types';

// Pipeline stages en orden
export const PIPELINE_STAGES: { id: LeadEstado; label: string; color: string }[] = [
  { id: 'nuevo', label: 'Nuevo', color: 'bg-blue-500' },
  { id: 'contactado', label: 'Contactado', color: 'bg-sky-500' },
  { id: 'calificado', label: 'Calificado', color: 'bg-cyan-500' },
  { id: 'relevamiento_agendado', label: 'Relevamiento Agendado', color: 'bg-teal-500' },
  { id: 'relevamiento_realizado', label: 'Relevamiento Realizado', color: 'bg-green-500' },
  { id: 'presupuesto_armado', label: 'Presupuesto en Armado', color: 'bg-lime-500' },
  { id: 'presupuesto_enviado', label: 'Presupuesto Enviado', color: 'bg-yellow-500' },
  { id: 'negociacion', label: 'Negociación', color: 'bg-amber-500' },
  { id: 'aprobado', label: 'Aprobado', color: 'bg-orange-500' },
  { id: 'en_obra', label: 'En Obra', color: 'bg-emerald-600' },
  { id: 'finalizado', label: 'Finalizado', color: 'bg-green-700' },
  { id: 'perdido', label: 'Perdido', color: 'bg-red-500' },
];

// Lead local para demo
export interface LocalLead {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  zona: string | null;
  direccion: string | null;
  origen: LeadOrigen;
  tipo_obra: TipoObra | null;
  presupuesto_estimado: number | null;
  urgencia: string | null;
  estado: LeadEstado;
  responsable_id: string | null;
  motivo_perdida: string | null;
  tags: string[];
  notas_internas: string | null;
  ultima_interaccion: string | null;
  created_at: string;
  updated_at: string;
}

interface PipelineState {
  leads: LocalLead[];
  isLoading: boolean;
  error: string | null;
  selectedLeadId: string | null;
  
  // Actions
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<LocalLead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (id: string, data: Partial<LocalLead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  moveLead: (id: string, newEstado: LeadEstado) => Promise<void>;
  selectLead: (id: string | null) => void;
  
  // Utilities
  getLeadsByEstado: (estado: LeadEstado) => LocalLead[];
}

const generateId = () => crypto.randomUUID();

// Datos demo iniciales
const DEMO_LEADS: LocalLead[] = [
  {
    id: '1',
    nombre: 'María González',
    telefono: '+598 99 123 456',
    email: 'maria@email.com',
    zona: 'Carrasco',
    direccion: 'Av. Bolivia 1234',
    origen: 'instagram',
    tipo_obra: 'reforma',
    presupuesto_estimado: 35000,
    urgencia: 'media',
    estado: 'nuevo',
    responsable_id: null,
    motivo_perdida: null,
    tags: ['instagram', 'cocina'],
    notas_internas: 'Consulta por reforma de cocina',
    ultima_interaccion: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Juan Rodríguez',
    telefono: '+598 91 987 654',
    email: 'juan.rodriguez@gmail.com',
    zona: 'Pocitos',
    direccion: 'Calle 21 de Setiembre 567',
    origen: 'whatsapp',
    tipo_obra: 'ampliacion',
    presupuesto_estimado: 80000,
    urgencia: 'alta',
    estado: 'contactado',
    responsable_id: null,
    motivo_perdida: null,
    tags: ['ampliación', 'urgente'],
    notas_internas: 'Quiere ampliar un piso arriba',
    ultima_interaccion: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    nombre: 'Pedro Martínez',
    telefono: '+598 98 555 333',
    email: 'pmartinez@empresa.com.uy',
    zona: 'Punta Carretas',
    direccion: 'Rambla Rep. del Perú 1500',
    origen: 'web',
    tipo_obra: 'obra_nueva',
    presupuesto_estimado: 250000,
    urgencia: 'baja',
    estado: 'calificado',
    responsable_id: null,
    motivo_perdida: null,
    tags: ['casa nueva', 'terreno propio'],
    notas_internas: 'Tiene terreno, quiere construir casa de 180m2',
    ultima_interaccion: new Date(Date.now() - 259200000).toISOString(),
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '4',
    nombre: 'Ana López',
    telefono: '+598 94 777 888',
    email: 'ana.lopez@hotmail.com',
    zona: 'Malvín',
    direccion: 'Av. Italia 4567',
    origen: 'referido',
    tipo_obra: 'reforma',
    presupuesto_estimado: 45000,
    urgencia: 'media',
    estado: 'relevamiento_agendado',
    responsable_id: null,
    motivo_perdida: null,
    tags: ['baño', 'referido cliente'],
    notas_internas: 'Referida por cliente González. Visita agendada para martes',
    ultima_interaccion: new Date(Date.now() - 43200000).toISOString(),
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '5',
    nombre: 'Carlos Fernández',
    telefono: '+598 99 444 222',
    email: 'carlos.f@gmail.com',
    zona: 'Cordón',
    direccion: 'Guayaquí 3210',
    origen: 'facebook',
    tipo_obra: 'mantenimiento',
    presupuesto_estimado: 15000,
    urgencia: 'alta',
    estado: 'presupuesto_enviado',
    responsable_id: null,
    motivo_perdida: null,
    tags: ['mantenimiento', 'humedad'],
    notas_internas: 'Problema de humedad. Presupuesto enviado, esperando respuesta',
    ultima_interaccion: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 864000000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '6',
    nombre: 'Laura Sánchez',
    telefono: '+598 91 333 111',
    email: 'laura.sanchez@empresa.com',
    zona: 'Ciudad Vieja',
    direccion: 'Sarandí 450',
    origen: 'google',
    tipo_obra: 'comercial',
    presupuesto_estimado: 120000,
    urgencia: 'media',
    estado: 'negociacion',
    responsable_id: null,
    motivo_perdida: null,
    tags: ['local comercial', 'oficina'],
    notas_internas: 'Refacción de local comercial. En negociación de precio',
    ultima_interaccion: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 1209600000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      // Inicializar vacío si Supabase está configurado, sino usar datos demo
      leads: (isSupabaseConfigured() && supabase) ? [] : DEMO_LEADS,
      isLoading: false,
      error: null,
      selectedLeadId: null,
      
      fetchLeads: async () => {
        if (!isSupabaseConfigured() || !supabase) {
          // En modo demo, los leads ya están cargados
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ leads: data as LocalLead[], isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al cargar leads',
            isLoading: false 
          });
        }
      },
      
      addLead: async (leadData) => {
        const now = new Date().toISOString();
        const newLead: LocalLead = {
          ...leadData,
          id: generateId(),
          created_at: now,
          updated_at: now,
        };
        
        if (isSupabaseConfigured() && supabase) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
              .from('leads')
              .insert([{
                nombre: newLead.nombre,
                telefono: newLead.telefono,
                email: newLead.email,
                zona: newLead.zona,
                direccion: newLead.direccion,
                origen: newLead.origen,
                tipo_obra: newLead.tipo_obra,
                presupuesto_estimado: newLead.presupuesto_estimado,
                urgencia: newLead.urgencia,
                estado: newLead.estado,
                responsable_id: newLead.responsable_id,
                tags: newLead.tags,
                notas_internas: newLead.notas_internas,
              }])
              .select()
              .single();
            
            if (error) throw error;
            
            set((state) => ({
              leads: [data as LocalLead, ...state.leads],
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Error al crear lead' });
          }
        } else {
          // Modo demo
          set((state) => ({
            leads: [newLead, ...state.leads],
          }));
        }
      },
      
      updateLead: async (id, data) => {
        const now = new Date().toISOString();
        
        if (isSupabaseConfigured() && supabase) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
              .from('leads')
              .update({ ...data, updated_at: now })
              .eq('id', id);
            
            if (error) throw error;
            
            set((state) => ({
              leads: state.leads.map((lead) =>
                lead.id === id ? { ...lead, ...data, updated_at: now } : lead
              ),
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Error al actualizar lead' });
          }
        } else {
          // Modo demo
          set((state) => ({
            leads: state.leads.map((lead) =>
              lead.id === id ? { ...lead, ...data, updated_at: now } : lead
            ),
          }));
        }
      },
      
      deleteLead: async (id) => {
        if (isSupabaseConfigured() && supabase) {
          try {
            const { error } = await supabase
              .from('leads')
              .delete()
              .eq('id', id);
            
            if (error) throw error;
            
            set((state) => ({
              leads: state.leads.filter((lead) => lead.id !== id),
              selectedLeadId: state.selectedLeadId === id ? null : state.selectedLeadId,
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Error al eliminar lead' });
          }
        } else {
          // Modo demo
          set((state) => ({
            leads: state.leads.filter((lead) => lead.id !== id),
            selectedLeadId: state.selectedLeadId === id ? null : state.selectedLeadId,
          }));
        }
      },
      
      moveLead: async (id, newEstado) => {
        await get().updateLead(id, { 
          estado: newEstado,
          ultima_interaccion: new Date().toISOString(),
        });
      },
      
      selectLead: (id) => {
        set({ selectedLeadId: id });
      },
      
      getLeadsByEstado: (estado) => {
        return get().leads.filter((lead) => lead.estado === estado);
      },
    }),
    {
      name: 'cincel-pipeline',
    }
  )
);
