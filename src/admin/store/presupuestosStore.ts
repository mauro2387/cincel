/**
 * Presupuestos Store - Gestión de presupuestos/cotizaciones
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { PresupuestoEstado } from '../../lib/database.types';

// Tipos para items del presupuesto
export interface PresupuestoItem {
  id: string;
  categoria: 'mano_obra' | 'materiales' | 'viaticos' | 'otros';
  rubro: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Presupuesto completo
export interface LocalPresupuesto {
  id: string;
  lead_id: string | null;
  cliente_id: string | null;
  obra_id: string | null;
  numero: string;
  version: number;
  titulo: string;
  descripcion: string | null;
  items: PresupuestoItem[];
  subtotal_mano_obra: number;
  subtotal_materiales: number;
  subtotal_viaticos: number;
  subtotal_otros: number;
  iva_porcentaje: number;
  iva_monto: number;
  total: number;
  estado: PresupuestoEstado;
  validez_dias: number;
  condiciones: string | null;
  notas_internas: string | null;
  pdf_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface PresupuestosState {
  presupuestos: LocalPresupuesto[];
  isLoading: boolean;
  error: string | null;
  selectedPresupuestoId: string | null;
  
  // Actions
  fetchPresupuestos: () => Promise<void>;
  addPresupuesto: (data: Omit<LocalPresupuesto, 'id' | 'numero' | 'created_at' | 'updated_at'>) => Promise<string>;
  updatePresupuesto: (id: string, data: Partial<LocalPresupuesto>) => Promise<void>;
  deletePresupuesto: (id: string) => Promise<void>;
  selectPresupuesto: (id: string | null) => void;
  duplicatePresupuesto: (id: string) => Promise<string | null>;
  
  // Cálculos
  calculateTotals: (items: PresupuestoItem[], ivaPorcentaje: number) => {
    subtotal_mano_obra: number;
    subtotal_materiales: number;
    subtotal_viaticos: number;
    subtotal_otros: number;
    iva_monto: number;
    total: number;
  };
}

const generateId = () => crypto.randomUUID();
const generateNumero = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `PPTO-${year}-${num}`;
};

// Datos demo
const DEMO_PRESUPUESTOS: LocalPresupuesto[] = [
  {
    id: '1',
    lead_id: '1',
    cliente_id: null,
    obra_id: null,
    numero: 'PPTO-2024-0001',
    version: 1,
    titulo: 'Reforma Cocina - María González',
    descripcion: 'Reforma integral de cocina incluyendo instalación eléctrica, sanitaria y mobiliario',
    items: [
      {
        id: 'i1',
        categoria: 'mano_obra',
        rubro: 'Demolición',
        descripcion: 'Demolición de cocina existente, retiro de escombros',
        unidad: 'global',
        cantidad: 1,
        precio_unitario: 800,
        subtotal: 800,
      },
      {
        id: 'i2',
        categoria: 'mano_obra',
        rubro: 'Instalación eléctrica',
        descripcion: 'Puntos de luz, enchufes y tablero',
        unidad: 'puntos',
        cantidad: 12,
        precio_unitario: 50,
        subtotal: 600,
      },
      {
        id: 'i3',
        categoria: 'mano_obra',
        rubro: 'Instalación sanitaria',
        descripcion: 'Cañerías agua fría/caliente, desagües',
        unidad: 'global',
        cantidad: 1,
        precio_unitario: 1200,
        subtotal: 1200,
      },
      {
        id: 'i4',
        categoria: 'mano_obra',
        rubro: 'Albañilería',
        descripcion: 'Revoque, azulejado, pintura',
        unidad: 'm2',
        cantidad: 25,
        precio_unitario: 80,
        subtotal: 2000,
      },
      {
        id: 'i5',
        categoria: 'materiales',
        rubro: 'Azulejos',
        descripcion: 'Cerámicos 30x60 para pared',
        unidad: 'm2',
        cantidad: 15,
        precio_unitario: 45,
        subtotal: 675,
      },
      {
        id: 'i6',
        categoria: 'materiales',
        rubro: 'Griferías',
        descripcion: 'Grifo cocina monomando + accesorios',
        unidad: 'un',
        cantidad: 1,
        precio_unitario: 250,
        subtotal: 250,
      },
      {
        id: 'i7',
        categoria: 'materiales',
        rubro: 'Material eléctrico',
        descripcion: 'Cables, llaves, tomas, tablero',
        unidad: 'global',
        cantidad: 1,
        precio_unitario: 400,
        subtotal: 400,
      },
      {
        id: 'i8',
        categoria: 'viaticos',
        rubro: 'Transporte',
        descripcion: 'Flete materiales y traslados',
        unidad: 'global',
        cantidad: 1,
        precio_unitario: 300,
        subtotal: 300,
      },
    ],
    subtotal_mano_obra: 4600,
    subtotal_materiales: 1325,
    subtotal_viaticos: 300,
    subtotal_otros: 0,
    iva_porcentaje: 22,
    iva_monto: 1369.5,
    total: 7594.5,
    estado: 'borrador',
    validez_dias: 30,
    condiciones: 'Forma de pago: 50% anticipo, 50% contra entrega.\nPlazo de ejecución: 15 días hábiles.\nNo incluye mobiliario de cocina.',
    notas_internas: 'Cliente interesada, revisar con equipo antes de enviar',
    pdf_url: null,
    created_by: 'demo-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    lead_id: '5',
    cliente_id: null,
    obra_id: null,
    numero: 'PPTO-2024-0002',
    version: 1,
    titulo: 'Reparación Humedad - Carlos Fernández',
    descripcion: 'Tratamiento de humedad en pared medianera',
    items: [
      {
        id: 'i1',
        categoria: 'mano_obra',
        rubro: 'Diagnóstico',
        descripcion: 'Inspección y diagnóstico de humedad',
        unidad: 'global',
        cantidad: 1,
        precio_unitario: 150,
        subtotal: 150,
      },
      {
        id: 'i2',
        categoria: 'mano_obra',
        rubro: 'Tratamiento',
        descripcion: 'Aplicación de hidrófugo e impermeabilización',
        unidad: 'm2',
        cantidad: 12,
        precio_unitario: 65,
        subtotal: 780,
      },
      {
        id: 'i3',
        categoria: 'mano_obra',
        rubro: 'Pintura',
        descripcion: 'Pintura final con pintura antihumedad',
        unidad: 'm2',
        cantidad: 12,
        precio_unitario: 30,
        subtotal: 360,
      },
      {
        id: 'i4',
        categoria: 'materiales',
        rubro: 'Hidrófugo',
        descripcion: 'Hidrófugo de silicona premium',
        unidad: 'lt',
        cantidad: 5,
        precio_unitario: 40,
        subtotal: 200,
      },
      {
        id: 'i5',
        categoria: 'materiales',
        rubro: 'Pintura',
        descripcion: 'Pintura látex antihumedad',
        unidad: 'lt',
        cantidad: 8,
        precio_unitario: 35,
        subtotal: 280,
      },
    ],
    subtotal_mano_obra: 1290,
    subtotal_materiales: 480,
    subtotal_viaticos: 0,
    subtotal_otros: 0,
    iva_porcentaje: 22,
    iva_monto: 389.4,
    total: 2159.4,
    estado: 'enviado',
    validez_dias: 15,
    condiciones: 'Garantía de 2 años sobre el trabajo realizado.',
    notas_internas: 'Enviado por WhatsApp, esperando respuesta',
    pdf_url: null,
    created_by: 'demo-1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const usePresupuestosStore = create<PresupuestosState>()(
  persist(
    (set, get) => ({
      presupuestos: DEMO_PRESUPUESTOS,
      isLoading: false,
      error: null,
      selectedPresupuestoId: null,
      
      fetchPresupuestos: async () => {
        if (!isSupabaseConfigured() || !supabase) {
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('presupuestos')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ presupuestos: data as LocalPresupuesto[], isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al cargar presupuestos',
            isLoading: false 
          });
        }
      },
      
      addPresupuesto: async (data) => {
        const now = new Date().toISOString();
        const newPresupuesto: LocalPresupuesto = {
          ...data,
          id: generateId(),
          numero: generateNumero(),
          created_at: now,
          updated_at: now,
        };
        
        set((state) => ({
          presupuestos: [newPresupuesto, ...state.presupuestos],
        }));
        
        return newPresupuesto.id;
      },
      
      updatePresupuesto: async (id, data) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          presupuestos: state.presupuestos.map((p) =>
            p.id === id ? { ...p, ...data, updated_at: now } : p
          ),
        }));
      },
      
      deletePresupuesto: async (id) => {
        set((state) => ({
          presupuestos: state.presupuestos.filter((p) => p.id !== id),
          selectedPresupuestoId: state.selectedPresupuestoId === id ? null : state.selectedPresupuestoId,
        }));
      },
      
      selectPresupuesto: (id) => {
        set({ selectedPresupuestoId: id });
      },
      
      duplicatePresupuesto: async (id) => {
        const { presupuestos, addPresupuesto } = get();
        const original = presupuestos.find((p) => p.id === id);
        
        if (!original) return null;
        
        const newId = await addPresupuesto({
          ...original,
          version: original.version + 1,
          titulo: `${original.titulo} (copia)`,
          estado: 'borrador',
          pdf_url: null,
        });
        
        return newId;
      },
      
      calculateTotals: (items, ivaPorcentaje) => {
        const subtotal_mano_obra = items
          .filter((i) => i.categoria === 'mano_obra')
          .reduce((sum, i) => sum + i.subtotal, 0);
        
        const subtotal_materiales = items
          .filter((i) => i.categoria === 'materiales')
          .reduce((sum, i) => sum + i.subtotal, 0);
        
        const subtotal_viaticos = items
          .filter((i) => i.categoria === 'viaticos')
          .reduce((sum, i) => sum + i.subtotal, 0);
        
        const subtotal_otros = items
          .filter((i) => i.categoria === 'otros')
          .reduce((sum, i) => sum + i.subtotal, 0);
        
        const subtotal = subtotal_mano_obra + subtotal_materiales + subtotal_viaticos + subtotal_otros;
        const iva_monto = subtotal * (ivaPorcentaje / 100);
        const total = subtotal + iva_monto;
        
        return {
          subtotal_mano_obra,
          subtotal_materiales,
          subtotal_viaticos,
          subtotal_otros,
          iva_monto,
          total,
        };
      },
    }),
    {
      name: 'cincel-presupuestos',
    }
  )
);
