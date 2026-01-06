/**
 * Dashboard Store - KPIs y métricas del negocio
 */

import { create } from 'zustand';

export interface KPI {
  label: string;
  valor: number;
  formato: 'moneda' | 'numero' | 'porcentaje';
  cambio?: number; // % de cambio vs periodo anterior
  tendencia?: 'up' | 'down' | 'neutral';
}

export interface VentasMes {
  mes: string;
  ventas: number;
  meta: number;
}

export interface LeadsPorEtapa {
  etapa: string;
  cantidad: number;
  valor: number;
}

export interface LeadsPorOrigen {
  origen: string;
  cantidad: number;
  porcentaje: number;
}

export interface ActividadReciente {
  id: string;
  tipo: 'lead' | 'cliente' | 'obra' | 'tarea' | 'mensaje';
  titulo: string;
  descripcion: string;
  fecha: string;
  icono?: string;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  tipo: 'reunion' | 'visita' | 'llamada' | 'vencimiento' | 'otro';
  fecha_inicio: string;
  fecha_fin?: string;
  todo_el_dia?: boolean;
  lead_id?: string;
  cliente_id?: string;
  obra_id?: string;
  descripcion?: string;
  color?: string;
}

interface DashboardState {
  // KPIs
  kpis: {
    leadsNuevos: KPI;
    cotizacionesPendientes: KPI;
    obrasActivas: KPI;
    ingresosMes: KPI;
    tasaConversion: KPI;
    ticketPromedio: KPI;
  };
  
  // Gráficas
  ventasPorMes: VentasMes[];
  leadsPorEtapa: LeadsPorEtapa[];
  leadsPorOrigen: LeadsPorOrigen[];
  
  // Timeline y calendario
  actividadReciente: ActividadReciente[];
  eventosCalendario: EventoCalendario[];
  
  // Actions
  refreshKPIs: () => void;
  addEvento: (evento: Omit<EventoCalendario, 'id'>) => void;
  updateEvento: (id: string, updates: Partial<EventoCalendario>) => void;
  deleteEvento: (id: string) => void;
  
