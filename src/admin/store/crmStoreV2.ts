/**
 * CRM Store V2 - Conectado a Supabase
 * Este store reemplaza los datos en memoria por consultas reales a Supabase
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Tipos de datos
export interface Nota {
  id: string;
  texto: string;
  fecha: Date;
  autor?: string;
}

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoProyecto: string;
  presupuestoEstimado?: number;
  mensaje?: string;
  origen: 'web' | 'telefono' | 'referido' | 'redes_sociales' | 'otro';
  estado: 'nuevo' | 'contactado' | 'en_negociacion' | 'convertido' | 'perdido';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  notas?: Nota[];
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  cuit?: string;
  estado: 'activo' | 'inactivo' | 'potencial';
  fechaCreacion: Date;
  notas?: Nota[];
}

export interface Obra {
  id: string;
  nombre: string;
  clienteId: string;
  direccion: string;
  tipo: string;
  presupuesto: number;
  fechaInicio: Date;
  fechaFinEstimada?: Date;
  fechaFinReal?: Date;
  descripcion?: string;
  progreso: number;
  estado: 'planificacion' | 'en_progreso' | 'pausada' | 'completada' | 'cancelada';
  imagenes?: string[];
}

export interface ItemCotizacion {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Cotizacion {
  id: string;
  numero: string;
  clienteId: string;
  titulo: string;
  descripcion?: string;
  items: ItemCotizacion[];
  total: number;
  validezDias: number;
  estado: 'borrador' | 'enviada' | 'pendiente' | 'aprobada' | 'rechazada';
  fechaCreacion: Date;
  fechaEnvio?: Date;
}

export interface Actividad {
  id: string;
  tipo: 'llamada' | 'email' | 'reunion' | 'visita' | 'nota' | 'otro';
  titulo: string;
  descripcion: string;
  fecha: Date;
  entidadTipo?: 'lead' | 'cliente' | 'obra';
  entidadId?: string;
}

interface CRMState {
  // Datos
  leads: Lead[];
  clientes: Cliente[];
  obras: Obra[];
  cotizaciones: Cotizacion[];
  actividades: Actividad[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Fetch methods
  fetchLeads: () => Promise<void>;
  fetchClientes: () => Promise<void>;
  fetchObras: () => Promise<void>;
  fetchCotizaciones: () => Promise<void>;
  
  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado'>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  
  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'fechaCreacion'>) => Promise<void>;
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  
  // Obras
  addObra: (obra: Omit<Obra, 'id' | 'progreso'>) => Promise<void>;
  updateObra: (id: string, data: Partial<Obra>) => Promise<void>;
  deleteObra: (id: string) => Promise<void>;
  
  // Cotizaciones
  addCotizacion: (cotizacion: Omit<Cotizacion, 'id' | 'numero' | 'fechaCreacion' | 'estado'>) => Promise<void>;
  updateCotizacion: (id: string, data: Partial<Cotizacion>) => Promise<void>;
  deleteCotizacion: (id: string) => Promise<void>;
  
  // Actividades
  addActividad: (actividad: Omit<Actividad, 'id' | 'fecha'>) => void;
  
  // Notas
  addNota: (entityId: string, texto: string, entityType: 'leads' | 'clientes') => void;
  
  // Utilidades
  convertLeadToCliente: (leadId: string) => Promise<string | null>;
}

const generateNumero = () => `COT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

// Mapeo de datos de Supabase a tipos locales
const mapLeadFromDB = (dbLead: any): Lead => ({
  id: dbLead.id,
  nombre: dbLead.name,
  email: dbLead.email || '',
  telefono: dbLead.phone,
  tipoProyecto: 'General',
  presupuestoEstimado: dbLead.estimated_budget || 0,
  mensaje: dbLead.notes || '',
  origen: (dbLead.source === 'web' ? 'web' : 
           dbLead.source === 'phone' ? 'telefono' : 
           dbLead.source === 'referral' ? 'referido' :
           dbLead.source === 'social_media' ? 'redes_sociales' : 'otro') as Lead['origen'],
  estado: (dbLead.status === 'new' ? 'nuevo' :
           dbLead.status === 'contacted' || dbLead.status === 'qualified' || dbLead.status === 'proposal' ? 'contactado' :
           dbLead.status === 'negotiation' ? 'en_negociacion' :
           dbLead.status === 'won' ? 'convertido' : 'perdido') as Lead['estado'],
  fechaCreacion: new Date(dbLead.created_at),
  fechaActualizacion: new Date(dbLead.updated_at),
  notas: [],
});

const mapClienteFromDB = (dbClient: any): Cliente => ({
  id: dbClient.id,
  nombre: dbClient.name,
  email: dbClient.email || '',
  telefono: dbClient.phone || '',
  direccion: dbClient.address || '',
  cuit: dbClient.tax_id || '',
  estado: 'activo',
  fechaCreacion: new Date(dbClient.created_at),
  notas: [],
});

const mapObraFromDB = (dbProject: any): Obra => ({
  id: dbProject.id,
  nombre: dbProject.name,
  clienteId: dbProject.client_id,
  direccion: dbProject.address,
  tipo: dbProject.type === 'construction' ? 'Construcción' :
        dbProject.type === 'remodeling' ? 'Reforma' :
        dbProject.type === 'maintenance' ? 'Mantenimiento' : 'Otro',
  presupuesto: parseFloat(dbProject.total_budget) || 0,
  fechaInicio: new Date(dbProject.start_date || dbProject.created_at),
  fechaFinEstimada: dbProject.estimated_end_date ? new Date(dbProject.estimated_end_date) : undefined,
  fechaFinReal: dbProject.actual_end_date ? new Date(dbProject.actual_end_date) : undefined,
  descripcion: dbProject.description || '',
  progreso: dbProject.progress_percentage || 0,
  estado: (dbProject.status === 'planning' ? 'planificacion' :
           dbProject.status === 'in_progress' ? 'en_progreso' :
           dbProject.status === 'paused' ? 'pausada' :
           dbProject.status === 'completed' ? 'completada' : 'cancelada') as Obra['estado'],
  imagenes: [],
});

const mapCotizacionFromDB = (dbQuote: any): Cotizacion => ({
  id: dbQuote.id,
  numero: dbQuote.code,
  clienteId: dbQuote.client_id || '',
  titulo: dbQuote.title,
  descripcion: dbQuote.description || '',
  items: [], // Los items vendrían de quote_items en una join
  total: parseFloat(dbQuote.total) || 0,
  validezDias: dbQuote.validity_days || 30,
  estado: (dbQuote.status === 'draft' ? 'borrador' :
           dbQuote.status === 'sent' ? 'enviada' :
           dbQuote.status === 'approved' ? 'aprobada' :
           dbQuote.status === 'rejected' ? 'rechazada' : 'pendiente') as Cotizacion['estado'],
  fechaCreacion: new Date(dbQuote.created_at),
  fechaEnvio: dbQuote.sent_at ? new Date(dbQuote.sent_at) : undefined,
});

export const useCrmStore = create<CRMState>()((set, get) => ({
  leads: [],
  clientes: [],
  obras: [],
  cotizaciones: [],
  actividades: [],
  isLoading: false,
  error: null,
  
  // Fetch Leads
  fetchLeads: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('⚠️ Supabase not configured - cannot fetch leads');
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        leads: data?.map(mapLeadFromDB) || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar leads',
        isLoading: false 
      });
    }
  },
  
  // Fetch Clientes
  fetchClientes: async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        clientes: data?.map(mapClienteFromDB) || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar clientes',
        isLoading: false 
      });
    }
  },
  
  // Fetch Obras
  fetchObras: async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        obras: data?.map(mapObraFromDB) || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar obras',
        isLoading: false 
      });
    }
  },
  
  // Fetch Cotizaciones
  fetchCotizaciones: async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ 
        cotizaciones: data?.map(mapCotizacionFromDB) || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar cotizaciones',
        isLoading: false 
      });
    }
  },
  
  // Add Lead
  addLead: async (leadData) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: leadData.nombre,
          email: leadData.email,
          phone: leadData.telefono,
          source: leadData.origen === 'web' ? 'web' :
                 leadData.origen === 'telefono' ? 'phone' :
                 leadData.origen === 'referido' ? 'referral' :
                 leadData.origen === 'redes_sociales' ? 'social_media' : 'other',
          status: 'new',
          estimated_budget: leadData.presupuestoEstimado,
          notes: leadData.mensaje,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await get().fetchLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  },
  
  // Update Lead
  updateLead: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const updateData: any = {};
      if (data.nombre) updateData.name = data.nombre;
      if (data.email) updateData.email = data.email;
      if (data.telefono) updateData.phone = data.telefono;
      if (data.presupuestoEstimado) updateData.estimated_budget = data.presupuestoEstimado;
      if (data.estado) {
        updateData.status = data.estado === 'nuevo' ? 'new' :
                            data.estado === 'contactado' ? 'contacted' :
                            data.estado === 'en_negociacion' ? 'negotiation' :
                            data.estado === 'convertido' ? 'won' : 'lost';
      }
      
      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },
  
  // Delete Lead
  deleteLead: async (id) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        leads: state.leads.filter(l => l.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },
  
  // Add Cliente
  addCliente: async (clienteData) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          name: clienteData.nombre,
          email: clienteData.email,
          phone: clienteData.telefono,
          address: clienteData.direccion,
          tax_id: clienteData.cuit,
          type: 'residential',
        });
      
      if (error) throw error;
      
      await get().fetchClientes();
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },
  
  // Update Cliente
  updateCliente: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const updateData: any = {};
      if (data.nombre) updateData.name = data.nombre;
      if (data.email) updateData.email = data.email;
      if (data.telefono) updateData.phone = data.telefono;
      if (data.direccion) updateData.address = data.direccion;
      if (data.cuit) updateData.tax_id = data.cuit;
      
      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchClientes();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },
  
  // Delete Cliente
  deleteCliente: async (id) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        clientes: state.clientes.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },
  
  // Add Obra
  addObra: async (obraData) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const code = `OBR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      const { error } = await supabase
        .from('projects')
        .insert({
          code,
          name: obraData.nombre,
          client_id: obraData.clienteId,
          client_name: 'Cliente',
          address: obraData.direccion,
          city: 'Ciudad',
          state: 'Estado',
          type: obraData.tipo.includes('Construcción') ? 'construction' :
                obraData.tipo.includes('Reforma') ? 'remodeling' :
                obraData.tipo.includes('Mantenimiento') ? 'maintenance' : 'other',
          status: 'planning',
          total_budget: obraData.presupuesto,
          start_date: obraData.fechaInicio?.toISOString().split('T')[0],
          estimated_end_date: obraData.fechaFinEstimada?.toISOString().split('T')[0],
          description: obraData.descripcion,
        });
      
      if (error) throw error;
      
      await get().fetchObras();
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },
  
  // Update Obra
  updateObra: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const updateData: any = {};
      if (data.nombre) updateData.name = data.nombre;
      if (data.presupuesto) updateData.total_budget = data.presupuesto;
      if (data.progreso !== undefined) updateData.progress_percentage = data.progreso;
      if (data.estado) {
        updateData.status = data.estado === 'planificacion' ? 'planning' :
                            data.estado === 'en_progreso' ? 'in_progress' :
                            data.estado === 'pausada' ? 'paused' :
                            data.estado === 'completada' ? 'completed' : 'cancelled';
      }
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchObras();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  // Delete Obra
  deleteObra: async (id) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        obras: state.obras.filter(o => o.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
  
  // Add Cotizacion
  addCotizacion: async (cotizacionData) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const code = generateNumero();
      
      const { error } = await supabase
        .from('quotes')
        .insert({
          code,
          title: cotizacionData.titulo,
          description: cotizacionData.descripcion,
          client_id: cotizacionData.clienteId,
          client_name: 'Cliente',
          status: 'draft',
          subtotal: cotizacionData.total,
          total: cotizacionData.total,
          validity_days: cotizacionData.validezDias,
        });
      
      if (error) throw error;
      
      await get().fetchCotizaciones();
    } catch (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
  },
  
  // Update Cotizacion
  updateCotizacion: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const updateData: any = {};
      if (data.titulo) updateData.title = data.titulo;
      if (data.descripcion) updateData.description = data.descripcion;
      if (data.total) updateData.total = data.total;
      if (data.estado) {
        updateData.status = data.estado === 'borrador' ? 'draft' :
                            data.estado === 'enviada' ? 'sent' :
                            data.estado === 'aprobada' ? 'approved' :
                            data.estado === 'rechazada' ? 'rejected' : 'sent';
      }
      
      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchCotizaciones();
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  },
  
  // Delete Cotizacion
  deleteCotizacion: async (id) => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        cotizaciones: state.cotizaciones.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  },
  
  // Add Actividad (local only por ahora)
  addActividad: (actividadData) => {
    const actividad: Actividad = {
      ...actividadData,
      id: crypto.randomUUID(),
      fecha: new Date(),
    };
    set(state => ({
      actividades: [actividad, ...state.actividades]
    }));
  },
  
  // Add Nota (local only por ahora)
  addNota: (entityId, texto, entityType) => {
    const nota: Nota = {
      id: crypto.randomUUID(),
      texto,
      fecha: new Date(),
    };
    
    set(state => ({
      [entityType]: state[entityType].map(entity =>
        entity.id === entityId
          ? { ...entity, notas: [...(entity.notas || []), nota] }
          : entity
      )
    }));
  },
  
  // Convert Lead to Cliente
  convertLeadToCliente: async (leadId) => {
    const lead = get().leads.find(l => l.id === leadId);
    if (!lead) return null;
    
    try {
      // Crear cliente
      await get().addCliente({
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono,
        estado: 'activo',
      });
      
      // Actualizar lead
      await get().updateLead(leadId, { estado: 'convertido' });
      
      return 'success';
    } catch (error) {
      console.error('Error converting lead:', error);
      return null;
    }
  },
}));
