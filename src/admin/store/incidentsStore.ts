/**
 * Incidents Store - Gestión de Incidentes y Accidentes
 * Alineado con database.types.ts (setup_cos_completo.sql)
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '../../lib/database.types';

interface IncidentsState {
  incidents: Incident[];
  selectedIncidentId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    projectId?: string;
    type?: IncidentType;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    dateFrom?: string;
    dateTo?: string;
  };
  
  // CRUD
  fetchIncidents: (projectId?: string) => Promise<void>;
  addIncident: (incident: Omit<Incident, 'id' | 'code' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateIncident: (id: string, data: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  resolveIncident: (id: string, resolvedBy: string) => Promise<void>;
  
  // Selection & Filters
  selectIncident: (id: string | null) => void;
  setFilters: (filters: Partial<IncidentsState['filters']>) => void;
  clearFilters: () => void;
  
  // Getters
  getIncidentById: (id: string) => Incident | undefined;
  getFilteredIncidents: () => Incident[];
  getIncidentsByProject: (projectId: string) => Incident[];
  getOpenIncidents: () => Incident[];
  getCriticalIncidents: () => Incident[];
  getStats: () => { total: number; open: number; critical: number; thisMonth: number };
}

// Demo data - aligned with database.types.ts Incident interface
const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'incident-1',
    code: 'INC-2024-001',
    project_id: 'project-1',
    type: 'safety',
    severity: 'moderate',
    title: 'Caída de material desde andamio',
    description: 'Durante el traslado de ladrillos, cayeron varios desde el tercer nivel del andamio. No hubo personas debajo en el momento.',
    location: 'Sector A - Andamio nivel 3',
    date_occurred: '2024-01-15T09:15:00Z',
    date_reported: '2024-01-15T09:30:00Z',
    reported_by: 'Carlos González',
    witnesses: 'Carlos Pérez, Juan Rodríguez',
    immediate_actions: 'Se acordonó la zona, se revisó el andamio y se reforzó la baranda.',
    root_cause: 'Falta de red de contención en el andamio',
    corrective_actions: 'Instalación de red de seguridad en todos los andamios. Capacitación al personal sobre manejo de materiales en altura.',
    preventive_actions: 'Incluir verificación de redes en checklist diario. Actualizar protocolo de carga en andamios.',
    cost_impact: 5000,
    time_impact_days: 1,
    status: 'closed',
    resolved_at: '2024-01-22T16:00:00Z',
    resolved_by: 'admin-1',
    photos: [],
    attachments: [],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-22T16:00:00Z',
  },
  {
    id: 'incident-2',
    code: 'INC-2024-002',
    project_id: 'project-1',
    type: 'safety',
    severity: 'minor',
    title: 'Corte menor en mano',
    description: 'Trabajador sufrió corte menor en la mano izquierda al manipular chapa sin guantes.',
    location: 'Taller de corte',
    date_occurred: '2024-02-03T10:45:00Z',
    date_reported: '2024-02-03T11:00:00Z',
    reported_by: 'Mario López',
    witnesses: 'Mario López',
    immediate_actions: 'Primeros auxilios in situ. El trabajador continuó sus labores.',
    root_cause: 'No uso de EPP adecuado (guantes)',
    corrective_actions: 'Entrega de nuevos guantes al trabajador. Charla de seguridad.',
    preventive_actions: 'Refuerzo de control de uso de EPP. Señalización adicional.',
    cost_impact: 500,
    time_impact_days: 0,
    status: 'closed',
    resolved_at: '2024-02-05T09:00:00Z',
    resolved_by: 'admin-1',
    photos: [],
    attachments: [],
    created_at: '2024-02-03T11:00:00Z',
    updated_at: '2024-02-05T09:00:00Z',
  },
  {
    id: 'incident-3',
    code: 'INC-2024-003',
    project_id: 'project-1',
    type: 'damage',
    severity: 'moderate',
    title: 'Falla en sistema eléctrico temporal',
    description: 'Cortocircuito en tablero temporal de obra. Se activaron las protecciones correctamente.',
    location: 'Tablero eléctrico provisional - Sector B',
    date_occurred: '2024-03-10T13:45:00Z',
    date_reported: '2024-03-10T14:00:00Z',
    reported_by: 'Juan Pérez',
    witnesses: null,
    immediate_actions: 'Corte de energía. Llamado a electricista.',
    root_cause: 'Sobrecarga por conexión de equipos no autorizados',
    corrective_actions: 'Reparación del tablero. Revisión de todas las conexiones.',
    preventive_actions: null,
    cost_impact: 15000,
    time_impact_days: 2,
    status: 'investigating',
    resolved_at: null,
    resolved_by: null,
    photos: [],
    attachments: [],
    created_at: '2024-03-10T14:00:00Z',
    updated_at: '2024-03-11T09:00:00Z',
  },
  {
    id: 'incident-4',
    code: 'INC-2024-004',
    project_id: 'project-2',
    type: 'damage',
    severity: 'major',
    title: 'Daño a propiedad vecina',
    description: 'Proyección de piedras durante demolición dañó ventana de casa lindera.',
    location: 'Medianera norte',
    date_occurred: '2024-03-15T09:30:00Z',
    date_reported: '2024-03-15T10:00:00Z',
    reported_by: 'Carlos González',
    witnesses: 'Propietario vecino',
    immediate_actions: 'Se detuvo la demolición. Contacto con vecino para disculpas y coordinación.',
    root_cause: 'Falta de protección adecuada durante demolición',
    corrective_actions: null,
    preventive_actions: null,
    cost_impact: 25000,
    time_impact_days: 3,
    status: 'reported',
    resolved_at: null,
    resolved_by: null,
    photos: [],
    attachments: [],
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'incident-5',
    code: 'INC-2024-005',
    project_id: 'project-1',
    type: 'theft',
    severity: 'moderate',
    title: 'Intento de robo frustrado',
    description: 'Se detectaron signos de intento de ingreso no autorizado durante la noche. No se reportan faltantes.',
    location: 'Acceso principal obra',
    date_occurred: '2024-03-19T23:00:00Z',
    date_reported: '2024-03-20T07:00:00Z',
    reported_by: 'Guardia nocturno',
    witnesses: null,
    immediate_actions: 'Verificación de inventario. Reporte a policía.',
    root_cause: 'Iluminación insuficiente en perímetro',
    corrective_actions: 'Instalación de iluminación adicional. Contratación de sereno nocturno.',
    preventive_actions: 'Mejora de cerco perimetral. Instalación de cámaras.',
    cost_impact: 45000,
    time_impact_days: 0,
    status: 'resolved',
    resolved_at: '2024-03-25T17:00:00Z',
    resolved_by: 'admin-1',
    photos: [],
    attachments: [],
    created_at: '2024-03-20T07:00:00Z',
    updated_at: '2024-03-25T17:00:00Z',
  },
  {
    id: 'incident-6',
    code: 'INC-2024-006',
    project_id: 'project-1',
    type: 'quality',
    severity: 'minor',
    title: 'Hormigón con fisuras superficiales',
    description: 'Se detectaron fisuras superficiales en losa de planta baja, sector cocina.',
    location: 'Planta baja - Sector cocina',
    date_occurred: '2024-03-22T10:00:00Z',
    date_reported: '2024-03-22T11:00:00Z',
    reported_by: 'Inspector de calidad',
    witnesses: 'Encargado de obra',
    immediate_actions: 'Documentación fotográfica. Análisis de causa.',
    root_cause: 'Curado insuficiente del hormigón',
    corrective_actions: 'Tratamiento con sellador. Monitoreo de evolución.',
    preventive_actions: 'Reforzar protocolo de curado.',
    cost_impact: 8000,
    time_impact_days: 1,
    status: 'resolved',
    resolved_at: '2024-03-28T15:00:00Z',
    resolved_by: 'admin-1',
    photos: [],
    attachments: [],
    created_at: '2024-03-22T11:00:00Z',
    updated_at: '2024-03-28T15:00:00Z',
  },
  {
    id: 'incident-7',
    code: 'INC-2024-007',
    project_id: 'project-1',
    type: 'environmental',
    severity: 'minor',
    title: 'Derrame de combustible menor',
    description: 'Derrame de 2 litros de combustible de generador en zona de acopio.',
    location: 'Zona de acopio - Sector sur',
    date_occurred: '2024-04-01T14:00:00Z',
    date_reported: '2024-04-01T14:15:00Z',
    reported_by: 'Operador de equipos',
    witnesses: null,
    immediate_actions: 'Contención con arena. Limpieza inmediata.',
    root_cause: 'Manguera de carga deteriorada',
    corrective_actions: 'Reemplazo de manguera.',
    preventive_actions: 'Inspección semanal de equipos de carga.',
    cost_impact: 2000,
    time_impact_days: 0,
    status: 'closed',
    resolved_at: '2024-04-01T16:00:00Z',
    resolved_by: 'admin-1',
    photos: [],
    attachments: [],
    created_at: '2024-04-01T14:15:00Z',
    updated_at: '2024-04-01T16:00:00Z',
  },
  {
    id: 'incident-8',
    code: 'INC-2024-008',
    project_id: 'project-2',
    type: 'delay',
    severity: 'major',
    title: 'Retraso por falta de materiales',
    description: 'Proveedor no entregó hierro a tiempo, paralizando armado de estructura.',
    location: 'General',
    date_occurred: '2024-04-05T08:00:00Z',
    date_reported: '2024-04-05T08:30:00Z',
    reported_by: 'Jefe de obra',
    witnesses: null,
    immediate_actions: 'Contacto urgente con proveedor. Búsqueda de alternativas.',
    root_cause: 'Falta de seguimiento de órdenes de compra',
    corrective_actions: 'Compra de emergencia a otro proveedor.',
    preventive_actions: 'Implementar sistema de alertas de entregas.',
    cost_impact: 50000,
    time_impact_days: 5,
    status: 'investigating',
    resolved_at: null,
    resolved_by: null,
    photos: [],
    attachments: [],
    created_at: '2024-04-05T08:30:00Z',
    updated_at: '2024-04-06T10:00:00Z',
  },
];

const generateId = () => crypto.randomUUID();
const generateIncidentCode = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `INC-${year}-${num}`;
};

export const useIncidentsStore = create<IncidentsState>()((set, get) => ({
  incidents: DEMO_INCIDENTS,
  selectedIncidentId: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchIncidents: async (projectId) => {
    if (!isSupabaseConfigured() || !supabase) {
      const filtered = projectId 
        ? DEMO_INCIDENTS.filter(i => i.project_id === projectId)
        : DEMO_INCIDENTS;
      set({ incidents: filtered });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('incidents').select('*').order('date_occurred', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ incidents: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      set({ error: 'Error al cargar incidentes', isLoading: false });
    }
  },

  addIncident: async (incidentData) => {
    const newIncident: Incident = {
      ...incidentData,
      id: generateId(),
      code: generateIncidentCode(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({ incidents: [newIncident, ...state.incidents] }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ incidents: [data, ...state.incidents] }));
    } catch (error) {
      console.error('Error adding incident:', error);
      throw error;
    }
  },

  updateIncident: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        incidents: state.incidents.map(i => i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i)
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        incidents: state.incidents.map(i => i.id === id ? { ...i, ...data, updated_at: new Date().toISOString() } : i)
      }));
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  },

  deleteIncident: async (id) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        incidents: state.incidents.filter(i => i.id !== id),
        selectedIncidentId: state.selectedIncidentId === id ? null : state.selectedIncidentId
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        incidents: state.incidents.filter(i => i.id !== id),
        selectedIncidentId: state.selectedIncidentId === id ? null : state.selectedIncidentId
      }));
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  },

  resolveIncident: async (id, resolvedBy) => {
    await get().updateIncident(id, {
      status: 'resolved',
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    });
  },

  selectIncident: (id) => {
    set({ selectedIncidentId: id });
  },

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters } }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  getIncidentById: (id) => {
    return get().incidents.find(i => i.id === id);
  },

  getFilteredIncidents: () => {
    const { incidents, filters } = get();
    
    return incidents.filter(incident => {
      if (filters.projectId && incident.project_id !== filters.projectId) return false;
      if (filters.type && incident.type !== filters.type) return false;
      if (filters.severity && incident.severity !== filters.severity) return false;
      if (filters.status && incident.status !== filters.status) return false;
      if (filters.dateFrom && incident.date_occurred < filters.dateFrom) return false;
      if (filters.dateTo && incident.date_occurred > filters.dateTo) return false;
      return true;
    });
  },

  getIncidentsByProject: (projectId) => {
    return get().incidents.filter(i => i.project_id === projectId);
  },

  getOpenIncidents: () => {
    return get().incidents.filter(i => i.status === 'reported' || i.status === 'investigating');
  },

  getCriticalIncidents: () => {
    return get().incidents.filter(i => (i.severity === 'major' || i.severity === 'critical') && i.status !== 'closed');
  },

  getStats: () => {
    const incidents = get().incidents;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    return {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length,
      critical: incidents.filter(i => (i.severity === 'major' || i.severity === 'critical') && i.status !== 'closed').length,
      thisMonth: incidents.filter(i => i.created_at >= thisMonth).length,
    };
  },
}));

// Helper constants - aligned with IncidentType enum
export const INCIDENT_TYPES: Array<{ value: IncidentType; label: string; icon: string; color: string }> = [
  { value: 'safety', label: 'Seguridad', icon: '🦺', color: 'bg-red-500' },
  { value: 'quality', label: 'Calidad', icon: '📋', color: 'bg-yellow-500' },
  { value: 'environmental', label: 'Ambiental', icon: '🌿', color: 'bg-green-500' },
  { value: 'delay', label: 'Retraso', icon: '⏰', color: 'bg-orange-500' },
  { value: 'damage', label: 'Daño', icon: '🏚️', color: 'bg-purple-500' },
  { value: 'theft', label: 'Robo', icon: '🔒', color: 'bg-gray-700' },
  { value: 'other', label: 'Otro', icon: '📝', color: 'bg-gray-500' },
];

// Helper constants - aligned with IncidentSeverity enum
export const INCIDENT_SEVERITIES: Array<{ value: IncidentSeverity; label: string; icon: string; color: string; textColor: string }> = [
  { value: 'minor', label: 'Menor', icon: '🟢', color: 'bg-green-500', textColor: 'text-green-600' },
  { value: 'moderate', label: 'Moderada', icon: '🟡', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { value: 'major', label: 'Mayor', icon: '🟠', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { value: 'critical', label: 'Crítica', icon: '🔴', color: 'bg-red-500', textColor: 'text-red-600' },
];

// Helper constants - aligned with IncidentStatus enum
export const INCIDENT_STATUSES: Array<{ value: IncidentStatus; label: string; icon: string; color: string }> = [
  { value: 'reported', label: 'Reportado', icon: '📂', color: 'bg-blue-500' },
  { value: 'investigating', label: 'En Investigación', icon: '🔍', color: 'bg-yellow-500' },
  { value: 'resolved', label: 'Resuelto', icon: '✔️', color: 'bg-green-500' },
  { value: 'closed', label: 'Cerrado', icon: '✅', color: 'bg-gray-500' },
];

export const getTypeConfig = (type: IncidentType) => {
  return INCIDENT_TYPES.find(t => t.value === type) || INCIDENT_TYPES[6];
};

export const getSeverityConfig = (severity: IncidentSeverity) => {
  return INCIDENT_SEVERITIES.find(s => s.value === severity) || INCIDENT_SEVERITIES[0];
};

export const getStatusConfig = (status: IncidentStatus) => {
  return INCIDENT_STATUSES.find(s => s.value === status) || INCIDENT_STATUSES[0];
};
