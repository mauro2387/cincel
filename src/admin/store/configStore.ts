/**
 * Configuración Store - Usuarios, roles, catálogos
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RolUsuario = 'admin' | 'vendedor' | 'supervisor' | 'operaciones';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  avatar?: string;
  telefono?: string;
  activo: boolean;
  permisos: string[];
  created_at: string;
}

export interface ServicioCatalogo {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base?: number;
  unidad?: string;
  activo: boolean;
}

export interface EtapaPipeline {
  id: string;
  nombre: string;
  orden: number;
  color: string;
  probabilidad: number; // % de probabilidad de cierre
  activo: boolean;
}

export interface PlantillaPresupuesto {
  id: string;
  nombre: string;
  descripcion?: string;
  items: {
    concepto: string;
    categoria: string;
    unidad: string;
    cantidad_default?: number;
    precio_unitario?: number;
  }[];
  created_at: string;
}

export interface ConfiguracionGeneral {
  empresa: {
    nombre: string;
    rfc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    logo_url?: string;
  };
  presupuestos: {
    vigencia_dias: number;
    iva: number;
    mostrar_desglose: boolean;
    terminos_condiciones?: string;
  };
  notificaciones: {
    email_nuevos_leads: boolean;
    email_tareas_vencidas: boolean;
    recordatorio_seguimiento_dias: number;
  };
}

interface ConfigState {
  usuarios: Usuario[];
  servicios: ServicioCatalogo[];
  etapasPipeline: EtapaPipeline[];
  plantillasPresupuesto: PlantillaPresupuesto[];
  configuracion: ConfiguracionGeneral;
  
  // Usuarios
  addUsuario: (usuario: Omit<Usuario, 'id' | 'created_at'>) => void;
  updateUsuario: (id: string, updates: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  
  // Servicios
  addServicio: (servicio: Omit<ServicioCatalogo, 'id'>) => void;
  updateServicio: (id: string, updates: Partial<ServicioCatalogo>) => void;
  deleteServicio: (id: string) => void;
  
  // Etapas Pipeline
  updateEtapasPipeline: (etapas: EtapaPipeline[]) => void;
  
  // Plantillas
  addPlantilla: (plantilla: Omit<PlantillaPresupuesto, 'id' | 'created_at'>) => void;
  updatePlantilla: (id: string, updates: Partial<PlantillaPresupuesto>) => void;
  deletePlantilla: (id: string) => void;
  
  // Configuración
  updateConfiguracion: (config: Partial<ConfiguracionGeneral>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const demoUsuarios: Usuario[] = [
  {
    id: 'user-1',
    nombre: 'Roberto Sánchez',
    email: 'roberto@cincelconstrucciones.com',
    rol: 'admin',
    telefono: '81 1111 2222',
    activo: true,
    permisos: ['all'],
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'user-2',
    nombre: 'Miguel Torres',
    email: 'miguel@cincelconstrucciones.com',
    rol: 'supervisor',
    telefono: '81 3333 4444',
    activo: true,
    permisos: ['obras', 'bitacora', 'tareas'],
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'user-3',
    nombre: 'Ana López',
    email: 'ana@cincelconstrucciones.com',
    rol: 'vendedor',
    telefono: '81 5555 6666',
    activo: true,
    permisos: ['leads', 'clientes', 'cotizaciones', 'inbox'],
    created_at: '2025-06-01T10:00:00Z',
  },
];

const demoServicios: ServicioCatalogo[] = [
  {
    id: 'serv-1',
    nombre: 'Remodelación de Cocina',
    descripcion: 'Remodelación integral de cocina',
    categoria: 'Remodelación',
    precio_base: 150000,
    unidad: 'proyecto',
    activo: true,
  },
  {
    id: 'serv-2',
    nombre: 'Remodelación de Baño',
    descripcion: 'Remodelación completa de baño',
    categoria: 'Remodelación',
    precio_base: 80000,
    unidad: 'proyecto',
    activo: true,
  },
  {
    id: 'serv-3',
    nombre: 'Construcción de Bodega',
    descripcion: 'Construcción de bodega industrial',
    categoria: 'Construcción Nueva',
    precio_base: 3500,
    unidad: 'm²',
    activo: true,
  },
  {
    id: 'serv-4',
    nombre: 'Ampliación Residencial',
    descripcion: 'Ampliación de espacios en casa habitación',
    categoria: 'Ampliación',
    precio_base: 12000,
    unidad: 'm²',
    activo: true,
  },
  {
    id: 'serv-5',
    nombre: 'Pintura Interior',
    descripcion: 'Aplicación de pintura en interiores',
    categoria: 'Acabados',
    precio_base: 85,
    unidad: 'm²',
    activo: true,
  },
  {
    id: 'serv-6',
    nombre: 'Instalación Eléctrica',
    descripcion: 'Instalación eléctrica residencial',
    categoria: 'Instalaciones',
    precio_base: 450,
    unidad: 'punto',
    activo: true,
  },
];

const demoEtapasPipeline: EtapaPipeline[] = [
  { id: 'etapa-1', nombre: 'Nuevo Lead', orden: 1, color: '#6B7280', probabilidad: 10, activo: true },
  { id: 'etapa-2', nombre: 'Contactado', orden: 2, color: '#3B82F6', probabilidad: 20, activo: true },
  { id: 'etapa-3', nombre: 'Calificado', orden: 3, color: '#8B5CF6', probabilidad: 30, activo: true },
  { id: 'etapa-4', nombre: 'Visita Agendada', orden: 4, color: '#EC4899', probabilidad: 40, activo: true },
  { id: 'etapa-5', nombre: 'Visita Realizada', orden: 5, color: '#F59E0B', probabilidad: 50, activo: true },
  { id: 'etapa-6', nombre: 'Cotización Enviada', orden: 6, color: '#10B981', probabilidad: 60, activo: true },
  { id: 'etapa-7', nombre: 'Negociación', orden: 7, color: '#06B6D4', probabilidad: 70, activo: true },
  { id: 'etapa-8', nombre: 'Propuesta Final', orden: 8, color: '#84CC16', probabilidad: 80, activo: true },
  { id: 'etapa-9', nombre: 'Contrato', orden: 9, color: '#22C55E', probabilidad: 90, activo: true },
  { id: 'etapa-10', nombre: 'Cerrado Ganado', orden: 10, color: '#16A34A', probabilidad: 100, activo: true },
  { id: 'etapa-11', nombre: 'Cerrado Perdido', orden: 11, color: '#EF4444', probabilidad: 0, activo: true },
  { id: 'etapa-12', nombre: 'En Espera', orden: 12, color: '#9CA3AF', probabilidad: 20, activo: true },
];

const demoPlantillas: PlantillaPresupuesto[] = [
  {
    id: 'tpl-1',
    nombre: 'Remodelación de Cocina Estándar',
    descripcion: 'Plantilla para remodelación de cocina básica',
    items: [
      { concepto: 'Demolición y retiro', categoria: 'mano_obra', unidad: 'global', precio_unitario: 8000 },
      { concepto: 'Instalación eléctrica', categoria: 'mano_obra', unidad: 'puntos', cantidad_default: 10, precio_unitario: 450 },
      { concepto: 'Instalación hidráulica', categoria: 'mano_obra', unidad: 'global', precio_unitario: 6000 },
      { concepto: 'Piso cerámico', categoria: 'materiales', unidad: 'm²', cantidad_default: 12, precio_unitario: 850 },
      { concepto: 'Azulejo muros', categoria: 'materiales', unidad: 'm²', cantidad_default: 15, precio_unitario: 750 },
      { concepto: 'Pintura', categoria: 'materiales', unidad: 'm²', cantidad_default: 40, precio_unitario: 85 },
    ],
    created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'tpl-2',
    nombre: 'Construcción Bodega Industrial',
    descripcion: 'Plantilla para construcción de bodega',
    items: [
      { concepto: 'Cimentación', categoria: 'mano_obra', unidad: 'm²', precio_unitario: 800 },
      { concepto: 'Estructura metálica', categoria: 'materiales', unidad: 'kg', precio_unitario: 45 },
      { concepto: 'Cubierta lámina', categoria: 'materiales', unidad: 'm²', precio_unitario: 380 },
      { concepto: 'Muro perimetral', categoria: 'mano_obra', unidad: 'ml', precio_unitario: 1200 },
      { concepto: 'Instalación eléctrica', categoria: 'mano_obra', unidad: 'global', precio_unitario: 45000 },
      { concepto: 'Piso de concreto', categoria: 'mano_obra', unidad: 'm²', precio_unitario: 450 },
    ],
    created_at: '2025-07-15T10:00:00Z',
  },
];

const demoConfiguracion: ConfiguracionGeneral = {
  empresa: {
    nombre: 'Cincel Construcciones',
    rfc: 'CIC200101ABC',
    direccion: 'Av. Principal 123, Monterrey, N.L.',
    telefono: '81 1234 5678',
    email: 'info@cincelconstrucciones.com',
  },
  presupuestos: {
    vigencia_dias: 15,
    iva: 16,
    mostrar_desglose: true,
    terminos_condiciones: `
1. Los precios incluyen IVA.
2. El presupuesto tiene una vigencia de 15 días.
3. Se requiere un anticipo del 50% para iniciar la obra.
4. Los tiempos de entrega son aproximados y pueden variar.
5. Cualquier trabajo adicional será cotizado por separado.
    `.trim(),
  },
  notificaciones: {
    email_nuevos_leads: true,
    email_tareas_vencidas: true,
    recordatorio_seguimiento_dias: 3,
  },
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      usuarios: demoUsuarios,
      servicios: demoServicios,
      etapasPipeline: demoEtapasPipeline,
      plantillasPresupuesto: demoPlantillas,
      configuracion: demoConfiguracion,

      addUsuario: (usuario) =>
        set((state) => ({
          usuarios: [
            ...state.usuarios,
            { ...usuario, id: generateId(), created_at: new Date().toISOString() },
          ],
        })),

      updateUsuario: (id, updates) =>
        set((state) => ({
          usuarios: state.usuarios.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),

      deleteUsuario: (id) =>
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
        })),

      addServicio: (servicio) =>
        set((state) => ({
          servicios: [...state.servicios, { ...servicio, id: generateId() }],
        })),

      updateServicio: (id, updates) =>
        set((state) => ({
          servicios: state.servicios.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteServicio: (id) =>
        set((state) => ({
          servicios: state.servicios.filter((s) => s.id !== id),
        })),

      updateEtapasPipeline: (etapas) => set({ etapasPipeline: etapas }),

      addPlantilla: (plantilla) =>
        set((state) => ({
          plantillasPresupuesto: [
            ...state.plantillasPresupuesto,
            { ...plantilla, id: generateId(), created_at: new Date().toISOString() },
          ],
        })),

      updatePlantilla: (id, updates) =>
        set((state) => ({
          plantillasPresupuesto: state.plantillasPresupuesto.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePlantilla: (id) =>
        set((state) => ({
          plantillasPresupuesto: state.plantillasPresupuesto.filter((p) => p.id !== id),
        })),

      updateConfiguracion: (config) =>
        set((state) => ({
          configuracion: {
            ...state.configuracion,
            ...config,
            empresa: { ...state.configuracion.empresa, ...config.empresa },
            presupuestos: { ...state.configuracion.presupuestos, ...config.presupuestos },
            notificaciones: { ...state.configuracion.notificaciones, ...config.notificaciones },
          },
        })),
    }),
    {
      name: 'cincel-config-storage',
    }
  )
);
