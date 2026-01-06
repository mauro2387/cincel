/**
 * Configuración Page - Ajustes del sistema
 */

import React, { useState } from 'react';
import {
  useConfigStore,
  Usuario,
  RolUsuario,
  Servicio,
  EtapaPipeline,
  PlantillaPresupuesto,
} from '../store/configStore';

// Iconos
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CatalogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Helpers
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(value);

const getRolColor = (rol: RolUsuario) => {
  switch (rol) {
    case 'admin':
      return 'bg-red-100 text-red-700';
    case 'gerente':
      return 'bg-purple-100 text-purple-700';
    case 'vendedor':
      return 'bg-blue-100 text-blue-700';
    case 'operativo':
      return 'bg-green-100 text-green-700';
    case 'contador':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

type SeccionConfig = 'usuarios' | 'servicios' | 'pipeline' | 'plantillas' | 'general';

// Sección de Usuarios
const SeccionUsuarios: React.FC = () => {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
          <p className="text-sm text-gray-500">Gestiona los usuarios y sus permisos</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {usuario.nombre.charAt(0)}
                    </div>
                    <span className="font-medium">{usuario.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{usuario.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRolColor(usuario.rol)}`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      usuario.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(usuario);
                        setShowModal(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar este usuario?')) {
                          deleteUsuario(usuario.id);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Sección de Servicios
const SeccionServicios: React.FC = () => {
  const { servicios, addServicio, updateServicio, deleteServicio } = useConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Catálogo de Servicios</h3>
          <p className="text-sm text-gray-500">Servicios que ofrece la empresa</p>
        </div>
        <button
          onClick={() => {
            setEditingServicio(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon /> Nuevo Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map((servicio) => (
          <div key={servicio.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: servicio.color || '#3B82F6' }}
              >
                <CatalogIcon />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingServicio(servicio);
                    setShowModal(true);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar este servicio?')) {
                      deleteServicio(servicio.id);
                    }
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-red-500"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{servicio.nombre}</h4>
            <p className="text-sm text-gray-500 mb-3">{servicio.descripcion}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(servicio.precio_base)}
              </span>
              <span className="text-xs text-gray-400">por {servicio.unidad}</span>
            </div>
            <span
              className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
                servicio.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {servicio.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sección de Pipeline
const SeccionPipeline: React.FC = () => {
  const { etapasPipeline, updateEtapaPipeline } = useConfigStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración del Pipeline</h3>
          <p className="text-sm text-gray-500">Define las etapas del proceso de ventas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orden</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Etapa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Color</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Probabilidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {etapasPipeline
              .sort((a, b) => a.orden - b.orden)
              .map((etapa) => (
                <tr key={etapa.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                      {etapa.orden}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{etapa.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: etapa.color }}
                      />
                      <span className="text-sm text-gray-500">{etapa.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${etapa.probabilidad_cierre}%`,
                            backgroundColor: etapa.color,
                          }}
                        />
                      </div>
                      <span className="text-sm">{etapa.probabilidad_cierre}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={etapa.activa}
                        onChange={(e) =>
                          updateEtapaPipeline(etapa.id, { activa: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Sección de Plantillas
const SeccionPlantillas: React.FC = () => {
  const { plantillasPresupuesto, addPlantillaPresupuesto, updatePlantillaPresupuesto, deletePlantillaPresupuesto } =
    useConfigStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plantillas de Presupuesto</h3>
          <p className="text-sm text-gray-500">Plantillas predefinidas para cotizaciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <PlusIcon /> Nueva Plantilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plantillasPresupuesto.map((plantilla) => (
          <div key={plantilla.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <TemplateIcon />
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  plantilla.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {plantilla.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{plantilla.nombre}</h4>
            <p className="text-sm text-gray-500 mb-3">{plantilla.descripcion}</p>

            <div className="text-sm text-gray-500 mb-3">
              <span>{plantilla.secciones.length} secciones</span>
              <span className="mx-2">•</span>
              <span>
                {plantilla.secciones.reduce((sum, s) => sum + s.items.length, 0)} items
              </span>
            </div>

            {/* Preview de secciones */}
            <div className="space-y-1">
              {plantilla.secciones.slice(0, 3).map((seccion) => (
                <div key={seccion.id} className="text-xs text-gray-400">
                  • {seccion.nombre} ({seccion.items.length} items)
                </div>
              ))}
              {plantilla.secciones.length > 3 && (
                <div className="text-xs text-gray-400">
                  + {plantilla.secciones.length - 3} más...
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                Editar
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Duplicar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sección General
const SeccionGeneral: React.FC = () => {
  const { configuracionGeneral, updateConfiguracionGeneral } = useConfigStore();

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
        <p className="text-sm text-gray-500">Ajustes generales del sistema</p>
      </div>

      <div className="space-y-6">
        {/* Información de la empresa */}
        <div className="bg-white rounded-xl border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Información de la Empresa</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nombre de la Empresa</label>
              <input
                type="text"
                value={configuracionGeneral.nombre_empresa}
                onChange={(e) =>
                  updateConfiguracionGeneral({ nombre_empresa: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">RFC</label>
              <input
                type="text"
                value={configuracionGeneral.rfc || ''}
                onChange={(e) =>
                  updateConfiguracionGeneral({ rfc: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Dirección</label>
              <input
                type="text"
                value={configuracionGeneral.direccion || ''}
                onChange={(e) =>
                  updateConfiguracionGeneral({ direccion: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Teléfono</label>
              <input
                type="text"
                value={configuracionGeneral.telefono || ''}
                onChange={(e) =>
                  updateConfiguracionGeneral({ telefono: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={configuracionGeneral.email || ''}
                onChange={(e) =>
                  updateConfiguracionGeneral({ email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Configuración de cotizaciones */}
        <div className="bg-white rounded-xl border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Configuración de Cotizaciones</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Moneda</label>
              <select
                value={configuracionGeneral.moneda}
                onChange={(e) =>
                  updateConfiguracionGeneral({ moneda: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">IVA (%)</label>
              <input
                type="number"
                value={configuracionGeneral.iva_porcentaje}
                onChange={(e) =>
                  updateConfiguracionGeneral({ iva_porcentaje: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Vigencia Presupuestos (días)</label>
              <input
                type="number"
                value={configuracionGeneral.vigencia_presupuesto_dias}
                onChange={(e) =>
                  updateConfiguracionGeneral({ vigencia_presupuesto_dias: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Prefijo Folios</label>
              <input
                type="text"
                value={configuracionGeneral.prefijo_folio || ''}
                onChange={(e) =>
                  updateConfiguracionGeneral({ prefijo_folio: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="bg-white rounded-xl border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Términos y Condiciones</h4>
          <textarea
            value={configuracionGeneral.terminos_condiciones || ''}
            onChange={(e) =>
              updateConfiguracionGeneral({ terminos_condiciones: e.target.value })
            }
            rows={6}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa los términos y condiciones que aparecerán en las cotizaciones..."
          />
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const ConfiguracionPage: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState<SeccionConfig>('usuarios');

  const secciones = [
    { id: 'usuarios' as SeccionConfig, label: 'Usuarios', icon: <UsersIcon /> },
    { id: 'servicios' as SeccionConfig, label: 'Servicios', icon: <CatalogIcon /> },
    { id: 'pipeline' as SeccionConfig, label: 'Pipeline', icon: <ChartIcon /> },
    { id: 'plantillas' as SeccionConfig, label: 'Plantillas', icon: <TemplateIcon /> },
    { id: 'general' as SeccionConfig, label: 'General', icon: <CogIcon /> },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Administra la configuración del sistema</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de navegación */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border p-2 space-y-1">
            {secciones.map((seccion) => (
              <button
                key={seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  seccionActiva === seccion.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {seccion.icon}
                <span className="font-medium">{seccion.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          {seccionActiva === 'usuarios' && <SeccionUsuarios />}
          {seccionActiva === 'servicios' && <SeccionServicios />}
          {seccionActiva === 'pipeline' && <SeccionPipeline />}
          {seccionActiva === 'plantillas' && <SeccionPlantillas />}
          {seccionActiva === 'general' && <SeccionGeneral />}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
