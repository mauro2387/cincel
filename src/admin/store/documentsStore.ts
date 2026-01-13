/**
 * Documents Store - Gestión de Documentos y Archivos
 */

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Document, DocumentVersion, DocumentCategory } from '../../lib/database.types';

export interface DocumentWithVersions extends Document {
  versions?: DocumentVersion[];
  latestVersion?: DocumentVersion;
}

interface DocumentsState {
  documents: DocumentWithVersions[];
  selectedDocumentId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    projectId?: string;
    category?: DocumentCategory;
    searchQuery?: string;
  };
  
  // CRUD Documents
  fetchDocuments: (projectId?: string) => Promise<void>;
  addDocument: (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Document Versions
  addVersion: (version: Omit<DocumentVersion, 'id' | 'created_at'>) => Promise<void>;
  
  // Selection & Filters
  selectDocument: (id: string | null) => void;
  setFilters: (filters: Partial<DocumentsState['filters']>) => void;
  clearFilters: () => void;
  
  // Getters
  getDocumentById: (id: string) => DocumentWithVersions | undefined;
  getFilteredDocuments: () => DocumentWithVersions[];
  getDocumentsByProject: (projectId: string) => DocumentWithVersions[];
  getDocumentsByCategory: (category: DocumentCategory) => DocumentWithVersions[];
  getRecentDocuments: (limit?: number) => DocumentWithVersions[];
}

