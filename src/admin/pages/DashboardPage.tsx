/**
 * Dashboard Page - Panel principal del admin
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useCrmStore } from '../store/crmStore';

// Iconos
const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{trend.value}% vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const DashboardPage: React.FC = () => {
  const { leads, clientes, obras, cotizaciones, actividades } = useCrmStore();

  // Métricas
  const leadsNuevos = leads.filter(l => l.estado === 'nuevo').length;
  const obrasActivas = obras.filter(o => o.estado === 'en_progreso').length;
  const cotizacionesPendientes = cotizaciones.filter(c => c.estado === 'pendiente').length;
  const totalCotizaciones = cotizaciones.reduce((acc, c) => acc + c.total, 0);

  // Últimas actividades
  const ultimasActividades = [...actividades]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  // Leads recientes
  const leadsRecientes = [...leads]
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Leads Nuevos"
          value={leadsNuevos}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Clientes Activos"
          value={clientes.filter(c => c.estado === 'activo').length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Obras en Progreso"
          value={obrasActivas}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          title="Cotizaciones"
          value={formatCurrency(totalCotizaciones)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Recientes */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Leads Recientes</h2>
            <Link to="/admin/leads" className="text-sm text-amber-600 hover:text-amber-700">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {leadsRecientes.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No hay leads</p>
            ) : (
              leadsRecientes.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lead.nombre}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                      <p className="text-sm text-gray-400 mt-1">{lead.tipoProyecto}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      lead.estado === 'nuevo' ? 'bg-blue-100 text-blue-700' :
                      lead.estado === 'contactado' ? 'bg-yellow-100 text-yellow-700' :
                      lead.estado === 'en_negociacion' ? 'bg-purple-100 text-purple-700' :
                      lead.estado === 'convertido' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {lead.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Actividad Reciente</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {ultimasActividades.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No hay actividades</p>
            ) : (
              ultimasActividades.map((actividad) => (
                <div key={actividad.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      actividad.tipo === 'llamada' ? 'bg-blue-500' :
                      actividad.tipo === 'email' ? 'bg-green-500' :
                      actividad.tipo === 'reunion' ? 'bg-purple-500' :
                      actividad.tipo === 'visita' ? 'bg-amber-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{actividad.titulo}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{actividad.descripcion}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(actividad.fecha)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Obras en Progreso */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Obras en Progreso</h2>
          <Link to="/admin/obras" className="text-sm text-amber-600 hover:text-amber-700">
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Obra</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Progreso</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {obras.filter(o => o.estado === 'en_progreso').length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No hay obras en progreso
                  </td>
                </tr>
              ) : (
                obras.filter(o => o.estado === 'en_progreso').map((obra) => {
                  const cliente = clientes.find(c => c.id === obra.clienteId);
                  return (
                    <tr key={obra.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{obra.nombre}</p>
                        <p className="text-sm text-gray-500">{obra.direccion}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{cliente?.nombre || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${obra.progreso}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{obra.progreso}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                          En progreso
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