  // Getters
  getEventosHoy: () => EventoCalendario[];
  getEventosSemana: () => EventoCalendario[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Demo data - estos datos en producción vendrían de los otros stores
const demoKPIs = {
  leadsNuevos: {
    label: 'Leads Nuevos',
    valor: 12,
    formato: 'numero' as const,
    cambio: 20,
    tendencia: 'up' as const,
  },
  cotizacionesPendientes: {
    label: 'Cotizaciones Pendientes',
    valor: 8,
    formato: 'numero' as const,
    cambio: -5,
    tendencia: 'down' as const,
  },
  obrasActivas: {
    label: 'Obras Activas',
    valor: 3,
    formato: 'numero' as const,
    cambio: 0,
    tendencia: 'neutral' as const,
  },
  ingresosMes: {
    label: 'Ingresos del Mes',
    valor: 850000,
    formato: 'moneda' as const,
    cambio: 15,
    tendencia: 'up' as const,
  },
  tasaConversion: {
    label: 'Tasa de Conversión',
    valor: 32,
    formato: 'porcentaje' as const,
    cambio: 5,
    tendencia: 'up' as const,
  },
  ticketPromedio: {
    label: 'Ticket Promedio',
    valor: 285000,
    formato: 'moneda' as const,
    cambio: 8,
    tendencia: 'up' as const,
  },
};

const demoVentasPorMes: VentasMes[] = [
  { mes: 'Jul', ventas: 420000, meta: 500000 },
  { mes: 'Ago', ventas: 580000, meta: 500000 },
  { mes: 'Sep', ventas: 490000, meta: 500000 },
  { mes: 'Oct', ventas: 720000, meta: 600000 },
  { mes: 'Nov', ventas: 650000, meta: 600000 },
  { mes: 'Dic', ventas: 890000, meta: 700000 },
  { mes: 'Ene', ventas: 850000, meta: 750000 },
];

const demoLeadsPorEtapa: LeadsPorEtapa[] = [
  { etapa: 'Nuevo Lead', cantidad: 8, valor: 1200000 },
  { etapa: 'Contactado', cantidad: 5, valor: 850000 },
  { etapa: 'Visita Agendada', cantidad: 3, valor: 650000 },
  { etapa: 'Cotización Enviada', cantidad: 6, valor: 1800000 },
  { etapa: 'Negociación', cantidad: 4, valor: 1400000 },
  { etapa: 'Cerrado Ganado', cantidad: 2, valor: 750000 },
];

const demoLeadsPorOrigen: LeadsPorOrigen[] = [
  { origen: 'WhatsApp', cantidad: 12, porcentaje: 35 },
  { origen: 'Instagram', cantidad: 8, porcentaje: 24 },
  { origen: 'Referidos', cantidad: 6, porcentaje: 18 },
  { origen: 'Google', cantidad: 4, porcentaje: 12 },
  { origen: 'Facebook', cantidad: 3, porcentaje: 9 },
  { origen: 'Otros', cantidad: 1, porcentaje: 3 },
];

const demoActividadReciente: ActividadReciente[] = [
  {
    id: 'act-1',
    tipo: 'mensaje',
    titulo: 'Nuevo mensaje de WhatsApp',
    descripcion: 'María González envió un mensaje',
    fecha: '2026-01-06T14:30:00Z',
  },
  {
    id: 'act-2',
    tipo: 'lead',
    titulo: 'Nuevo lead desde Instagram',
    descripcion: 'Carlos Mendez solicitó cotización',
    fecha: '2026-01-06T15:45:00Z',
  },
  {
    id: 'act-3',
    tipo: 'obra',
    titulo: 'Bitácora actualizada',
    descripcion: 'Remodelación Casa García - Instalación azulejos',
    fecha: '2026-01-06T18:00:00Z',
  },
  {
    id: 'act-4',
    tipo: 'tarea',
    titulo: 'Tarea completada',
    descripcion: 'Enviar factura - Obra García',
    fecha: '2026-01-05T17:30:00Z',
  },
  {
    id: 'act-5',
    tipo: 'cliente',
    titulo: 'Cliente actualizado',
    descripcion: 'Grupo Industrial del Norte - Nueva nota agregada',
    fecha: '2026-01-05T11:00:00Z',
  },
];

const demoEventosCalendario: EventoCalendario[] = [
  {
    id: 'ev-1',
    titulo: 'Llamar a María González',
    tipo: 'llamada',
    fecha_inicio: '2026-01-06T17:00:00Z',
    lead_id: 'lead-1',
    color: '#3B82F6',
  },
  {
    id: 'ev-2',
    titulo: 'Visita técnica - Bodega Industrial',
    tipo: 'visita',
    fecha_inicio: '2026-01-07T10:00:00Z',
    fecha_fin: '2026-01-07T12:00:00Z',
    obra_id: 'obra-2',
    descripcion: 'Revisión de avance de estructura',
    color: '#10B981',
  },
  {
    id: 'ev-3',
    titulo: 'Reunión con proveedor de acero',
    tipo: 'reunion',
    fecha_inicio: '2026-01-08T11:00:00Z',
    fecha_fin: '2026-01-08T12:00:00Z',
    descripcion: 'Negociar precios',
    color: '#8B5CF6',
  },
  {
    id: 'ev-4',
    titulo: 'Vence cotización Martínez',
    tipo: 'vencimiento',
    fecha_inicio: '2026-01-10T00:00:00Z',
    todo_el_dia: true,
    lead_id: 'lead-3',
    color: '#EF4444',
  },
  {
    id: 'ev-5',
    titulo: 'Inicio obra - Ampliación oficinas',
    tipo: 'otro',
    fecha_inicio: '2026-02-01T08:00:00Z',
    obra_id: 'obra-3',
    color: '#F59E0B',
  },
];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: demoKPIs,
  ventasPorMes: demoVentasPorMes,
  leadsPorEtapa: demoLeadsPorEtapa,
  leadsPorOrigen: demoLeadsPorOrigen,
  actividadReciente: demoActividadReciente,
  eventosCalendario: demoEventosCalendario,

  refreshKPIs: () => {
    // En producción, aquí calcularíamos los KPIs desde los otros stores
    // Por ahora mantenemos los datos demo
  },

  addEvento: (evento) =>
    set((state) => ({
      eventosCalendario: [
        ...state.eventosCalendario,
        { ...evento, id: generateId() },
      ],
    })),

  updateEvento: (id, updates) =>
    set((state) => ({
      eventosCalendario: state.eventosCalendario.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  deleteEvento: (id) =>
    set((state) => ({
      eventosCalendario: state.eventosCalendario.filter((e) => e.id !== id),
    })),

  getEventosHoy: () => {
    const eventos = get().eventosCalendario;
    const hoy = new Date().toISOString().split('T')[0];
    return eventos.filter((e) => e.fecha_inicio.startsWith(hoy));
  },

  getEventosSemana: () => {
    const eventos = get().eventosCalendario;
    const hoy = new Date();
    const finSemana = new Date(hoy);
    finSemana.setDate(hoy.getDate() + 7);
    
    return eventos.filter((e) => {
      const fecha = new Date(e.fecha_inicio);
      return fecha >= hoy && fecha <= finSemana;
    });
  },
}));
