/**
 * Inbox Store - Inbox Unificado Multi-Canal
 * WhatsApp, Instagram, Facebook Messenger
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type CanalMensaje = 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'telefono' | 'web';
export type EstadoConversacion = 'nueva' | 'en_progreso' | 'esperando_cliente' | 'resuelta' | 'archivada';
export type TipoMensaje = 'texto' | 'imagen' | 'audio' | 'video' | 'documento' | 'ubicacion';

export interface Mensaje {
  id: string;
  conversacion_id: string;
  contenido: string;
  tipo: TipoMensaje;
  es_entrante: boolean; // true = del cliente, false = de nosotros
  media_url?: string;
  leido: boolean;
  fecha: string;
  metadata?: Record<string, unknown>;
}

export interface Conversacion {
  id: string;
  canal: CanalMensaje;
  estado: EstadoConversacion;
  cliente_id?: string;
  lead_id?: string;
  
  // Info del contacto
  contacto_nombre: string;
  contacto_telefono?: string;
  contacto_email?: string;
  contacto_avatar?: string;
  contacto_handle?: string; // @usuario de Instagram/Facebook
  
  // Asignación
  asignado_a?: string;
  etiquetas: string[];
  
  // Tracking
  ultimo_mensaje?: string;
  ultimo_mensaje_fecha?: string;
  mensajes_sin_leer: number;
  
  // Metadata del canal
  external_id?: string; // ID en WhatsApp/Instagram/etc
  
  created_at: string;
  updated_at: string;
}

export interface PlantillaRespuesta {
  id: string;
  nombre: string;
  contenido: string;
  categoria: string;
  atajos?: string; // /cotizacion, /horario, etc
}

interface InboxState {
  conversaciones: Conversacion[];
  mensajes: Mensaje[];
  plantillas: PlantillaRespuesta[];
  selectedConversacionId: string | null;
  filtroCanal: CanalMensaje | 'todos';
  filtroEstado: EstadoConversacion | 'todos';
  busqueda: string;
  
  // Conversaciones
  addConversacion: (conv: Omit<Conversacion, 'id' | 'created_at' | 'updated_at' | 'mensajes_sin_leer'>) => string;
  updateConversacion: (id: string, updates: Partial<Conversacion>) => void;
  deleteConversacion: (id: string) => void;
  setSelectedConversacion: (id: string | null) => void;
  asignarConversacion: (id: string, userId: string) => void;
  cambiarEstado: (id: string, estado: EstadoConversacion) => void;
  
  // Mensajes
  addMensaje: (mensaje: Omit<Mensaje, 'id'>) => void;
  marcarLeido: (conversacionId: string) => void;
  
  // Plantillas
  addPlantilla: (plantilla: Omit<PlantillaRespuesta, 'id'>) => void;
  updatePlantilla: (id: string, updates: Partial<PlantillaRespuesta>) => void;
  deletePlantilla: (id: string) => void;
  
  // Filtros
  setFiltroCanal: (canal: CanalMensaje | 'todos') => void;
  setFiltroEstado: (estado: EstadoConversacion | 'todos') => void;
  setBusqueda: (busqueda: string) => void;
  
  // Getters
  getConversacionesFiltradas: () => Conversacion[];
  getMensajesByConversacion: (convId: string) => Mensaje[];
  getTotalSinLeer: () => number;
  getSinLeerPorCanal: () => Record<CanalMensaje, number>;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Demo data
const demoConversaciones: Conversacion[] = [
  {
    id: 'conv-1',
    canal: 'whatsapp',
    estado: 'en_progreso',
    contacto_nombre: 'María González',
    contacto_telefono: '+52 81 1234 5678',
    asignado_a: 'Roberto',
    etiquetas: ['cotización', 'urgente'],
    ultimo_mensaje: 'Gracias, espero su cotización',
    ultimo_mensaje_fecha: '2026-01-06T14:30:00Z',
    mensajes_sin_leer: 2,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-06T14:30:00Z',
  },
  {
    id: 'conv-2',
    canal: 'instagram',
    estado: 'nueva',
    contacto_nombre: 'Carlos Mendez',
    contacto_handle: '@carlosmendez_mty',
    contacto_avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    etiquetas: ['remodelación'],
    ultimo_mensaje: 'Hola, vi sus trabajos y me interesa una cotización',
    ultimo_mensaje_fecha: '2026-01-06T15:45:00Z',
    mensajes_sin_leer: 1,
    created_at: '2026-01-06T15:45:00Z',
    updated_at: '2026-01-06T15:45:00Z',
  },
  {
    id: 'conv-3',
    canal: 'facebook',
    estado: 'esperando_cliente',
    contacto_nombre: 'Ana Patricia Ruiz',
    contacto_handle: 'Ana Ruiz',
    etiquetas: ['ampliación', 'residencial'],
    ultimo_mensaje: 'Le envié la cotización, quedo atento a sus comentarios',
    ultimo_mensaje_fecha: '2026-01-05T18:00:00Z',
    mensajes_sin_leer: 0,
    asignado_a: 'Miguel',
    created_at: '2026-01-03T09:00:00Z',
    updated_at: '2026-01-05T18:00:00Z',
  },
  {
    id: 'conv-4',
    canal: 'whatsapp',
    estado: 'nueva',
    contacto_nombre: 'Ing. Fernando López',
    contacto_telefono: '+52 81 9876 5432',
    etiquetas: ['industrial', 'bodega'],
    ultimo_mensaje: 'Buenas tardes, necesito cotización para una bodega de 500m²',
    ultimo_mensaje_fecha: '2026-01-06T16:20:00Z',
    mensajes_sin_leer: 1,
    created_at: '2026-01-06T16:20:00Z',
    updated_at: '2026-01-06T16:20:00Z',
  },
  {
    id: 'conv-5',
    canal: 'email',
    estado: 'resuelta',
    contacto_nombre: 'Constructora del Valle',
    contacto_email: 'proyectos@constructoradelvalle.com',
    etiquetas: ['subcontrato'],
    ultimo_mensaje: 'Confirmamos el contrato, iniciamos la próxima semana',
    ultimo_mensaje_fecha: '2026-01-04T12:00:00Z',
    mensajes_sin_leer: 0,
    asignado_a: 'Roberto',
    created_at: '2025-12-20T10:00:00Z',
    updated_at: '2026-01-04T12:00:00Z',
  },
];

const demoMensajes: Mensaje[] = [
  // Conversación 1 - WhatsApp María
  {
    id: 'msg-1-1',
    conversacion_id: 'conv-1',
    contenido: 'Hola buenas tardes, estoy interesada en remodelar mi cocina',
    tipo: 'texto',
    es_entrante: true,
    leido: true,
    fecha: '2026-01-05T10:00:00Z',
  },
  {
    id: 'msg-1-2',
    conversacion_id: 'conv-1',
    contenido: '¡Hola María! Con gusto le ayudamos. ¿Podría compartirnos algunas fotos de su cocina actual y las medidas aproximadas?',
    tipo: 'texto',
    es_entrante: false,
    leido: true,
    fecha: '2026-01-05T10:15:00Z',
  },
  {
    id: 'msg-1-3',
    conversacion_id: 'conv-1',
    contenido: 'Claro, aquí le envío las fotos',
    tipo: 'texto',
    es_entrante: true,
    leido: true,
    fecha: '2026-01-05T10:30:00Z',
  },
  {
    id: 'msg-1-4',
    conversacion_id: 'conv-1',
    contenido: 'foto_cocina.jpg',
    tipo: 'imagen',
    es_entrante: true,
    leido: true,
    media_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    fecha: '2026-01-05T10:31:00Z',
  },
  {
    id: 'msg-1-5',
    conversacion_id: 'conv-1',
    contenido: 'Excelente, se ve que tiene buen espacio. La cocina mide aproximadamente 4x3 metros. Le preparo una cotización y se la envío mañana.',
    tipo: 'texto',
    es_entrante: false,
    leido: true,
    fecha: '2026-01-05T11:00:00Z',
  },
  {
    id: 'msg-1-6',
    conversacion_id: 'conv-1',
    contenido: 'Perfecto, gracias',
    tipo: 'texto',
    es_entrante: true,
    leido: false,
    fecha: '2026-01-06T14:00:00Z',
  },
  {
    id: 'msg-1-7',
    conversacion_id: 'conv-1',
    contenido: 'Gracias, espero su cotización',
    tipo: 'texto',
    es_entrante: true,
    leido: false,
    fecha: '2026-01-06T14:30:00Z',
  },
  
  // Conversación 2 - Instagram Carlos
  {
    id: 'msg-2-1',
    conversacion_id: 'conv-2',
    contenido: 'Hola, vi sus trabajos y me interesa una cotización',
    tipo: 'texto',
    es_entrante: true,
    leido: false,
    fecha: '2026-01-06T15:45:00Z',
  },
  
  // Conversación 3 - Facebook Ana
  {
    id: 'msg-3-1',
    conversacion_id: 'conv-3',
    contenido: 'Buenas tardes, quiero ampliar mi casa, agregar un cuarto extra',
    tipo: 'texto',
    es_entrante: true,
    leido: true,
    fecha: '2026-01-03T09:00:00Z',
  },
  {
    id: 'msg-3-2',
    conversacion_id: 'conv-3',
    contenido: 'Hola Ana, con gusto. ¿De qué medidas sería el cuarto?',
    tipo: 'texto',
    es_entrante: false,
    leido: true,
    fecha: '2026-01-03T09:30:00Z',
  },
  {
    id: 'msg-3-3',
    conversacion_id: 'conv-3',
    contenido: 'Aproximadamente 4x4 metros, con baño completo',
    tipo: 'texto',
    es_entrante: true,
    leido: true,
    fecha: '2026-01-03T10:00:00Z',
  },
  {
    id: 'msg-3-4',
    conversacion_id: 'conv-3',
    contenido: 'Le envié la cotización, quedo atento a sus comentarios',
    tipo: 'texto',
    es_entrante: false,
    leido: true,
    fecha: '2026-01-05T18:00:00Z',
  },
  
  // Conversación 4 - WhatsApp Fernando
  {
    id: 'msg-4-1',
    conversacion_id: 'conv-4',
    contenido: 'Buenas tardes, necesito cotización para una bodega de 500m²',
    tipo: 'texto',
    es_entrante: true,
    leido: false,
    fecha: '2026-01-06T16:20:00Z',
  },
];

const demoPlantillas: PlantillaRespuesta[] = [
  {
    id: 'tpl-1',
    nombre: 'Saludo inicial',
    contenido: '¡Hola! Gracias por contactar a Cincel Construcciones. ¿En qué podemos ayudarle?',
    categoria: 'general',
    atajos: '/hola',
  },
  {
    id: 'tpl-2',
    nombre: 'Solicitar información',
    contenido: 'Para poder darle una cotización precisa, ¿podría compartirnos los siguientes datos?\n\n1. Ubicación del proyecto\n2. Tipo de trabajo (remodelación, construcción nueva, ampliación)\n3. Medidas aproximadas\n4. Presupuesto estimado\n5. Fecha deseada de inicio',
    categoria: 'cotización',
    atajos: '/info',
  },
  {
    id: 'tpl-3',
    nombre: 'Agendar visita',
    contenido: 'Con gusto agendamos una visita para conocer el proyecto. ¿Qué día y horario le conviene?\n\nNuestros horarios de visita son:\n- Lunes a Viernes: 9:00 AM - 6:00 PM\n- Sábados: 9:00 AM - 2:00 PM',
    categoria: 'citas',
    atajos: '/visita',
  },
  {
    id: 'tpl-4',
    nombre: 'Cotización enviada',
    contenido: 'Le hemos enviado la cotización a su correo. El presupuesto tiene una vigencia de 15 días.\n\n¿Tiene alguna duda sobre la propuesta?',
    categoria: 'cotización',
    atajos: '/enviado',
  },
  {
    id: 'tpl-5',
    nombre: 'Horarios de atención',
    contenido: 'Nuestros horarios de atención son:\n\n📍 Oficina: Lunes a Viernes 9:00 - 18:00\n📞 Teléfono: 81 1234 5678\n📧 Email: info@cincelconstrucciones.com',
    categoria: 'general',
    atajos: '/horario',
  },
];

export const useInboxStore = create<InboxState>()(
  persist(
    (set, get) => ({
      conversaciones: demoConversaciones,
      mensajes: demoMensajes,
      plantillas: demoPlantillas,
      selectedConversacionId: null,
      filtroCanal: 'todos',
      filtroEstado: 'todos',
      busqueda: '',

      // Conversaciones
      addConversacion: (conv) => {
        const id = generateId();
        set((state) => ({
          conversaciones: [
            {
              ...conv,
              id,
              mensajes_sin_leer: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...state.conversaciones,
          ],
        }));
        return id;
      },

      updateConversacion: (id, updates) =>
        set((state) => ({
          conversaciones: state.conversaciones.map((c) =>
            c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
          ),
        })),

      deleteConversacion: (id) =>
        set((state) => ({
          conversaciones: state.conversaciones.filter((c) => c.id !== id),
          mensajes: state.mensajes.filter((m) => m.conversacion_id !== id),
          selectedConversacionId:
            state.selectedConversacionId === id ? null : state.selectedConversacionId,
        })),

      setSelectedConversacion: (id) => set({ selectedConversacionId: id }),

      asignarConversacion: (id, userId) =>
        set((state) => ({
          conversaciones: state.conversaciones.map((c) =>
            c.id === id
              ? { ...c, asignado_a: userId, updated_at: new Date().toISOString() }
              : c
          ),
        })),

      cambiarEstado: (id, estado) =>
        set((state) => ({
          conversaciones: state.conversaciones.map((c) =>
            c.id === id ? { ...c, estado, updated_at: new Date().toISOString() } : c
          ),
        })),

      // Mensajes
      addMensaje: (mensaje) =>
        set((state) => {
          const newMensaje = { ...mensaje, id: generateId() };
          
          return {
            mensajes: [...state.mensajes, newMensaje],
            conversaciones: state.conversaciones.map((c) =>
              c.id === mensaje.conversacion_id
                ? {
                    ...c,
                    ultimo_mensaje: mensaje.contenido,
                    ultimo_mensaje_fecha: mensaje.fecha,
                    mensajes_sin_leer: mensaje.es_entrante
                      ? c.mensajes_sin_leer + 1
                      : c.mensajes_sin_leer,
                    updated_at: new Date().toISOString(),
                  }
                : c
            ),
          };
        }),

      marcarLeido: (conversacionId) =>
        set((state) => ({
          mensajes: state.mensajes.map((m) =>
            m.conversacion_id === conversacionId ? { ...m, leido: true } : m
          ),
          conversaciones: state.conversaciones.map((c) =>
            c.id === conversacionId ? { ...c, mensajes_sin_leer: 0 } : c
          ),
        })),

      // Plantillas
      addPlantilla: (plantilla) =>
        set((state) => ({
          plantillas: [...state.plantillas, { ...plantilla, id: generateId() }],
        })),

      updatePlantilla: (id, updates) =>
        set((state) => ({
          plantillas: state.plantillas.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePlantilla: (id) =>
        set((state) => ({
          plantillas: state.plantillas.filter((p) => p.id !== id),
        })),

      // Filtros
      setFiltroCanal: (canal) => set({ filtroCanal: canal }),
      setFiltroEstado: (estado) => set({ filtroEstado: estado }),
      setBusqueda: (busqueda) => set({ busqueda }),

      // Getters
      getConversacionesFiltradas: () => {
        const { conversaciones, filtroCanal, filtroEstado, busqueda } = get();
        
        return conversaciones
          .filter((c) => {
            if (filtroCanal !== 'todos' && c.canal !== filtroCanal) return false;
            if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
            if (busqueda) {
              const search = busqueda.toLowerCase();
              return (
                c.contacto_nombre.toLowerCase().includes(search) ||
                c.contacto_telefono?.toLowerCase().includes(search) ||
                c.contacto_email?.toLowerCase().includes(search) ||
                c.ultimo_mensaje?.toLowerCase().includes(search)
              );
            }
            return true;
          })
          .sort(
            (a, b) =>
              new Date(b.ultimo_mensaje_fecha || b.updated_at).getTime() -
              new Date(a.ultimo_mensaje_fecha || a.updated_at).getTime()
          );
      },

      getMensajesByConversacion: (convId) =>
        get()
          .mensajes.filter((m) => m.conversacion_id === convId)
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()),

      getTotalSinLeer: () =>
        get().conversaciones.reduce((sum, c) => sum + c.mensajes_sin_leer, 0),

      getSinLeerPorCanal: () => {
        const conversaciones = get().conversaciones;
        const result: Record<CanalMensaje, number> = {
          whatsapp: 0,
          instagram: 0,
          facebook: 0,
          email: 0,
          telefono: 0,
          web: 0,
        };
        
        conversaciones.forEach((c) => {
          result[c.canal] += c.mensajes_sin_leer;
        });
        
        return result;
      },
    }),
    {
      name: 'cincel-inbox-storage',
    }
  )
);
