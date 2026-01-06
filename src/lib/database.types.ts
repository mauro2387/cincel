/**
 * Database Types for Supabase
 * Auto-generated types would go here after connecting to Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
export type LeadEstado = 
  | 'nuevo'
  | 'contactado'
  | 'calificado'
  | 'relevamiento_agendado'
  | 'relevamiento_realizado'
  | 'presupuesto_armado'
  | 'presupuesto_enviado'
  | 'negociacion'
  | 'aprobado'
  | 'en_obra'
  | 'finalizado'
  | 'perdido';

export type LeadOrigen = 
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'web'
  | 'referido'
  | 'google'
  | 'telefono'
  | 'otro';

export type TipoObra = 
  | 'reforma'
  | 'obra_nueva'
  | 'ampliacion'
  | 'mantenimiento'
  | 'piscina'
  | 'comercial'
  | 'otro';

export type UserRole = 'admin' | 'comercial' | 'obra' | 'administrativo';

export type PresupuestoEstado = 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'vencido';

export type ObraEstado = 'planificacion' | 'en_ejecucion' | 'pausada' | 'finalizada' | 'cancelada';

export type MensajeCanal = 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'interno';

export type MensajeDireccion = 'entrante' | 'saliente';

// Database Tables
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          role: UserRole;
          avatar_url: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          nombre: string;
          telefono: string | null;
          email: string | null;
          zona: string | null;
          direccion: string | null;
          origen: LeadOrigen;
          tipo_obra: TipoObra | null;
          presupuesto_estimado: number | null;
          urgencia: string | null;
          estado: LeadEstado;
          responsable_id: string | null;
          motivo_perdida: string | null;
          tags: string[];
          notas_internas: string | null;
          ultima_interaccion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      clientes: {
        Row: {
          id: string;
          lead_id: string | null;
          nombre: string;
          telefono: string;
          email: string | null;
          direccion: string | null;
          rut: string | null;
          tipo: 'particular' | 'empresa';
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
      };
      obras: {
        Row: {
          id: string;
          cliente_id: string;
          presupuesto_id: string | null;
          nombre: string;
          direccion: string;
          zona: string | null;
          tipo: TipoObra;
          estado: ObraEstado;
          fecha_inicio: string | null;
          fecha_fin_estimada: string | null;
          fecha_fin_real: string | null;
          responsable_id: string | null;
          porcentaje_avance: number;
          presupuesto_aprobado: number | null;
          costo_real: number;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['obras']['Row'], 'id' | 'created_at' | 'updated_at' | 'costo_real' | 'porcentaje_avance'>;
        Update: Partial<Database['public']['Tables']['obras']['Insert']>;
      };
      presupuestos: {
        Row: {
          id: string;
          lead_id: string | null;
          cliente_id: string | null;
          obra_id: string | null;
          numero: string;
          version: number;
          titulo: string;
          descripcion: string | null;
          items: Json;
          subtotal_mano_obra: number;
          subtotal_materiales: number;
          subtotal_viaticos: number;
          iva_porcentaje: number;
          iva_monto: number;
          total: number;
          estado: PresupuestoEstado;
          validez_dias: number;
          condiciones: string | null;
          pdf_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['presupuestos']['Row'], 'id' | 'created_at' | 'updated_at' | 'numero'>;
        Update: Partial<Database['public']['Tables']['presupuestos']['Insert']>;
      };
      mensajes: {
        Row: {
          id: string;
          lead_id: string | null;
          cliente_id: string | null;
          canal: MensajeCanal;
          external_thread_id: string | null;
          external_message_id: string | null;
          direccion: MensajeDireccion;
          contenido: string;
          media_url: string | null;
          media_type: string | null;
          leido: boolean;
          respondido: boolean;
          enviado_por: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mensajes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mensajes']['Insert']>;
      };
      actividades: {
        Row: {
          id: string;
          lead_id: string | null;
          cliente_id: string | null;
          obra_id: string | null;
          presupuesto_id: string | null;
          tipo: 'llamada' | 'mensaje' | 'email' | 'visita' | 'reunion' | 'nota' | 'cambio_estado' | 'presupuesto' | 'tarea' | 'otro';
          titulo: string;
          descripcion: string | null;
          metadata: Json | null;
          usuario_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['actividades']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['actividades']['Insert']>;
      };
      tareas: {
        Row: {
          id: string;
          obra_id: string | null;
          lead_id: string | null;
          titulo: string;
          descripcion: string | null;
          asignado_a: string | null;
          fecha_vencimiento: string | null;
          completada: boolean;
          prioridad: 'baja' | 'media' | 'alta' | 'urgente';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tareas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tareas']['Insert']>;
      };
      bitacora_obra: {
        Row: {
          id: string;
          obra_id: string;
          fecha: string;
          resumen: string;
          clima: string | null;
          incidentes: string | null;
          fotos: string[];
          usuario_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bitacora_obra']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bitacora_obra']['Insert']>;
      };
      gastos: {
        Row: {
          id: string;
          obra_id: string;
          fecha: string;
          proveedor: string | null;
          categoria: 'materiales' | 'mano_obra' | 'transporte' | 'herramientas' | 'permisos' | 'otros';
          descripcion: string;
          monto: number;
          comprobante_url: string | null;
          usuario_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gastos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['gastos']['Insert']>;
      };
    };
  };
}

// Helper types
export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type Cliente = Database['public']['Tables']['clientes']['Row'];
export type Obra = Database['public']['Tables']['obras']['Row'];
export type Presupuesto = Database['public']['Tables']['presupuestos']['Row'];
export type Mensaje = Database['public']['Tables']['mensajes']['Row'];
export type Actividad = Database['public']['Tables']['actividades']['Row'];
export type Tarea = Database['public']['Tables']['tareas']['Row'];
export type BitacoraObra = Database['public']['Tables']['bitacora_obra']['Row'];
export type Gasto = Database['public']['Tables']['gastos']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