// Demo data
const DEMO_DOCUMENTS: DocumentWithVersions[] = [
  {
    id: 'doc-1',
    project_id: 'project-1',
    name: 'Plano Arquitectónico - Planta Baja',
    description: 'Plano de distribución planta baja con cotas y especificaciones',
    category: 'plan',
    file_url: '/documents/plano-pb-v3.pdf',
    file_type: 'application/pdf',
    file_size: 2500000,
    current_version: 3,
    tags: ['arquitectura', 'planta baja', 'distribución'],
    uploaded_by: 'user-1',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-03-05T15:30:00Z',
    versions: [
      {
        id: 'ver-1',
        document_id: 'doc-1',
        version_number: 1,
        file_url: '/documents/plano-pb-v1.pdf',
        file_size: 2200000,
        change_summary: 'Versión inicial',
        uploaded_by: 'user-1',
        created_at: '2024-01-10T10:00:00Z',
      },
      {
        id: 'ver-2',
        document_id: 'doc-1',
        version_number: 2,
        file_url: '/documents/plano-pb-v2.pdf',
        file_size: 2350000,
        change_summary: 'Corrección de cotas en cocina',
        uploaded_by: 'user-1',
        created_at: '2024-02-15T11:00:00Z',
      },
      {
        id: 'ver-3',
        document_id: 'doc-1',
        version_number: 3,
        file_url: '/documents/plano-pb-v3.pdf',
        file_size: 2500000,
        change_summary: 'Actualización según modificaciones del cliente',
        uploaded_by: 'user-1',
        created_at: '2024-03-05T15:30:00Z',
      },
    ],
  },
  {
    id: 'doc-2',
    project_id: 'project-1',
    name: 'Plano Eléctrico',
    description: 'Instalación eléctrica completa con tableros y circuitos',
    category: 'plan',
    file_url: '/documents/plano-electrico-v2.pdf',
    file_type: 'application/pdf',
    file_size: 1800000,
    current_version: 2,
    tags: ['eléctrico', 'instalaciones', 'circuitos'],
    uploaded_by: 'user-1',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-02-20T09:00:00Z',
    versions: [
      {
        id: 'ver-4',
        document_id: 'doc-2',
        version_number: 1,
        file_url: '/documents/plano-electrico-v1.pdf',
        file_size: 1700000,
        change_summary: 'Versión inicial',
        uploaded_by: 'user-1',
        created_at: '2024-01-15T14:00:00Z',
      },
      {
        id: 'ver-5',
        document_id: 'doc-2',
        version_number: 2,
        file_url: '/documents/plano-electrico-v2.pdf',
        file_size: 1800000,
        change_summary: 'Agregado circuito de aire acondicionado',
        uploaded_by: 'user-2',
        created_at: '2024-02-20T09:00:00Z',
      },
    ],
  },
  {
    id: 'doc-3',
    project_id: 'project-1',
    name: 'Contrato de Obra',
    description: 'Contrato principal firmado con el cliente',
    category: 'contract',
    file_url: '/documents/contrato-obra-001.pdf',
    file_type: 'application/pdf',
    file_size: 350000,
    current_version: 1,
    tags: ['contrato', 'legal', 'firmado'],
    uploaded_by: 'user-1',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
    versions: [
      {
        id: 'ver-6',
        document_id: 'doc-3',
        version_number: 1,
        file_url: '/documents/contrato-obra-001.pdf',
        file_size: 350000,
        change_summary: 'Contrato firmado',
        uploaded_by: 'user-1',
        created_at: '2024-01-05T10:00:00Z',
      },
    ],
  },
  {
    id: 'doc-4',
    project_id: 'project-1',
    name: 'Permiso de Construcción',
    description: 'Permiso municipal de construcción aprobado',
    category: 'permit',
    file_url: '/documents/permiso-construccion.pdf',
    file_type: 'application/pdf',
    file_size: 520000,
    current_version: 1,
    tags: ['permiso', 'municipal', 'legal'],
    uploaded_by: 'user-1',
    created_at: '2024-01-08T11:00:00Z',
    updated_at: '2024-01-08T11:00:00Z',
    versions: [],
  },
  {
    id: 'doc-5',
    project_id: 'project-1',
    name: 'Memoria Descriptiva',
    description: 'Memoria descriptiva del proyecto con especificaciones técnicas',
    category: 'specification',
    file_url: '/documents/memoria-descriptiva.pdf',
    file_type: 'application/pdf',
    file_size: 890000,
    current_version: 1,
    tags: ['especificaciones', 'técnico', 'descripción'],
    uploaded_by: 'user-1',
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-12T09:00:00Z',
    versions: [],
  },
  {
    id: 'doc-6',
    project_id: 'project-1',
    name: 'Fotos Avance Febrero',
    description: 'Registro fotográfico del avance de obra - Febrero 2024',
    category: 'photo',
    file_url: '/documents/fotos-febrero-2024.zip',
    file_type: 'application/zip',
    file_size: 45000000,
    current_version: 1,
    tags: ['fotos', 'avance', 'febrero'],
    uploaded_by: 'user-2',
    created_at: '2024-03-01T16:00:00Z',
    updated_at: '2024-03-01T16:00:00Z',
    versions: [],
  },
  {
    id: 'doc-7',
    project_id: 'project-2',
    name: 'Presupuesto Detallado',
    description: 'Presupuesto detallado con desglose de rubros',
    category: 'report',
    file_url: '/documents/presupuesto-proyecto2.xlsx',
    file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size: 125000,
    current_version: 1,
    tags: ['presupuesto', 'costos', 'rubros'],
    uploaded_by: 'user-1',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    versions: [],
  },
  {
    id: 'doc-8',
    project_id: 'project-1',
    name: 'Certificado de Bomberos',
    description: 'Certificado de seguridad contra incendios',
    category: 'permit',
    file_url: '/documents/certificado-bomberos.pdf',
    file_type: 'application/pdf',
    file_size: 180000,
    current_version: 1,
    tags: ['bomberos', 'seguridad', 'certificado'],
    uploaded_by: 'user-1',
    created_at: '2024-02-28T14:00:00Z',
    updated_at: '2024-02-28T14:00:00Z',
    versions: [],
  },
];

const generateId = () => crypto.randomUUID();

