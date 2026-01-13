/**
 * ProveedoresPage - Directorio de proveedores
 */

import { useState, useEffect } from 'react';
import type { Supplier } from '../store/purchaseStore';
import { usePurchaseStore } from '../store/purchaseStore';

const SUPPLIER_CATEGORIES = [
  { id: 'materials', label: 'Materiales' },
  { id: 'equipment', label: 'Equipos' },
  { id: 'services', label: 'Servicios' },
  { id: 'labor', label: 'Mano de Obra' },
  { id: 'subcontract', label: 'Subcontratistas' },
  { id: 'other', label: 'Otros' },
];

export default function ProveedoresPage() {
  const { suppliers, isLoading, fetchSuppliers, addSupplier, updateSupplier } = usePurchaseStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || supplier.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        category: supplier.category || '',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', category: '', contact_name: '', phone: '', email: '', address: '', city: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, {
        name: formData.name,
        category: formData.category,
        contact_name: formData.contact_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null
      });
    } else {
      await addSupplier({
        name: formData.name,
        category: formData.category,
        contact_name: formData.contact_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null
      });
    }
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({ name: '', category: '', contact_name: '', phone: '', email: '', address: '', city: '' });
  };

  const categoryStats = SUPPLIER_CATEGORIES.map(cat => ({
    ...cat,
    count: suppliers.filter(s => s.category === cat.id).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500">Directorio de proveedores y contratistas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Nuevo Proveedor
        </button>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryStats.map(cat => (
          <div
            key={cat.id}
            onClick={() => setFilterCategory(filterCategory === cat.id ? 'all' : cat.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              filterCategory === cat.id ? 'bg-blue-100 border-blue-500 border-2' : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <p className="text-xs text-gray-500">{cat.label}</p>
            <p className="text-lg font-bold">{cat.count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">Todas las categorías</option>
          {SUPPLIER_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  {supplier.category && (
                    <span className="text-xs text-gray-500">
                      {SUPPLIER_CATEGORIES.find(c => c.id === supplier.category)?.label || supplier.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleOpenModal(supplier)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✏️
                </button>
              </div>
              
              <div className="mt-3 space-y-1 text-sm">
                {supplier.contact_name && (
                  <p className="text-gray-600">👤 {supplier.contact_name}</p>
                )}
                {supplier.phone && (
                  <p className="text-gray-600">
                    📞 <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline">{supplier.phone}</a>
                  </p>
                )}
                {supplier.email && (
                  <p className="text-gray-600">
                    ✉️ <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:underline">{supplier.email}</a>
                  </p>
                )}
                {supplier.address && (
                  <p className="text-gray-600">📍 {supplier.address}</p>
                )}
                {supplier.city && (
                  <p className="text-gray-600">🏙️ {supplier.city}</p>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                {supplier.rating > 0 && (
                  <span className="text-yellow-500">
                    {'★'.repeat(supplier.rating)}{'☆'.repeat(5 - supplier.rating)}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {supplier.total_orders} órdenes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSuppliers.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron proveedores</p>
          <button onClick={() => handleOpenModal()} className="mt-2 text-blue-600 hover:underline">
            Agregar el primero
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {SUPPLIER_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSupplier(null); }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSupplier ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
