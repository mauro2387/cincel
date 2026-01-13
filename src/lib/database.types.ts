/**
 * Database Types for Supabase - COS (Construction Operating System)
 * Tipos completos basados en setup_cos_completo.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// ENUMS ORIGINALES
// ============================================

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

// ============================================
// ENUMS COS - CAPA 1: Core
// ============================================

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'task' | 'approval' | 'alert';

// ============================================
// ENUMS COS - CAPA 2: Comercial
// ============================================

export type InteractionType = 'call' | 'email' | 'meeting' | 'whatsapp' | 'visit' | 'quote_sent' | 'negotiation' | 'other';
export type LostReasonCategory = 'price' | 'timing' | 'competition' | 'scope' | 'trust' | 'other';

// ============================================
// ENUMS COS - CAPA 3: Finanzas
// ============================================

export type BudgetVersionStatus = 'draft' | 'approved' | 'superseded';
export type BudgetItemCategory = 'material' | 'labor' | 'equipment' | 'subcontract' | 'overhead' | 'margin' | 'other';
export type PaymentType = 'income' | 'expense';
export type PaymentCategory = 'advance' | 'milestone' | 'partial' | 'retention' | 'final' | 'extra' | 'refund';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'check' | 'card' | 'other';
export type FinancialAlertType = 'budget_exceeded' | 'margin_risk' | 'overdue_payment' | 'cash_flow_negative' | 'cost_deviation' | 'milestone_delay';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================
// ENUMS COS - CAPA 4: Ejecución
// ============================================

export type SupplierType = 'material' | 'labor' | 'equipment' | 'subcontractor' | 'services' | 'other';
export type PurchaseRequestPriority = 'low' | 'normal' | 'high' | 'urgent';
export type PurchaseRequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'completed' | 'cancelled';
export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'partial_received' | 'received' | 'cancelled';
export type GoodsReceiptStatus = 'complete' | 'partial' | 'with_issues';
export type CrewType = 'own' | 'subcontractor';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'cold' | 'hot';

// ============================================
// ENUMS COS - CAPA 5: Control
// ============================================

export type ChangeOrderReason = 'client_request' | 'design_change' | 'site_condition' | 'regulation' | 'optimization' | 'error_correction' | 'other';
export type ChangeOrderType = 'addition' | 'deduction' | 'modification' | 'time_extension';
export type ChangeOrderStatus = 'draft' | 'pending_review' | 'pending_client' | 'approved' | 'rejected' | 'cancelled';
export type DocumentCategory = 'contract' | 'permit' | 'plan' | 'specification' | 'report' | 'photo' | 'invoice' | 'receipt' | 'correspondence' | 'change_order' | 'other';
export type ChecklistCategory = 'foundation' | 'structure' | 'electrical' | 'plumbing' | 'finishing' | 'safety' | 'final_inspection' | 'other';
export type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'approved';
export type ChecklistItemStatus = 'pending' | 'passed' | 'failed' | 'na';
export type IncidentType = 'safety' | 'quality' | 'environmental' | 'delay' | 'damage' | 'theft' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';

// ============================================
// ENUMS COS - CAPA 6: Inteligencia
// ============================================

export type LearningType = 'success' | 'failure' | 'improvement' | 'risk' | 'innovation';
export type PredictionType = 'cost_overrun' | 'delay_risk' | 'margin_loss' | 'cash_flow_issue' | 'quality_risk';

// ============================================
// INTERFACES COS - Nuevas Tablas
// ============================================

// CAPA 1: Core
export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;
  old_data: Json | null;
  new_data: Json | null;
  changed_fields: string[] | null;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  reason: string | null;
  created_at: string;
}

export interface Permission {
  id: string;
  role: string;
  module: string;
  action: PermissionAction;
  allowed: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  read_at: string | null;
  metadata: Json | null;
  created_at: string;
}

// CAPA 2: Comercial
export interface LeadInteraction {
  id: string;
  lead_id: string;
  type: InteractionType;
  description: string;
  outcome: string | null;
  next_action: string | null;
  next_action_date: string | null;
  duration_minutes: number | null;
  user_id: string | null;
  created_at: string;
}

export interface LostReason {
  id: string;
  name: string;
  description: string | null;
  category: LostReasonCategory | null;
  active: boolean;
  count: number;
  created_at: string;
}

// CAPA 3: Finanzas
export interface BudgetVersion {
  id: string;
  project_id: string;
  version_number: number;
  name: string;
  description: string | null;
  total_amount: number;
  margin_percentage: number | null;
  status: BudgetVersionStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  budget_version_id: string;
  parent_id: string | null;
  code: string;
  description: string;
  unit: string | null;
  quantity: number | null;
  unit_price: number | null;
  total: number;
  category: BudgetItemCategory | null;
  order_number: number;
  level: number;
  is_summary: boolean;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  type: PaymentType;
  category: PaymentCategory;
  concept: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  due_date: string | null;
  paid_date: string | null;
  status: PaymentStatus;
  paid_amount: number;
  payment_method: PaymentMethod | null;
  reference: string | null;
  invoice_number: string | null;
  client_id: string | null;
  supplier_id: string | null;
  notes: string | null;
  attachments: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashFlowProjection {
  id: string;
  project_id: string | null;
  period_start: string;
  period_end: string;
  projected_income: number;
  projected_expense: number;
  actual_income: number;
  actual_expense: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialAlert {
  id: string;
  project_id: string | null;
  type: FinancialAlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  threshold_value: number | null;
  current_value: number | null;
  deviation_percentage: number | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// CAPA 4: Ejecución
export interface Supplier {
  id: string;
  code: string | null;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  type: SupplierType | null;
  category: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  website: string | null;
  bank_name: string | null;
  bank_account: string | null;
  payment_terms: number;
  credit_limit: number | null;
  rating: number | null;
  total_purchases: number;
  total_orders: number;
  notes: string | null;
  tags: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Crew {
  id: string;
  name: string;
  type: CrewType | null;
  supervisor: string | null;
  supervisor_phone: string | null;
  specialty: string | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  supplier_id: string | null;
  members_count: number;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  name: string;
  document_id: string | null;
  role: string | null;
  specialty: string | null;
  hourly_rate: number | null;
  phone: string | null;
  emergency_contact: string | null;
  active: boolean;
  created_at: string;
}

export interface GoodsReceipt {
  id: string;
  code: string;
  purchase_order_id: string;
  project_id: string;
  receipt_date: string;
  received_by: string;
  delivery_note: string | null;
  status: GoodsReceiptStatus;
  notes: string | null;
  photos: string[] | null;
  created_at: string;
}

export interface GoodsReceiptItem {
  id: string;
  goods_receipt_id: string;
  purchase_order_item_id: string;
  quantity_received: number;
  quantity_rejected: number;
  rejection_reason: string | null;
  created_at: string;
}

export interface WorkLog {
  id: string;
  project_id: string;
  date: string;
  weather: Weather | null;
  temperature_min: number | null;
  temperature_max: number | null;
  work_started: string | null;
  work_ended: string | null;
  total_hours: number | null;
  summary: string;
  progress_description: string | null;
  progress_percentage: number | null;
  issues: string | null;
  decisions: string | null;
  visitors: string | null;
  safety_incidents: string | null;
  materials_used: string | null;
  equipment_used: string | null;
  next_day_plan: string | null;
  supervisor: string;
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

// CAPA 5: Control
export interface ChangeOrder {
  id: string;
  code: string;
  project_id: string;
  title: string;
  description: string;
  reason: ChangeOrderReason;
  type: ChangeOrderType;
  status: ChangeOrderStatus;
  original_budget: number | null;
  cost_impact: number;
  new_budget: number | null;
  original_days: number | null;
  time_impact_days: number;
  new_deadline: string | null;
  requested_by: string;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  client_approved: boolean | null;
  client_approved_at: string | null;
  client_approved_by: string | null;
  final_approved_by: string | null;
  final_approved_at: string | null;
  rejection_reason: string | null;
  attachments: string[] | null;
  client_signature_url: string | null;
  notes: string | null;
  invoiced: boolean;
  invoice_id: string | null;
  invoiced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  category: DocumentCategory;
  name: string;
  description: string | null;
  current_version: number;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  file_size: number | null;
  change_summary: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface QualityChecklist {
  id: string;
  project_id: string;
  name: string;
  category: ChecklistCategory;
  status: ChecklistStatus;
  due_date: string | null;
  completed_date: string | null;
  inspector: string | null;
  approved_by: string | null;
  approved_at: string | null;
  score: number | null;
  notes: string | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  order_number: number;
  description: string;
  category: string | null;
  status: ChecklistItemStatus;
  notes: string | null;
  photo_url: string | null;
  checked_by: string | null;
  checked_at: string | null;
  created_at: string;
}

export interface Incident {
  id: string;
  code: string;
  project_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: string | null;
  date_occurred: string;
  date_reported: string;
  reported_by: string;
  witnesses: string | null;
  immediate_actions: string | null;
  root_cause: string | null;
  corrective_actions: string | null;
  preventive_actions: string | null;
  cost_impact: number | null;
  time_impact_days: number | null;
  status: IncidentStatus;
  resolved_at: string | null;
  resolved_by: string | null;
  photos: string[] | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

// CAPA 6: Inteligencia
export interface CostAnalytics {
  id: string;
  project_id: string | null;
  project_type: string | null;
  category: string;
  subcategory: string | null;
  unit: string | null;
  unit_cost: number;
  total_quantity: number | null;
  total_cost: number | null;
  budget_vs_real_percentage: number | null;
  region: string | null;
  year: number | null;
  month: number | null;
  created_at: string;
}

export interface SupplierRating {
  id: string;
  supplier_id: string;
  project_id: string | null;
  purchase_order_id: string | null;
  rating_quality: number | null;
  rating_delivery: number | null;
  rating_price: number | null;
  rating_service: number | null;
  overall_rating: number | null;
  comments: string | null;
  rated_by: string | null;
  created_at: string;
}

export interface ProjectLearning {
  id: string;
  project_id: string;
  type: LearningType;
  category: string | null;
  title: string;
  description: string;
  impact: string | null;
  recommendation: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
}

export interface AIPrediction {
  id: string;
  project_id: string | null;
  prediction_type: PredictionType;
  confidence: number | null;
  predicted_value: number | null;
  actual_value: number | null;
  prediction_date: string;
  target_date: string | null;
  factors: Json | null;
  recommendation: string | null;
  accuracy_score: number | null;
  created_at: string;
}

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
