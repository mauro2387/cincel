/**
 * CRM Store - Datos del CRM/Admin
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado'>) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  
  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'fechaCreacion'>) => void;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  // Obras
  addObra: (obra: Omit<Obra, 'id' | 'progreso'>) => void;
  updateObra: (id: string, data: Partial<Obra>) => void;
  deleteObra: (id: string) => void;
  
  // Cotizaciones
  addCotizacion: (cotizacion: Omit<Cotizacion, 'id' | 'numero' | 'fechaCreacion' | 'estado'>) => void;
  updateCotizacion: (id: string, data: Partial<Cotizacion>) => void;
  deleteCotizacion: (id: string) => void;
  
  // Actividades
  addActividad: (actividad: Omit<Actividad, 'id' | 'fecha'>) => void;
  
  // Notas
  addNota: (entityId: string, texto: string, entityType: 'leads' | 'clientes') => void;
  
  // Utilidades
  convertLeadToCliente: (leadId: string) => string | null;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateNumero = () => `COT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

// Datos de ejemplo iniciales
const initialLeads: Lead[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan@email.com',
    telefono: '011-1234-5678',
    tipoProyecto: 'Construcción Residencial',
    presupuestoEstimado: 5000000,
    mensaje: 'Interesado en construir una casa de 150m2',
    origen: 'web',
    estado: 'nuevo',
    fechaCreacion: new Date('2024-01-10'),
    fechaActualizacion: new Date('2024-01-10'),
    notas: [],
  },
  {
    id: '2',
    nombre: 'María García',
    email: 'maria@empresa.com',
    telefono: '011-9876-5432',
    tipoProyecto: 'Reforma',
    presupuestoEstimado: 2000000,
    mensaje: 'Reforma integral de departamento',
    origen: 'referido',
    estado: 'contactado',
    fechaCreacion: new Date('2024-01-08'),
    fechaActualizacion: new Date('2024-01-12'),
    notas: [{ id: '1', texto: 'Llamada inicial realizada', fecha: new Date('2024-01-12') }],
  },
  {
    id: '3',
    nombre: 'Carlos López',
    email: 'carlos@gmail.com',
    telefono: '011-5555-4444',
    tipoProyecto: 'Ampliación',
    presupuestoEstimado: 3000000,
    origen: 'redes_sociales',
    estado: 'en_negociacion',
    fechaCreacion: new Date('2024-01-05'),
    fechaActualizacion: new Date('2024-01-14'),
    notas: [],
  },
];

const initialClientes: Cliente[] = [
  {
    id: '1',
    nombre: 'Roberto Sánchez',
    email: 'roberto@empresa.com',
    telefono: '011-2222-3333',
    direccion: 'Av. Libertador 1234, CABA',
    cuit: '20-12345678-9',
    estado: 'activo',
    fechaCreacion: new Date('2023-06-15'),
    notas: [],
  },
  {
    id: '2',
    nombre: 'Ana Martínez',
    email: 'ana@gmail.com',
    telefono: '011-4444-5555',
    direccion: 'Calle 50 N° 456, La Plata',
    estado: 'activo',
    fechaCreacion: new Date('2023-09-20'),
    notas: [],
  },
];

const initialObras: Obra[] = [
  {
    id: '1',
    nombre: 'Casa Familia Sánchez',
    clienteId: '1',
    direccion: 'Av. del Sol 789, Nordelta',
    tipo: 'Construcción Residencial',
    presupuesto: 8500000,
    fechaInicio: new Date('2023-10-01'),
    fechaFinEstimada: new Date('2024-06-01'),
    descripcion: 'Construcción de vivienda unifamiliar de 200m2',
    progreso: 65,
    estado: 'en_progreso',
    imagenes: [],
  },
  {
    id: '2',
    nombre: 'Reforma Dpto Martínez',
    clienteId: '2',
    direccion: 'Calle 50 N° 456, La Plata',
    tipo: 'Reforma',
    presupuesto: 2500000,
    fechaInicio: new Date('2024-01-15'),
    fechaFinEstimada: new Date('2024-03-15'),
    descripcion: 'Reforma integral de cocina y baños',
    progreso: 25,
    estado: 'en_progreso',
    imagenes: [],
  },
];

const initialCotizaciones: Cotizacion[] = [
  {
    id: '1',
    numero: 'COT-2024-0001',
    clienteId: '1',
    titulo: 'Ampliación quincho',
    descripcion: 'Construcción de quincho con parrilla',
    items: [
      { descripcion: 'Mano de obra', cantidad: 1, precioUnitario: 500000 },
      { descripcion: 'Materiales', cantidad: 1, precioUnitario: 800000 },
    ],
    total: 1300000,
    validezDias: 30,
    estado: 'pendiente',
    fechaCreacion: new Date('2024-01-10'),
  },
];

const initialActividades: Actividad[] = [
  {
    id: '1',
    tipo: 'llamada',
    titulo: 'Llamada seguimiento',
    descripcion: 'Se contactó al cliente para confirmar avance de obra',
    fecha: new Date('2024-01-14T10:30:00'),
    entidadTipo: 'cliente',
    entidadId: '1',
  },
  {
    id: '2',
    tipo: 'visita',
    titulo: 'Visita de obra',
    descripcion: 'Inspección de avance en obra Sánchez',
    fecha: new Date('2024-01-13T15:00:00'),
    entidadTipo: 'obra',
    entidadId: '1',
  },
  {
    id: '3',
    tipo: 'email',
    titulo: 'Cotización enviada',
    descripcion: 'Se envió cotización para ampliación de quincho',
    fecha: new Date('2024-01-10T09:00:00'),
    entidadTipo: 'cliente',
    entidadId: '1',
  },
];

export const useCrmStore = create<CRMState>()(
  persist(
    (set, get) => ({
      leads: initialLeads,
      clientes: initialClientes,
      obras: initialObras,
      cotizaciones: initialCotizaciones,
      actividades: initialActividades,
      
      // Leads
      addLead: (leadData) => {
        const lead: Lead = {
          ...leadData,
          id: generateId(),
          estado: 'nuevo',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };
        set((state) => ({
          leads: [...state.leads, lead],
          actividades: [...state.actividades, {
            id: generateId(),
            tipo: 'nota',
            titulo: 'Nuevo lead',
            descripcion: `Se creó el lead ${lead.nombre}`,
            fecha: new Date(),
            entidadTipo: 'lead',
            entidadId: lead.id,
          }],
        }));
      },
      
      updateLead: (id, data) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? { ...lead, ...data, fechaActualizacion: new Date() }
              : lead
          ),
        }));
      },
      
      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        }));
      },
      
      // Clientes
      addCliente: (clienteData) => {
        const cliente: Cliente = {
          ...clienteData,
          id: generateId(),
          fechaCreacion: new Date(),
        };
        set((state) => ({
          clientes: [...state.clientes, cliente],
        }));
      },
      
      updateCliente: (id, data) => {
        set((state) => ({
          clientes: state.clientes.map((cliente) =>
            cliente.id === id ? { ...cliente, ...data } : cliente
          ),
        }));
      },
      
      deleteCliente: (id) => {
        set((state) => ({
          clientes: state.clientes.filter((cliente) => cliente.id !== id),
        }));
      },
      
      // Obras
      addObra: (obraData) => {
        const obra: Obra = {
          ...obraData,
          id: generateId(),
          progreso: 0,
        };
        set((state) => ({
          obras: [...state.obras, obra],
        }));
      },
      
      updateObra: (id, data) => {
        set((state) => ({
          obras: state.obras.map((obra) =>
            obra.id === id ? { ...obra, ...data } : obra
          ),
        }));
      },
      
      deleteObra: (id) => {
        set((state) => ({
          obras: state.obras.filter((obra) => obra.id !== id),
        }));
      },
      
      // Cotizaciones
      addCotizacion: (cotizacionData) => {
        const cotizacion: Cotizacion = {
          ...cotizacionData,
          id: generateId(),
          numero: generateNumero(),
          estado: 'borrador',
          fechaCreacion: new Date(),
        };
        set((state) => ({
          cotizaciones: [...state.cotizaciones, cotizacion],
        }));
      },
      
      updateCotizacion: (id, data) => {
        set((state) => ({
          cotizaciones: state.cotizaciones.map((cotizacion) =>
            cotizacion.id === id ? { ...cotizacion, ...data } : cotizacion
          ),
        }));
      },
      
      deleteCotizacion: (id) => {
        set((state) => ({
          cotizaciones: state.cotizaciones.filter((cotizacion) => cotizacion.id !== id),
        }));
      },
      
      // Actividades
      addActividad: (actividadData) => {
        const actividad: Actividad = {
          ...actividadData,
          id: generateId(),
          fecha: new Date(),
        };
        set((state) => ({
          actividades: [...state.actividades, actividad],
        }));
      },
      
      // Notas
      addNota: (entityId, texto, entityType) => {
        const nota: Nota = {
          id: generateId(),
          texto,
          fecha: new Date(),
        };
        
        if (entityType === 'leads') {
          set((state) => ({
            leads: state.leads.map((lead) =>
              lead.id === entityId
                ? { ...lead, notas: [...(lead.notas || []), nota], fechaActualizacion: new Date() }
                : lead
            ),
          }));
        } else if (entityType === 'clientes') {
          set((state) => ({
            clientes: state.clientes.map((cliente) =>
              cliente.id === entityId
                ? { ...cliente, notas: [...(cliente.notas || []), nota] }
                : cliente
            ),
          }));
        }
      },
      
      // Convertir lead a cliente
      convertLeadToCliente: (leadId) => {
        const { leads, addCliente, updateLead } = get();
        const lead = leads.find((l) => l.id === leadId);
        
        if (!lead) return null;
        
        const clienteId = generateId();
        
        addCliente({
          nombre: lead.nombre,
          email: lead.email,
          telefono: lead.telefono,
          estado: 'activo',
        });
        
        updateLead(leadId, { estado: 'convertido' });
        
        return clienteId;
      },
    }),
    {
      name: 'cincel-crm',
    }
  )
);
