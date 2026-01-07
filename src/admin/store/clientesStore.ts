/**
 * Clientes Store - Gestión completa de clientes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured } from '../../lib/supabase';

export type TipoCliente = 'particular' | 'empresa' | 'gobierno' | 'otro';
export type EstadoCliente = 'activo' | 'inactivo' | 'potencial';

export interface Cliente {
  id: string;
  
  // Información básica
  nombre: string;
  tipo: TipoCliente;
  estado: EstadoCliente;
  
  // Contacto principal
  contacto_nombre?: string;
  contacto_cargo?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  
  // Dirección
  direccion?: string;
  ciudad?: string;
  estado_geografico?: string;
  codigo_postal?: string;
  
  // Fiscal (empresas)
  razon_social?: string;
  rfc?: string;
  regimen_fiscal?: string;
  direccion_fiscal?: string;
  
  // Relación comercial
  origen?: string; // Cómo nos conoció
  referido_por?: string;
  vendedor_asignado?: string;
  
  // Financiero
  credito_disponible: boolean;
  limite_credito?: number;
  dias_credito?: number;
  
  // Metadata
  etiquetas: string[];
  notas?: string;
  
  // Stats (calculados)
  total_obras?: number;
  total_facturado?: number;
  ultima_obra?: string;
  
  created_at: string;
  updated_at: string;
}

export interface DocumentoCliente {
  id: string;
  cliente_id: string;
  nombre: string;
  tipo: 'contrato' | 'identificacion' | 'fiscal' | 'otro';
  url: string;
  fecha: string;
  notas?: string;
}

export interface NotaCliente {
  id: string;
  cliente_id: string;
  contenido: string;
  created_by: string;
  created_at: string;
}

interface ClientesState {
  clientes: Cliente[];
  documentos: DocumentoCliente[];
  notas: NotaCliente[];
  selectedClienteId: string | null;
  busqueda: string;
  filtroTipo: TipoCliente | 'todos';
  filtroEstado: EstadoCliente | 'todos';
  
  // CRUD
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => string;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  setSelectedCliente: (id: string | null) => void;
  
  // Documentos
  addDocumento: (doc: Omit<DocumentoCliente, 'id'>) => void;
  deleteDocumento: (id: string) => void;
  
  // Notas
  addNota: (nota: Omit<NotaCliente, 'id' | 'created_at'>) => void;
  deleteNota: (id: string) => void;
  
  // Filtros
  setBusqueda: (busqueda: string) => void;
  setFiltroTipo: (tipo: TipoCliente | 'todos') => void;
  setFiltroEstado: (estado: EstadoCliente | 'todos') => void;
  
  // Getters
  getClientesFiltrados: () => Cliente[];
  getClienteById: (id: string) => Cliente | undefined;
  getDocumentosByCliente: (clienteId: string) => DocumentoCliente[];
  getNotasByCliente: (clienteId: string) => NotaCliente[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const demoClientes: Cliente[] = [
  {
    id: 'cliente-1',
    nombre: 'Juan García',
    tipo: 'particular',
    estado: 'activo',
    contacto_nombre: 'Juan García Pérez',
    email: 'juan.garcia@email.com',
    telefono: '81 1234 5678',
    celular: '81 9876 5432',
    direccion: 'Av. Reforma 234, Col. Centro',
    ciudad: 'Monterrey',
    estado_geografico: 'Nuevo León',
    codigo_postal: '64000',
    origen: 'Referido',
    referido_por: 'Pedro Martínez',
    vendedor_asignado: 'Roberto',
    credito_disponible: false,
    etiquetas: ['residencial', 'remodelación'],
    total_obras: 1,
    total_facturado: 180000,
    ultima_obra: 'Remodelación Casa García',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-12-15T14:00:00Z',
  },
  {
    id: 'cliente-2',
    nombre: 'Grupo Industrial del Norte',
    tipo: 'empresa',
    estado: 'activo',
    contacto_nombre: 'Ing. Ricardo Salinas',
    contacto_cargo: 'Director de Proyectos',
    email: 'rsalinas@grupoindnorte.com',
    telefono: '81 8765 4321',
    celular: '81 5555 1234',
    direccion: 'Av. Industriales 500',
    ciudad: 'Santa Catarina',
    estado_geografico: 'Nuevo León',
    codigo_postal: '66350',
    razon_social: 'Grupo Industrial del Norte S.A. de C.V.',
    rfc: 'GIN850101ABC',
    regimen_fiscal: 'General de Ley',
    direccion_fiscal: 'Av. Industriales 500, Santa Catarina, N.L.',
    origen: 'Google',
    vendedor_asignado: 'Miguel',
    credito_disponible: true,
    limite_credito: 500000,
    dias_credito: 30,
    etiquetas: ['industrial', 'bodegas', 'cliente VIP'],
    total_obras: 2,
    total_facturado: 2800000,
    ultima_obra: 'Construcción Bodega Industrial',
    created_at: '2025-08-15T10:00:00Z',
    updated_at: '2026-01-06T09:00:00Z',
  },
  {
    id: 'cliente-3',
    nombre: 'Despacho Martínez & Asociados',
    tipo: 'empresa',
    estado: 'potencial',
    contacto_nombre: 'Lic. Carlos Martínez',
    contacto_cargo: 'Socio Director',
    email: 'cmartinez@martinezasociados.com',
    telefono: '81 2222 3333',
    direccion: 'Torre Empresarial, Piso 8',
    ciudad: 'San Pedro Garza García',
    estado_geografico: 'Nuevo León',
    codigo_postal: '66260',
    razon_social: 'Martínez & Asociados S.C.',
    rfc: 'MAS900515XYZ',
    origen: 'Recomendación',
    vendedor_asignado: 'Ana',
    credito_disponible: false,
    etiquetas: ['comercial', 'oficinas'],
    created_at: '2025-12-20T14:00:00Z',
    updated_at: '2025-12-20T14:00:00Z',
  },
  {
    id: 'cliente-4',
    nombre: 'María Fernández',
    tipo: 'particular',
    estado: 'activo',
    contacto_nombre: 'María Fernández Luna',
    email: 'maria.fernandez@gmail.com',
    celular: '81 7777 8888',
    direccion: 'Calle Roble 123, Col. Del Valle',
    ciudad: 'Monterrey',
    estado_geografico: 'Nuevo León',
    codigo_postal: '66220',
    origen: 'Instagram',
    vendedor_asignado: 'Roberto',
    credito_disponible: false,
    etiquetas: ['residencial'],
    total_obras: 1,
    total_facturado: 95000,
    created_at: '2025-10-05T10:00:00Z',
    updated_at: '2025-11-20T16:00:00Z',
  },
];

const demoNotas: NotaCliente[] = [
  {
    id: 'nota-1',
    cliente_id: 'cliente-2',
    contenido: 'Cliente muy satisfecho con la bodega. Mencionó que tiene otro proyecto para 2026.',
    created_by: 'Miguel',
    created_at: '2026-01-05T11:00:00Z',
  },
  {
    id: 'nota-2',
    cliente_id: 'cliente-1',
    contenido: 'Prefiere comunicación por WhatsApp. Horario ideal para llamar: después de las 6pm.',
    created_by: 'Roberto',
    created_at: '2025-11-15T14:00:00Z',
  },
  {
    id: 'nota-3',
    cliente_id: 'cliente-3',
    contenido: 'Reunión inicial muy positiva. Interesados en iniciar la obra en febrero.',
    created_by: 'Ana',
    created_at: '2025-12-20T16:00:00Z',
  },
];

export const useClientesStore = create<ClientesState>()(
  persist(
    (set, get) => ({
      clientes: isSupabaseConfigured() ? [] : demoClientes,
      documentos: [],
      notas: isSupabaseConfigured() ? [] : demoNotas,
      selectedClienteId: null,
      busqueda: '',
      filtroTipo: 'todos',
      filtroEstado: 'todos',

      addCliente: (cliente) => {
        const id = generateId();
        set((state) => ({
          clientes: [
            {
              ...cliente,
              id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...state.clientes,
          ],
        }));
        return id;
      },

      updateCliente: (id, updates) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
          ),
        })),

      deleteCliente: (id) =>
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
          documentos: state.documentos.filter((d) => d.cliente_id !== id),
          notas: state.notas.filter((n) => n.cliente_id !== id),
        })),

      setSelectedCliente: (id) => set({ selectedClienteId: id }),

      addDocumento: (doc) =>
        set((state) => ({
          documentos: [...state.documentos, { ...doc, id: generateId() }],
        })),

      deleteDocumento: (id) =>
        set((state) => ({
          documentos: state.documentos.filter((d) => d.id !== id),
        })),

      addNota: (nota) =>
        set((state) => ({
          notas: [
            { ...nota, id: generateId(), created_at: new Date().toISOString() },
            ...state.notas,
          ],
        })),

      deleteNota: (id) =>
        set((state) => ({
          notas: state.notas.filter((n) => n.id !== id),
        })),

      setBusqueda: (busqueda) => set({ busqueda }),
      setFiltroTipo: (tipo) => set({ filtroTipo: tipo }),
      setFiltroEstado: (estado) => set({ filtroEstado: estado }),

      getClientesFiltrados: () => {
        const { clientes, busqueda, filtroTipo, filtroEstado } = get();
        
        return clientes.filter((c) => {
          if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
          if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
          if (busqueda) {
            const search = busqueda.toLowerCase();
            return (
              c.nombre.toLowerCase().includes(search) ||
              c.contacto_nombre?.toLowerCase().includes(search) ||
              c.email?.toLowerCase().includes(search) ||
              c.telefono?.includes(search) ||
              c.celular?.includes(search) ||
              c.razon_social?.toLowerCase().includes(search)
            );
          }
          return true;
        });
      },

      getClienteById: (id) => get().clientes.find((c) => c.id === id),
      getDocumentosByCliente: (clienteId) =>
        get().documentos.filter((d) => d.cliente_id === clienteId),
      getNotasByCliente: (clienteId) =>
        get()
          .notas.filter((n) => n.cliente_id === clienteId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    }),
    {
      name: 'cincel-clientes-storage',
    }
  )
);