export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: DEMO_DOCUMENTS,
  selectedDocumentId: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchDocuments: async (projectId) => {
    if (!isSupabaseConfigured() || !supabase) {
      const filtered = projectId 
        ? DEMO_DOCUMENTS.filter(d => d.project_id === projectId)
        : DEMO_DOCUMENTS;
      set({ documents: filtered });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('documents').select('*').order('updated_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data: docsData, error: docsError } = await query;
      
      if (docsError) throw docsError;
      
      // Fetch versions for all documents
      const { data: versionsData, error: versionsError } = await supabase
        .from('document_versions')
        .select('*')
        .order('version_number', { ascending: false });
      
      if (versionsError) throw versionsError;
      
      const documents = (docsData || []).map((doc: Document) => {
        const versions = (versionsData || []).filter((v: DocumentVersion) => v.document_id === doc.id);
        return {
          ...doc,
          versions,
          latestVersion: versions[0],
        };
      });
      
      set({ documents, isLoading: false });
    } catch (error) {
      console.error('Error fetching documents:', error);
      set({ error: 'Error al cargar documentos', isLoading: false });
    }
  },

  addDocument: async (documentData) => {
    const newDocument: DocumentWithVersions = {
      ...documentData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [],
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({ documents: [newDocument, ...state.documents] }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({ documents: [{ ...data, versions: [] }, ...state.documents] }));
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  updateDocument: async (id, data) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        documents: state.documents.map(d => d.id === id ? { ...d, ...data, updated_at: new Date().toISOString() } : d)
      }));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('documents')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        documents: state.documents.map(d => d.id === id ? { ...d, ...data, updated_at: new Date().toISOString() } : d)
      }));
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  deleteDocument: async (id) => {
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        documents: state.documents.filter(d => d.id !== id),
        selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId
      }));
      return;
    }
    
    try {
      // Versions are deleted via cascade
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        documents: state.documents.filter(d => d.id !== id),
        selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId
      }));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  addVersion: async (versionData) => {
    const newVersion: DocumentVersion = {
      ...versionData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    
    if (!isSupabaseConfigured() || !supabase) {
      set(state => ({
        documents: state.documents.map(d => {
          if (d.id === versionData.document_id) {
            const versions = [newVersion, ...(d.versions || [])];
            return {
              ...d,
              versions,
              current_version: versionData.version_number,
              file_url: versionData.file_url,
              file_size: versionData.file_size,
              latestVersion: newVersion,
              updated_at: new Date().toISOString(),
            };
          }
          return d;
        })
      }));
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .insert(versionData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update document with new version info
      await supabase
        .from('documents')
        .update({
          current_version: versionData.version_number,
          file_url: versionData.file_url,
          file_size: versionData.file_size,
          updated_at: new Date().toISOString(),
        })
        .eq('id', versionData.document_id);
      
      set(state => ({
        documents: state.documents.map(d => {
          if (d.id === versionData.document_id) {
            const versions = [data, ...(d.versions || [])];
            return {
              ...d,
              versions,
              current_version: versionData.version_number,
              file_url: versionData.file_url,
              file_size: versionData.file_size,
              latestVersion: data,
              updated_at: new Date().toISOString(),
            };
          }
          return d;
        })
      }));
    } catch (error) {
      console.error('Error adding version:', error);
      throw error;
    }
  },

  selectDocument: (id) => {
    set({ selectedDocumentId: id });
  },

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters } }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  getDocumentById: (id) => {
    return get().documents.find(d => d.id === id);
  },

  getFilteredDocuments: () => {
    const { documents, filters } = get();
    
    return documents.filter(doc => {
      if (filters.projectId && doc.project_id !== filters.projectId) return false;
      if (filters.category && doc.category !== filters.category) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(query);
        const matchesDescription = doc.description?.toLowerCase().includes(query);
        const matchesTags = doc.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }
      return true;
    });
  },

  getDocumentsByProject: (projectId) => {
    return get().documents.filter(d => d.project_id === projectId);
  },

  getDocumentsByCategory: (category) => {
    return get().documents.filter(d => d.category === category);
  },

  getRecentDocuments: (limit = 10) => {
    return [...get().documents]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit);
  },
}));

// Helper constants
export const DOCUMENT_CATEGORIES = [
  { value: 'plans', label: 'Planos', icon: '📐', color: 'bg-blue-500' },
  { value: 'contracts', label: 'Contratos', icon: '📝', color: 'bg-purple-500' },
  { value: 'permits', label: 'Permisos', icon: '📋', color: 'bg-green-500' },
  { value: 'specifications', label: 'Especificaciones', icon: '📖', color: 'bg-yellow-500' },
  { value: 'reports', label: 'Informes', icon: '📊', color: 'bg-orange-500' },
  { value: 'invoices', label: 'Facturas', icon: '💰', color: 'bg-emerald-500' },
  { value: 'photos', label: 'Fotos', icon: '📷', color: 'bg-pink-500' },
  { value: 'correspondence', label: 'Correspondencia', icon: '✉️', color: 'bg-indigo-500' },
  { value: 'other', label: 'Otros', icon: '📁', color: 'bg-gray-500' },
];

export const getCategoryConfig = (category: DocumentCategory) => {
  return DOCUMENT_CATEGORIES.find(c => c.value === category) || DOCUMENT_CATEGORIES[8];
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
  if (fileType.includes('document') || fileType.includes('word')) return '📝';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
  if (fileType.includes('video')) return '🎬';
  return '📁';
};
