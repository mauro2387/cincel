/**
 * Crews Store - Gestión de cuadrillas de trabajo
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Crew, CrewMember, CrewType } from '../../lib/database.types';

export interface CrewWithMembers extends Crew {
  members?: CrewMember[];
}

interface CrewsState {
  crews: CrewWithMembers[];
  selectedCrewId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD Crews
  fetchCrews: () => Promise<void>;
  addCrew: (crew: Omit<Crew, 'id' | 'created_at' | 'updated_at' | 'members_count'>) => Promise<void>;
  updateCrew: (id: string, data: Partial<Crew>) => Promise<void>;
  deleteCrew: (id: string) => Promise<void>;
  
  // CRUD Members
  addMember: (member: Omit<CrewMember, 'id' | 'created_at'>) => Promise<void>;
  updateMember: (id: string, data: Partial<CrewMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  
  // Selection
  selectCrew: (id: string | null) => void;
  
  // Getters
  getCrewById: (id: string) => CrewWithMembers | undefined;
  getActiveCrews: () => CrewWithMembers[];
  getCrewsByType: (type: CrewType) => CrewWithMembers[];
  getMembersByCrew: (crewId: string) => CrewMember[];
}

// Demo data
const DEMO_CREWS: CrewWithMembers[] = [
  {
    id: 'crew-1',
    name: 'Cuadrilla Albañilería Principal',
    type: 'own',
    supervisor: 'Carlos Rodríguez',
    supervisor_phone: '099123456',
    specialty: 'Albañilería general',
    hourly_rate: 450,
    daily_rate: 3600,
    supplier_id: null,
    members_count: 4,
    active: true,
    notes: 'Cuadrilla principal para trabajos de albañilería',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    members: [
      {
        id: 'member-1',
        crew_id: 'crew-1',
        name: 'Carlos Rodríguez',
        document_id: '4.567.890-1',
        role: 'Capataz',
        specialty: 'Albañilería',
        hourly_rate: 550,
        phone: '099123456',
        emergency_contact: '099111222 - María (esposa)',
        active: true,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'member-2',
        crew_id: 'crew-1',
        name: 'Juan Pérez',
        document_id: '5.234.567-2',
        role: 'Oficial',
        specialty: 'Mampostería',
        hourly_rate: 400,
        phone: '098765432',
        emergency_contact: '098222333 - Ana (madre)',
        active: true,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'member-3',
        crew_id: 'crew-1',
        name: 'Pedro González',
        document_id: '5.678.901-3',
        role: 'Medio Oficial',
        specialty: 'General',
        hourly_rate: 350,
        phone: '097654321',
        emergency_contact: null,
        active: true,
        created_at: '2024-01-16T08:00:00Z',
      },
      {
        id: 'member-4',
        crew_id: 'crew-1',
        name: 'Luis Fernández',
        document_id: '6.123.456-4',
        role: 'Peón',
        specialty: null,
        hourly_rate: 300,
        phone: '096543210',
        emergency_contact: null,
        active: true,
        created_at: '2024-01-16T08:00:00Z',
      },
    ],
  },
  {
    id: 'crew-2',
    name: 'Electricidad Martínez',
    type: 'subcontractor',
    supervisor: 'Roberto Martínez',
    supervisor_phone: '099555666',
    specialty: 'Instalaciones eléctricas',
    hourly_rate: 600,
    daily_rate: 4800,
    supplier_id: 'supplier-1',
    members_count: 3,
    active: true,
    notes: 'Subcontratista especializado en instalaciones eléctricas',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    members: [
      {
        id: 'member-5',
        crew_id: 'crew-2',
        name: 'Roberto Martínez',
        document_id: '3.456.789-5',
        role: 'Electricista Jefe',
        specialty: 'Instalaciones eléctricas industriales',
        hourly_rate: 700,
        phone: '099555666',
        emergency_contact: '099777888 - Laura (esposa)',
        active: true,
        created_at: '2024-02-01T10:00:00Z',
      },
      {
        id: 'member-6',
        crew_id: 'crew-2',
        name: 'Diego Silva',
        document_id: '4.890.123-6',
        role: 'Electricista',
        specialty: 'Baja tensión',
        hourly_rate: 550,
        phone: '098444555',
        emergency_contact: null,
        active: true,
        created_at: '2024-02-01T10:00:00Z',
      },
      {
        id: 'member-7',
        crew_id: 'crew-2',
        name: 'Mario López',
        document_id: '5.345.678-7',
        role: 'Ayudante',
        specialty: null,
        hourly_rate: 400,
        phone: '097333444',
        emergency_contact: null,
        active: true,
        created_at: '2024-02-01T10:00:00Z',
      },
    ],
  },
  {
    id: 'crew-3',
    name: 'Sanitaria Torres',
    type: 'subcontractor',
    supervisor: 'Andrés Torres',
    supervisor_phone: '099888999',
    specialty: 'Instalaciones sanitarias',
    hourly_rate: 550,
    daily_rate: 4400,
    supplier_id: 'supplier-2',
    members_count: 2,
    active: true,
    notes: 'Especialistas en instalaciones sanitarias y gas',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
    members: [
      {
        id: 'member-8',
        crew_id: 'crew-3',
        name: 'Andrés Torres',
        document_id: '2.789.012-8',
        role: 'Plomero Jefe',
        specialty: 'Sanitaria y gas',
        hourly_rate: 650,
        phone: '099888999',
        emergency_contact: '099000111 - Carmen (esposa)',
        active: true,
        created_at: '2024-02-15T10:00:00Z',
      },
      {
        id: 'member-9',
        crew_id: 'crew-3',
        name: 'Fabián Núñez',
        document_id: '4.012.345-9',
        role: 'Plomero',
        specialty: 'Sanitaria',
        hourly_rate: 500,
        phone: '098222333',
        emergency_contact: null,
        active: true,
        created_at: '2024-02-15T10:00:00Z',
      },
    ],
  },
  {
    id: 'crew-4',
    name: 'Cuadrilla Pintura',
    type: 'own',
    supervisor: 'Miguel Acosta',
    supervisor_phone: '099777888',
    specialty: 'Pintura y terminaciones',
    hourly_rate: 400,
    daily_rate: 3200,
    supplier_id: null,
    members_count: 3,
    active: true,
    notes: 'Cuadrilla especializada en pintura interior y exterior',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
    members: [],
  },
];

const generateId = () => crypto.randomUUID();

export const useCrewsStore = create<CrewsState>()((set, get) => ({
  crews: DEMO_CREWS,
  selectedCrewId: null,
  isLoading: false,
  error: null,

  fetchCrews: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      set({ crews: DEMO_CREWS });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const { data: crewsData, error: crewsError } = await supabase
        .from('crews')
        .select('*')
        .order('name');
      
      if (crewsError) throw crewsError;
      
      // Fetch members for each crew
      const { data: membersData, error: membersError } = await supabase
        .from('crew_members')
        .select('*')
        .order('name');
      
      if (membersError) throw membersError;
      
      const crews = (crewsData || []).map((crew: Crew) => ({
        ...crew,
        members: (membersData || []).filter((m: CrewMember) => m.crew_id === crew.id)
      }));
      
      set({ crews, isLoading: false });
    } catch (error) {
      console.error('Error fetching crews:', error);
      set({ error: 'Error al cargar cuadrillas', isLoading: false });
    }
  },

  addCrew: async (crewData) => {
    const newCrew: CrewWithMembers = {
      ...crewData,
      id: generateId(),
      members_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [],
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({ crews: [...state.crews, newCrew] }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('crews')
        .insert(crewData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ crews: [...state.crews, { ...data, members: [] }] }));
    } catch (error) {
      console.error('Error adding crew:', error);
      throw error;
    }
  },

  updateCrew: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        crews: state.crews.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crews')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        crews: state.crews.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
      }));
    } catch (error) {
      console.error('Error updating crew:', error);
      throw error;
    }
  },

  deleteCrew: async (id) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        crews: state.crews.filter(c => c.id !== id),
        selectedCrewId: state.selectedCrewId === id ? null : state.selectedCrewId
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        crews: state.crews.filter(c => c.id !== id),
        selectedCrewId: state.selectedCrewId === id ? null : state.selectedCrewId
      }));
    } catch (error) {
      console.error('Error deleting crew:', error);
      throw error;
    }
  },

  addMember: async (memberData) => {
    const newMember: CrewMember = {
      ...memberData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        crews: state.crews.map(c => {
          if (c.id === memberData.crew_id) {
            const members = [...(c.members || []), newMember];
            return { ...c, members, members_count: members.length };
          }
          return c;
        })
      }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('crew_members')
        .insert(memberData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        crews: state.crews.map(c => {
          if (c.id === memberData.crew_id) {
            const members = [...(c.members || []), data];
            return { ...c, members, members_count: members.length };
          }
          return c;
        })
      }));
      
      // Update crew members_count
      await supabase
        .from('crews')
        .update({ members_count: get().getCrewById(memberData.crew_id)?.members?.length || 0 })
        .eq('id', memberData.crew_id);
        
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  },

  updateMember: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        crews: state.crews.map(c => ({
          ...c,
          members: c.members?.map(m => m.id === id ? { ...m, ...data } : m)
        }))
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crew_members')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        crews: state.crews.map(c => ({
          ...c,
          members: c.members?.map(m => m.id === id ? { ...m, ...data } : m)
        }))
      }));
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  deleteMember: async (id) => {
    // Find which crew this member belongs to
    const crew = get().crews.find(c => c.members?.some(m => m.id === id));
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        crews: state.crews.map(c => {
          const members = c.members?.filter(m => m.id !== id);
          return {
            ...c,
            members,
            members_count: members?.length || 0
          };
        })
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        crews: state.crews.map(c => {
          const members = c.members?.filter(m => m.id !== id);
          return {
            ...c,
            members,
            members_count: members?.length || 0
          };
        })
      }));
      
      // Update crew members_count
      if (crew) {
        await supabase
          .from('crews')
          .update({ members_count: (crew.members?.length || 1) - 1 })
          .eq('id', crew.id);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  selectCrew: (id) => {
    set({ selectedCrewId: id });
  },

  getCrewById: (id) => {
    return get().crews.find(c => c.id === id);
  },

  getActiveCrews: () => {
    return get().crews.filter(c => c.active);
  },

  getCrewsByType: (type) => {
    return get().crews.filter(c => c.type === type);
  },

  getMembersByCrew: (crewId) => {
    const crew = get().crews.find(c => c.id === crewId);
    return crew?.members || [];
  },
}));

// Helper constants
export const CREW_TYPES = [
  { value: 'own', label: 'Propia', icon: '👷', color: 'bg-blue-500' },
  { value: 'subcontractor', label: 'Subcontratista', icon: '🏗️', color: 'bg-purple-500' },
];

export const CREW_SPECIALTIES = [
  'Albañilería general',
  'Albañilería fina',
  'Instalaciones eléctricas',
  'Instalaciones sanitarias',
  'Gas',
  'Pintura',
  'Yesería',
  'Carpintería',
  'Herrería',
  'Techados',
  'Piscinas',
  'Paisajismo',
  'Demolición',
  'Excavación',
  'Hormigón',
  'Otros',
];

export const MEMBER_ROLES = [
  'Capataz',
  'Oficial',
  'Medio Oficial',
  'Peón',
  'Electricista Jefe',
  'Electricista',
  'Plomero Jefe',
  'Plomero',
  'Pintor',
  'Carpintero',
  'Herrero',
  'Ayudante',
  'Operador',
];
