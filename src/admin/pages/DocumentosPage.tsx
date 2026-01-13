/**
 * DocumentosPage - Página de Gestión Documental
 * Administración de documentos y archivos del proyecto
 */

import { useState, useEffect } from 'react';
import { 
  useDocumentsStore, 
  DOCUMENT_CATEGORIES, 
  getCategoryConfig, 
  formatFileSize,
  getFileIcon 
} from '../store/documentsStore';
import { useObrasStore } from '../store/obrasStore';
import type { DocumentCategory } from '../../lib/database.types';

export default function DocumentosPage() {
  const { 
    documents, 
    fetchDocuments, 
    addDocument, 
    deleteDocument,
    selectDocument,
    selectedDocumentId,
    getFilteredDocuments,
    setFilters,

    filters,
    isLoading 
  } = useDocumentsStore();
  const { obras } = useObrasStore();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Upload form
  const [newDocument, setNewDocument] = useState({
    project_id: '',
    name: '',
    description: '',
    category: 'other' as DocumentCategory,
    tags: [] as string[],
    file_url: '',
    file_type: 'application/pdf',
    file_size: 0,
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    setFilters({ searchQuery });
  }, [searchQuery, setFilters]);

  const filteredDocuments = getFilteredDocuments();
  const selectedDocument = documents.find(d => d.id === selectedDocumentId);

  const handleUpload = async () => {
    if (!newDocument.name || !newDocument.project_id) return;
    
    await addDocument({
      ...newDocument,
      current_version: 1,
      uploaded_by: 'current-user',
    });
    
    setNewDocument({
      project_id: '',
      name: '',
      description: '',
      category: 'other',
      tags: [],
      file_url: '',
      file_type: 'application/pdf',
      file_size: 0,
    });
    setShowUploadModal(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newDocument.tags.includes(tagInput.trim())) {
      setNewDocument(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewDocument(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getProjectName = (projectId: string) => {
    const obra = obras.find(o => o.id === projectId);
    return obra?.nombre || 'Proyecto no encontrado';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Stats by category
  const categoryStats = DOCUMENT_CATEGORIES.map(cat => ({
    ...cat,
    count: documents.filter(d => d.category === cat.value).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600">Gestión documental de proyectos</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>📤</span>
          Subir Documento
        </button>
      </div>

      {/* Category Stats */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilters({ category: undefined })}
          className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
            !filters.category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📁 Todos ({documents.length})
        </button>
        {categoryStats.filter(c => c.count > 0).map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilters({ category: cat.value as DocumentCategory })}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
              filters.category === cat.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.icon} {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Search & View Toggle */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar documentos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.projectId || ''}
              onChange={(e) => setFilters({ projectId: e.target.value || undefined })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los proyectos</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>{obra.nombre}</option>
              ))}
            </select>
            
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <span className="text-4xl mb-4 block">📂</span>
          <h3 className="text-lg font-medium text-gray-900">No hay documentos</h3>
          <p className="text-gray-500">
            {searchQuery ? 'No se encontraron documentos con ese criterio' : 'Sube tu primer documento'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDocuments.map(doc => {
            const catConfig = getCategoryConfig(doc.category);
            return (
              <div 
                key={doc.id}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => {
                  selectDocument(doc.id);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-lg ${catConfig.color} flex items-center justify-center text-white text-3xl mb-3`}>
                    {getFileIcon(doc.file_type || 'application/octet-stream')}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.file_size || 0)}
                  </p>
                  <span className={`mt-2 px-2 py-0.5 text-xs rounded ${catConfig.color} text-white`}>
                    {catConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Proyecto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Tamaño</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Versión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map(doc => {
                const catConfig = getCategoryConfig(doc.category);
                return (
                  <tr 
                    key={doc.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      selectDocument(doc.id);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(doc.file_type || 'application/octet-stream')}</span>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{doc.name}</p>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {doc.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {getProjectName(doc.project_id)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs rounded ${catConfig.color} text-white`}>
                        {catConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {formatFileSize(doc.file_size || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(doc.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      v{doc.current_version}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">📤 Subir Documento</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
                  <select
                    value={newDocument.project_id}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    {obras.map(obra => (
                      <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del documento"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value as DocumentCategory }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Archivo (simulado)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <span className="text-4xl mb-2 block">📁</span>
                    <p className="text-gray-500 text-sm">Click para seleccionar o arrastra un archivo</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, IMG hasta 50MB</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Agregar etiqueta"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      ➕
                    </button>
                  </div>
                  {newDocument.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newDocument.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-400 hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!newDocument.name || !newDocument.project_id}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Subir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {showDetailModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-lg ${getCategoryConfig(selectedDocument.category).color} flex items-center justify-center text-white text-3xl`}>
                    {getFileIcon(selectedDocument.file_type || 'application/octet-stream')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedDocument.name}</h2>
                    <p className="text-gray-500">{getProjectName(selectedDocument.project_id)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${getCategoryConfig(selectedDocument.category).color} text-white`}>
                        {getCategoryConfig(selectedDocument.category).label}
                      </span>
                      <span className="text-xs text-gray-400">v{selectedDocument.current_version}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    selectDocument(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tamaño:</span>
                  <span className="ml-2 font-medium">{formatFileSize(selectedDocument.file_size || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="ml-2 font-medium">{selectedDocument.file_type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Creado:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedDocument.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Actualizado:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedDocument.updated_at)}</span>
                </div>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Descripción</h4>
                  <p className="text-gray-600">{selectedDocument.description}</p>
                </div>
              )}
              
              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Versions */}
              {selectedDocument.versions && selectedDocument.versions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Historial de Versiones</h4>
                  <div className="space-y-2">
                    {selectedDocument.versions.map(version => (
                      <div 
                        key={version.id}
                        className={`p-3 rounded-lg border ${version.version_number === selectedDocument.current_version ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">Versión {version.version_number}</span>
                            {version.version_number === selectedDocument.current_version && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Actual</span>
                            )}
                            <p className="text-sm text-gray-500 mt-1">{version.change_summary || ''}</p>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p>{formatDate(version.created_at)}</p>
                            <p>{formatFileSize(version.file_size || 0)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📥 Descargar
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📤 Nueva Versión
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar este documento?')) {
                      deleteDocument(selectedDocument.id);
                      setShowDetailModal(false);
                      selectDocument(null);
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
