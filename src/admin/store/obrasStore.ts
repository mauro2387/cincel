/**
 * Obras Store - Gestión completa de obras
 * Bitácora, tareas, fotos, costos, timeline
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type ObraEstado = 'planificacion' | 'en_progreso' | 'pausada' | 'completada' | 'cancelada';
export type TareaEstado = 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
export type TareaPrioridad = 'baja' | 'media' | 'alta' | 'urgente';

export interface BitacoraEntry {
  id: string;
  obra_id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  clima?: string;
  temperatura?: number;
  trabajadores_presentes: number;
  horas_trabajadas: number;
  actividades: string[];
  materiales_usados?: { material: string; cantidad: number; unidad: string }[];
  incidentes?: string;
  fotos: string[];
  created_by: string;
  created_at: string;
}

export interface TareaObra {
  id: string;
  obra_id: string;
  titulo: string;
  descripcion?: string;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  asignado_a?: string;
  fecha_inicio?: string;
  fecha_vencimiento?: string;
  fecha_completada?: string;
  porcentaje_avance: number;
  dependencias?: string[]; // IDs de otras tareas
  etiquetas: string[];
  created_at: string;
  updated_at: string;
}

export interface FotoObra {
  id: string;
  obra_id: string;
  url: string;
  thumbnail?: string;
  titulo?: string;
  descripcion?: string;
  etapa?: string;
  fecha: string;
  uploaded_by: string;
}

export interface CostoObra {
  id: string;
  obra_id: string;
  categoria: 'mano_obra' | 'materiales' | 'equipos' | 'subcontratos' | 'permisos' | 'otros';
  concepto: string;
  descripcion?: string;
  monto: number;
  fecha: string;
  proveedor?: string;
  factura?: string;
  estado: 'pendiente' | 'pagado';
  created_at: string;
}

export interface Obra {
  id: string;
  nombre: string;
  cliente_id: string;
  cliente_nombre: string;
  direccion: string;
  tipo: string;
  estado: ObraEstado;
  descripcion?: string;
  presupuesto_id?: string;
  presupuesto_total: number;
  costo_actual: number;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  fecha_fin_real?: string;
  porcentaje_avance: number;
  encargado?: string;
  telefono_contacto?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

interface ObrasState {
  obras: Obra[];
  bitacora: BitacoraEntry[];
  tareas: TareaObra[];
  fotos: FotoObra[];
  costos: CostoObra[];
  selectedObraId: string | null;
  
  // Obras CRUD
  addObra: (obra: Omit<Obra, 'id' | 'created_at' | 'updated_at' | 'costo_actual'>) => void;
  updateObra: (id: string, updates: Partial<Obra>) => void;
  deleteObra: (id: string) => void;
  setSelectedObra: (id: string | null) => void;
  
  // Bitácora
  addBitacoraEntry: (entry: Omit<BitacoraEntry, 'id' | 'created_at'>) => void;
  updateBitacoraEntry: (id: string, updates: Partial<BitacoraEntry>) => void;
  deleteBitacoraEntry: (id: string) => void;
  
  // Tareas
  addTarea: (tarea: Omit<TareaObra, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTarea: (id: string, updates: Partial<TareaObra>) => void;
  deleteTarea: (id: string) => void;
  
  // Fotos
  addFoto: (foto: Omit<FotoObra, 'id'>) => void;
  deleteFoto: (id: string) => void;
  
  // Costos
  addCosto: (costo: Omit<CostoObra, 'id' | 'created_at'>) => void;
  updateCosto: (id: string, updates: Partial<CostoObra>) => void;
  deleteCosto: (id: string) => void;
  
  // Getters
  getObraById: (id: string) => Obra | undefined;
  getBitacoraByObra: (obraId: string) => BitacoraEntry[];
  getTareasByObra: (obraId: string) => TareaObra[];
  getFotosByObra: (obraId: string) => FotoObra[];
  getCostosByObra: (obraId: string) => CostoObra[];
  getCostoTotalByObra: (obraId: string) => number;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Demo data
const demoObras: Obra[] = [
  {
    id: 'obra-1',
    nombre: 'Remodelación Casa García',
    cliente_id: 'cliente-1',
    cliente_nombre: 'Juan García',
    direccion: 'Av. Reforma 234, Col. Centro, Monterrey',
    tipo: 'Remodelación',
    estado: 'en_progreso',
    descripcion: 'Remodelación completa de cocina y baños',
    presupuesto_total: 450000,
    costo_actual: 180000,
    fecha_inicio: '2025-12-01',
    fecha_fin_estimada: '2026-02-15',
    porcentaje_avance: 40,
    encargado: 'Roberto Sánchez',
    telefono_contacto: '81 1234 5678',
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2026-01-05T15:30:00Z',
  },
  {
    id: 'obra-2',
    nombre: 'Construcción Bodega Industrial',
    cliente_id: 'cliente-2',
    cliente_nombre: 'Grupo Industrial del Norte',
    direccion: 'Parque Industrial Santa Catarina, Nave 15',
    tipo: 'Construcción Nueva',
    estado: 'en_progreso',
    descripcion: 'Bodega de 2,000 m² con oficinas administrativas',
    presupuesto_total: 3500000,
    costo_actual: 1200000,
    fecha_inicio: '2025-10-01',
    fecha_fin_estimada: '2026-04-30',
    porcentaje_avance: 35,
    encargado: 'Miguel Torres',
    telefono_contacto: '81 9876 5432',
    created_at: '2025-09-20T09:00:00Z',
    updated_at: '2026-01-06T08:00:00Z',
  },
  {
    id: 'obra-3',
    nombre: 'Ampliación Oficinas Martínez',
    cliente_id: 'cliente-3',
    cliente_nombre: 'Despacho Martínez & Asociados',
    direccion: 'Torre Empresarial, Piso 8, San Pedro',
    tipo: 'Ampliación',
    estado: 'planificacion',
    descripcion: 'Ampliación de 200 m² para nuevas salas de juntas',
    presupuesto_total: 890000,
    costo_actual: 0,
    fecha_inicio: '2026-02-01',
    fecha_fin_estimada: '2026-04-15',
    porcentaje_avance: 0,
    encargado: 'Ana López',
    created_at: '2025-12-20T14:00:00Z',
    updated_at: '2025-12-20T14:00:00Z',
  },
];

const demoBitacora: BitacoraEntry[] = [
  {
    id: 'bit-1',
    obra_id: 'obra-1',
    fecha: '2026-01-06',
    titulo: 'Instalación de azulejos cocina',
    descripcion: 'Se completó la instalación de azulejos en el área de cocina. Se utilizó pegamento especial para mayor adherencia.',
    clima: 'Soleado',
    temperatura: 22,
    trabajadores_presentes: 4,
    horas_trabajadas: 8,
    actividades: ['Preparación de superficie', 'Corte de azulejos', 'Instalación', 'Limpieza'],
    materiales_usados: [
      { material: 'Azulejo cerámico', cantidad: 25, unidad: 'm²' },
      { material: 'Pegamento', cantidad: 3, unidad: 'sacos' },
      { material: 'Bocel', cantidad: 2, unidad: 'kg' },
    ],
    fotos: [],
    created_by: 'Roberto Sánchez',
    created_at: '2026-01-06T18:00:00Z',
  },
  {
    id: 'bit-2',
    obra_id: 'obra-1',
    fecha: '2026-01-05',
    titulo: 'Instalación eléctrica',
    descripcion: 'Cableado completo de la cocina. Se instalaron 8 contactos nuevos y 4 apagadores.',
    clima: 'Nublado',
    temperatura: 18,
    trabajadores_presentes: 2,
    horas_trabajadas: 6,
    actividades: ['Canalización', 'Cableado', 'Instalación de cajas', 'Pruebas'],
    fotos: [],
    created_by: 'Roberto Sánchez',
    created_at: '2026-01-05T17:30:00Z',
  },
  {
    id: 'bit-3',
    obra_id: 'obra-2',
    fecha: '2026-01-06',
    titulo: 'Colado de losa segundo nivel',
    descripcion: 'Se realizó el colado de la losa del segundo nivel. Concreto premezclado de 250 kg/cm².',
    clima: 'Soleado',
    temperatura: 24,
    trabajadores_presentes: 12,
    horas_trabajadas: 10,
    actividades: ['Preparación de cimbra', 'Armado de acero', 'Colado', 'Vibrado', 'Curado'],
    materiales_usados: [
      { material: 'Concreto premezclado', cantidad: 45, unidad: 'm³' },
      { material: 'Acero de refuerzo', cantidad: 2500, unidad: 'kg' },
    ],
    incidentes: 'Retraso de 1 hora en llegada de ollas de concreto',
    fotos: [],
    created_by: 'Miguel Torres',
    created_at: '2026-01-06T19:00:00Z',
  },
];

const demoTareas: TareaObra[] = [
  {
    id: 'tarea-1',
    obra_id: 'obra-1',
    titulo: 'Instalar muebles de cocina',
    descripcion: 'Instalación de gabinetes superiores e inferiores',
    estado: 'pendiente',
    prioridad: 'alta',
    asignado_a: 'Carlos Ruiz',
    fecha_inicio: '2026-01-08',
    fecha_vencimiento: '2026-01-12',
    porcentaje_avance: 0,
    etiquetas: ['cocina', 'carpintería'],
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'tarea-2',
    obra_id: 'obra-1',
    titulo: 'Pintura general',
    descripcion: 'Aplicar pintura en paredes y techos',
    estado: 'en_progreso',
    prioridad: 'media',
    asignado_a: 'Pedro Gómez',
    fecha_inicio: '2026-01-06',
    fecha_vencimiento: '2026-01-15',
    porcentaje_avance: 30,
    etiquetas: ['pintura', 'acabados'],
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-06T12:00:00Z',
  },
  {
    id: 'tarea-3',
    obra_id: 'obra-2',
    titulo: 'Instalación de estructura metálica',
    descripcion: 'Montaje de columnas y trabes de acero',
    estado: 'en_progreso',
    prioridad: 'urgente',
    asignado_a: 'Equipo Estructural',
    fecha_inicio: '2026-01-02',
    fecha_vencimiento: '2026-01-20',
    porcentaje_avance: 60,
    etiquetas: ['estructura', 'acero'],
    created_at: '2025-12-28T10:00:00Z',
    updated_at: '2026-01-06T14:00:00Z',
  },
  {
    id: 'tarea-4',
    obra_id: 'obra-2',
    titulo: 'Instalación de cubierta',
    descripcion: 'Colocación de lámina galvanizada en techo',
    estado: 'pendiente',
    prioridad: 'alta',
    asignado_a: 'Equipo Estructural',
    fecha_vencimiento: '2026-02-01',
    porcentaje_avance: 0,
    dependencias: ['tarea-3'],
    etiquetas: ['techo', 'estructura'],
    created_at: '2025-12-28T10:00:00Z',
    updated_at: '2025-12-28T10:00:00Z',
  },
];

const demoCostos: CostoObra[] = [
  {
    id: 'costo-1',
    obra_id: 'obra-1',
    categoria: 'materiales',
    concepto: 'Azulejos cocina y baños',
    monto: 45000,
    fecha: '2025-12-15',
    proveedor: 'Home Depot',
    factura: 'HD-12345',
    estado: 'pagado',
    created_at: '2025-12-15T10:00:00Z',
  },
  {
    id: 'costo-2',
    obra_id: 'obra-1',
    categoria: 'mano_obra',
    concepto: 'Semana 1-5 Enero',
    monto: 35000,
    fecha: '2026-01-05',
    estado: 'pagado',
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'costo-3',
    obra_id: 'obra-1',
    categoria: 'materiales',
    concepto: 'Material eléctrico',
    monto: 18000,
    fecha: '2026-01-03',
    proveedor: 'Eléctrica del Norte',
    factura: 'EN-5678',
    estado: 'pagado',
    created_at: '2026-01-03T10:00:00Z',
  },
  {
    id: 'costo-4',
    obra_id: 'obra-2',
    categoria: 'materiales',
    concepto: 'Acero estructural',
    monto: 580000,
    fecha: '2025-10-15',
    proveedor: 'Aceros Monterrey',
    factura: 'AM-9012',
    estado: 'pagado',
    created_at: '2025-10-15T10:00:00Z',
  },
  {
    id: 'costo-5',
    obra_id: 'obra-2',
    categoria: 'subcontratos',
    concepto: 'Cimentación',
    monto: 320000,
    fecha: '2025-11-01',
    proveedor: 'Cimentaciones del Norte',
    estado: 'pagado',
    created_at: '2025-11-01T10:00:00Z',
  },
  {
    id: 'costo-6',
    obra_id: 'obra-2',
    categoria: 'mano_obra',
    concepto: 'Nómina Diciembre',
    monto: 180000,
    fecha: '2025-12-31',
    estado: 'pagado',
    created_at: '2025-12-31T10:00:00Z',
  },
];

export const useObrasStore = create<ObrasState>()(
  persist(
    (set, get) => ({
      obras: demoObras,
      bitacora: demoBitacora,
      tareas: demoTareas,
      fotos: [],
      costos: demoCostos,
      selectedObraId: null,

      // Obras CRUD
      addObra: (obra) =>
        set((state) => ({
          obras: [
            ...state.obras,
            {
              ...obra,
              id: generateId(),
              costo_actual: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),

      updateObra: (id, updates) =>
        set((state) => ({
          obras: state.obras.map((o) =>
            o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
          ),
        })),

      deleteObra: (id) =>
        set((state) => ({
          obras: state.obras.filter((o) => o.id !== id),
          bitacora: state.bitacora.filter((b) => b.obra_id !== id),
          tareas: state.tareas.filter((t) => t.obra_id !== id),
          fotos: state.fotos.filter((f) => f.obra_id !== id),
          costos: state.costos.filter((c) => c.obra_id !== id),
        })),

      setSelectedObra: (id) => set({ selectedObraId: id }),

      // Bitácora
      addBitacoraEntry: (entry) =>
        set((state) => ({
          bitacora: [
            {
              ...entry,
              id: generateId(),
              created_at: new Date().toISOString(),
            },
            ...state.bitacora,
          ],
        })),

      updateBitacoraEntry: (id, updates) =>
        set((state) => ({
          bitacora: state.bitacora.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBitacoraEntry: (id) =>
        set((state) => ({
          bitacora: state.bitacora.filter((b) => b.id !== id),
        })),

      // Tareas
      addTarea: (tarea) =>
        set((state) => ({
          tareas: [
            ...state.tareas,
            {
              ...tarea,
              id: generateId(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),

      updateTarea: (id, updates) =>
        set((state) => ({
          tareas: state.tareas.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
          ),
        })),

      deleteTarea: (id) =>
        set((state) => ({
          tareas: state.tareas.filter((t) => t.id !== id),
        })),

      // Fotos
      addFoto: (foto) =>
        set((state) => ({
          fotos: [...state.fotos, { ...foto, id: generateId() }],
        })),

      deleteFoto: (id) =>
        set((state) => ({
          fotos: state.fotos.filter((f) => f.id !== id),
        })),

      // Costos
      addCosto: (costo) =>
        set((state) => {
          const newCosto = {
            ...costo,
            id: generateId(),
            created_at: new Date().toISOString(),
          };
          const newCostos = [...state.costos, newCosto];
          
          // Update obra's costo_actual
          const obraCostos = newCostos.filter((c) => c.obra_id === costo.obra_id);
          const totalCosto = obraCostos.reduce((sum, c) => sum + c.monto, 0);
          
          return {
            costos: newCostos,
            obras: state.obras.map((o) =>
              o.id === costo.obra_id
                ? { ...o, costo_actual: totalCosto, updated_at: new Date().toISOString() }
                : o
            ),
          };
        }),

      updateCosto: (id, updates) =>
        set((state) => {
          const newCostos = state.costos.map((c) => (c.id === id ? { ...c, ...updates } : c));
          const costo = state.costos.find((c) => c.id === id);
          
          if (costo) {
            const obraCostos = newCostos.filter((c) => c.obra_id === costo.obra_id);
            const totalCosto = obraCostos.reduce((sum, c) => sum + c.monto, 0);
            
            return {
              costos: newCostos,
              obras: state.obras.map((o) =>
                o.id === costo.obra_id
                  ? { ...o, costo_actual: totalCosto, updated_at: new Date().toISOString() }
                  : o
              ),
            };
          }
          
          return { costos: newCostos };
        }),

      deleteCosto: (id) =>
        set((state) => {
          const costo = state.costos.find((c) => c.id === id);
          const newCostos = state.costos.filter((c) => c.id !== id);
          
          if (costo) {
            const obraCostos = newCostos.filter((c) => c.obra_id === costo.obra_id);
            const totalCosto = obraCostos.reduce((sum, c) => sum + c.monto, 0);
            
            return {
              costos: newCostos,
              obras: state.obras.map((o) =>
                o.id === costo.obra_id
                  ? { ...o, costo_actual: totalCosto, updated_at: new Date().toISOString() }
                  : o
              ),
            };
          }
          
          return { costos: newCostos };
        }),

      // Getters
      getObraById: (id) => get().obras.find((o) => o.id === id),
      getBitacoraByObra: (obraId) =>
        get()
          .bitacora.filter((b) => b.obra_id === obraId)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
      getTareasByObra: (obraId) => get().tareas.filter((t) => t.obra_id === obraId),
      getFotosByObra: (obraId) => get().fotos.filter((f) => f.obra_id === obraId),
      getCostosByObra: (obraId) => get().costos.filter((c) => c.obra_id === obraId),
      getCostoTotalByObra: (obraId) =>
        get()
          .costos.filter((c) => c.obra_id === obraId)
          .reduce((sum, c) => sum + c.monto, 0),
    }),
    {
      name: 'cincel-obras-storage',
    }
  )
);
