/**
 * Clientes Page V2 - Gestión completa de clientes
 */

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useClientesStore } from '../store/clientesStore';
import type { Cliente, TipoCliente, EstadoCliente } from '../store/clientesStore';

// Iconos
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Helpers
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(value);

const getTipoColor = (tipo: TipoCliente) => {
  switch (tipo) {
    case 'particular':
      return 'bg-blue-100 text-blue-700';
    case 'empresa':
      return 'bg-purple-100 text-purple-700';
    case 'gobierno':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getEstadoColor = (estado: EstadoCliente) => {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-700';
    case 'inactivo':
      return 'bg-gray-100 text-gray-700';
    case 'potencial':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Componente Card de Cliente
const ClienteCard: React.FC<{
  cliente: Cliente;
  onClick: () => void;
}> = ({ cliente, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
          {cliente.tipo === 'empresa' ? <BuildingIcon /> : <UserIcon />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{cliente.nombre}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${getTipoColor(cliente.tipo)}`}>
              {cliente.tipo}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${getEstadoColor(cliente.estado)}`}>
              {cliente.estado}
            </span>
          </div>

          {cliente.contacto_nombre && (
            <p className="text-sm text-gray-500">{cliente.contacto_nombre}</p>
          )}

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {cliente.telefono && (
              <span className="flex items-center gap-1">
                <PhoneIcon /> {cliente.telefono}
              </span>
            )}
            {cliente.email && (
              <span className="flex items-center gap-1">
                <EmailIcon /> {cliente.email}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-3 pt-3 border-t">
            <div>
              <p className="text-xs text-gray-500">Obras</p>
              <p className="font-medium">{cliente.total_obras || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Facturado</p>
              <p className="font-medium">{formatCurrency(cliente.total_facturado || 0)}</p>
            </div>
            {cliente.vendedor_asignado && (
              <div>
                <p className="text-xs text-gray-500">Vendedor</p>
                <p className="font-medium">{cliente.vendedor_asignado}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Detalle Cliente
const ClienteDetailModal: React.FC<{
  cliente: Cliente;
  onClose: () => void;
}> = ({ cliente, onClose }) => {
  const { getNotasByCliente, addNota } = useClientesStore();
  const notas = getNotasByCliente(cliente.id);
  const [activeTab, setActiveTab] = useState<'info' | 'notas' | 'historial'>('info');
  const [newNota, setNewNota] = useState('');

  const handleAddNota = () => {
    if (newNota.trim()) {
      addNota({
        cliente_id: cliente.id,
        contenido: newNota.trim(),
        created_by: 'Usuario',
      });
      setNewNota('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                {cliente.tipo === 'empresa' ? <BuildingIcon /> : <UserIcon />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{cliente.nombre}</h2>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getTipoColor(cliente.tipo)}`}>
                    {cliente.tipo}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getEstadoColor(cliente.estado)}`}>
                    {cliente.estado}
                  </span>
                </div>
                {cliente.contacto_nombre && (
                  <p className="text-gray-500">{cliente.contacto_nombre} {cliente.contacto_cargo && `• ${cliente.contacto_cargo}`}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XIcon />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Total Obras</p>
              <p className="text-xl font-semibold">{cliente.total_obras || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Total Facturado</p>
              <p className="text-xl font-semibold">{formatCurrency(cliente.total_facturado || 0)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Crédito</p>
              <p className="text-xl font-semibold">
                {cliente.credito_disponible ? formatCurrency(cliente.limite_credito || 0) : 'No'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Vendedor</p>
              <p className="text-xl font-semibold">{cliente.vendedor_asignado || '-'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {[
            { id: 'info', label: 'Información' },
            { id: 'notas', label: 'Notas', count: notas.length },
            { id: 'historial', label: 'Historial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Contacto */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  {cliente.telefono && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{cliente.telefono}</p>
                      </div>
                    </div>
                  )}
                  {cliente.celular && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon />
                      <div>
                        <p className="text-sm text-gray-500">Celular</p>
                        <p className="font-medium">{cliente.celular}</p>
                      </div>
                    </div>
                  )}
                  {cliente.email && (
                    <div className="flex items-center gap-3">
                      <EmailIcon />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{cliente.email}</p>
                      </div>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-center gap-3">
                      <LocationIcon />
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium">
                          {cliente.direccion}
                          {cliente.ciudad && `, ${cliente.ciudad}`}
                          {cliente.estado_geografico && `, ${cliente.estado_geografico}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fiscal */}
              {cliente.tipo === 'empresa' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Información Fiscal</h3>
                  <div className="space-y-3">
                    {cliente.razon_social && (
                      <div>
                        <p className="text-sm text-gray-500">Razón Social</p>
                        <p className="font-medium">{cliente.razon_social}</p>
                      </div>
                    )}
                    {cliente.rfc && (
                      <div>
                        <p className="text-sm text-gray-500">RFC</p>
                        <p className="font-medium">{cliente.rfc}</p>
                      </div>
                    )}
                    {cliente.regimen_fiscal && (
                      <div>
                        <p className="text-sm text-gray-500">Régimen Fiscal</p>
                        <p className="font-medium">{cliente.regimen_fiscal}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comercial */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Información Comercial</h3>
                <div className="space-y-3">
                  {cliente.origen && (
                    <div>
                      <p className="text-sm text-gray-500">Origen</p>
                      <p className="font-medium">{cliente.origen}</p>
                    </div>
                  )}
                  {cliente.referido_por && (
                    <div>
                      <p className="text-sm text-gray-500">Referido por</p>
                      <p className="font-medium">{cliente.referido_por}</p>
                    </div>
                  )}
                  {cliente.credito_disponible && (
                    <div>
                      <p className="text-sm text-gray-500">Crédito</p>
                      <p className="font-medium">
                        {formatCurrency(cliente.limite_credito || 0)} • {cliente.dias_credito} días
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Etiquetas */}
              {cliente.etiquetas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.etiquetas.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notas' && (
            <div>
              {/* Nueva nota */}
              <div className="mb-6">
                <textarea
                  value={newNota}
                  onChange={(e) => setNewNota(e.target.value)}
                  placeholder="Escribe una nota..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddNota}
                    disabled={!newNota.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Agregar Nota
                  </button>
                </div>
              </div>

              {/* Lista de notas */}
              <div className="space-y-4">
                {notas.map((nota) => (
                  <div key={nota.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{nota.contenido}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <span>{nota.created_by}</span>
                      <span>•</span>
                      <span>{format(parseISO(nota.created_at), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                    </div>
                  </div>
                ))}
                {notas.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay notas</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="text-center text-gray-500 py-8">
              <p>Próximamente: Historial de obras y cotizaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const ClientesPageV2: React.FC = () => {
  const {
    getClientesFiltrados,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    filtroEstado,
    setFiltroEstado,
    clientes,
  } = useClientesStore();

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const clientesFiltrados = getClientesFiltrados();

  // Stats
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter((c) => c.estado === 'activo').length;
  const clientesEmpresa = clientes.filter((c) => c.tipo === 'empresa').length;
  const totalFacturado = clientes.reduce((sum, c) => sum + (c.total_facturado || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gestiona tu cartera de clientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <PlusIcon /> Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900">{totalClientes}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Clientes Activos</p>
          <p className="text-2xl font-bold text-green-600">{clientesActivos}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Empresas</p>
          <p className="text-2xl font-bold text-purple-600">{clientesEmpresa}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total Facturado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFacturado)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {(['todos', 'particular', 'empresa'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === tipo
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['todos', 'activo', 'potencial', 'inactivo'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? estado === 'activo'
                    ? 'bg-green-100 text-green-700'
                    : estado === 'potencial'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {estado === 'todos' ? 'Todos' : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientesFiltrados.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onClick={() => setSelectedCliente(cliente)}
          />
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      )}

      {/* Modal detalle */}
      {selectedCliente && (
        <ClienteDetailModal
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </div>
  );
};

export default ClientesPageV2;
