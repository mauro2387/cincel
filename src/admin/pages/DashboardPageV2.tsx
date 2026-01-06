/**
 * Dashboard Page V2 - Dashboard mejorado con KPIs y gráficas
 */

import React, { useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDashboardStore } from '../store/dashboardStore';
import { useInboxStore } from '../store/inboxStore';
import { useTareasStore } from '../store/tareasStore';
import { useObrasStore } from '../store/obrasStore';

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

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CashIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

// Función para formatear moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Componente KPI Card
const KPICard: React.FC<{
  label: string;
  valor: number;
  formato: 'moneda' | 'numero' | 'porcentaje';
  cambio?: number;
  tendencia?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}> = ({ label, valor, formato, cambio, tendencia, icon, color }) => {
  const formatValue = () => {
    switch (formato) {
      case 'moneda':
        return formatCurrency(valor);
      case 'porcentaje':
        return `${valor}%`;
      default:
        return valor.toLocaleString();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        {cambio !== undefined && tendencia && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              tendencia === 'up' ? 'text-green-600' : tendencia === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {tendencia === 'up' ? <TrendUpIcon /> : tendencia === 'down' ? <TrendDownIcon /> : null}
            {Math.abs(cambio)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{formatValue()}</h3>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

// Componente Gráfica de Barras Simple
const SimpleBarChart: React.FC<{
  data: { label: string; value: number; max: number }[];
  title: string;
  color: string;
}> = ({ data, title, color }) => {
  const maxValue = Math.max(...data.map((d) => d.max || d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">{formatCurrency(item.value)}</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div
                  className={`${color} transition-all duration-500`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
                {item.max > item.value && (
                  <div
                    className="bg-gray-200"
                    style={{ width: `${((item.max - item.value) / maxValue) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Embudo de Ventas
const SalesFunnel: React.FC<{
  data: { etapa: string; cantidad: number; valor: number }[];
}> = ({ data }) => {
  const maxCantidad = Math.max(...data.map((d) => d.cantidad));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Embudo de Ventas</h3>
      <div className="space-y-2">
        {data.map((item, idx) => {
          const width = 100 - idx * 8;
          const colors = [
            'bg-blue-500',
            'bg-blue-400',
            'bg-indigo-400',
            'bg-purple-400',
            'bg-pink-400',
            'bg-green-500',
          ];
          return (
            <div key={idx} className="flex items-center justify-center">
              <div
                className={`${colors[idx % colors.length]} h-10 rounded-lg flex items-center justify-between px-4 text-white text-sm transition-all hover:opacity-90`}
                style={{ width: `${width}%` }}
              >
                <span className="font-medium truncate">{item.etapa}</span>
                <span className="font-bold">{item.cantidad}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Valor total en pipeline: {formatCurrency(data.reduce((sum, d) => sum + d.valor, 0))}
      </div>
    </div>
  );
};

// Componente Gráfica de Origen de Leads
const LeadsOriginChart: React.FC<{
  data: { origen: string; cantidad: number; porcentaje: number }[];
}> = ({ data }) => {
  const colors = ['bg-green-500', 'bg-pink-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-gray-400'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Origen de Leads</h3>
      <div className="flex gap-4">
        {/* Gráfica circular simulada */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-500" />
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.cantidad, 0)}
            </span>
          </div>
        </div>
        {/* Leyenda */}
        <div className="flex-1 space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                <span className="text-gray-600">{item.origen}</span>
              </div>
              <span className="font-medium">{item.porcentaje}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente Actividad Reciente
const RecentActivity: React.FC<{
  activities: { id: string; tipo: string; titulo: string; descripcion: string; fecha: string }[];
}> = ({ activities }) => {
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'lead':
        return <UsersIcon />;
      case 'cliente':
        return <UsersIcon />;
      case 'obra':
        return <BuildingIcon />;
      case 'tarea':
        return <CheckIcon />;
      case 'mensaje':
        return <PhoneIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'lead':
        return 'bg-blue-100 text-blue-600';
      case 'cliente':
        return 'bg-green-100 text-green-600';
      case 'obra':
        return 'bg-yellow-100 text-yellow-600';
      case 'tarea':
        return 'bg-purple-100 text-purple-600';
      case 'mensaje':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={`p-2 rounded-lg ${getColor(activity.tipo)} flex-shrink-0`}>
              {getIcon(activity.tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.titulo}</p>
              <p className="text-xs text-gray-500 truncate">{activity.descripcion}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {isToday(parseISO(activity.fecha))
                ? format(parseISO(activity.fecha), 'HH:mm')
                : format(parseISO(activity.fecha), 'dd MMM', { locale: es })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Eventos de Hoy
const TodayEvents: React.FC<{
  events: { id: string; titulo: string; tipo: string; fecha_inicio: string; color?: string }[];
}> = ({ events }) => {
  const today = events.filter((e) => isToday(parseISO(e.fecha_inicio)));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoy</h3>
        <span className="text-sm text-gray-500">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </span>
      </div>
      {today.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No hay eventos programados para hoy</p>
      ) : (
        <div className="space-y-3">
          {today.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className="w-1 h-12 rounded-full"
                style={{ backgroundColor: event.color || '#3B82F6' }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{event.titulo}</p>
                <p className="text-xs text-gray-500">
                  {format(parseISO(event.fecha_inicio), 'HH:mm')}
                </p>
              </div>
              <CalendarIcon />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Tareas Pendientes
const PendingTasks: React.FC = () => {
  const { getTareasHoy, getTareasVencidas } = useTareasStore();
  const tareasHoy = getTareasHoy();
  const tareasVencidas = getTareasVencidas();

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tareas Pendientes</h3>
      
      {tareasVencidas.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-red-600 uppercase mb-2">Vencidas</h4>
          <div className="space-y-2">
            {tareasVencidas.slice(0, 3).map((tarea) => (
              <div
                key={tarea.id}
                className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg"
              >
                <span className="text-sm text-gray-900 flex-1 truncate">{tarea.titulo}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(tarea.prioridad)}`}>
                  {tarea.prioridad}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Hoy</h4>
        {tareasHoy.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-2">No hay tareas para hoy</p>
        ) : (
          <div className="space-y-2">
            {tareasHoy.map((tarea) => (
              <div
                key={tarea.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-900 flex-1 truncate">{tarea.titulo}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(tarea.prioridad)}`}>
                  {tarea.prioridad}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Mensajes Sin Leer
const UnreadMessages: React.FC = () => {
  const { getTotalSinLeer, getSinLeerPorCanal } = useInboxStore();
  const total = getTotalSinLeer();
  const porCanal = getSinLeerPorCanal();

  const canales = [
    { key: 'whatsapp', nombre: 'WhatsApp', color: 'bg-green-500' },
    { key: 'instagram', nombre: 'Instagram', color: 'bg-pink-500' },
    { key: 'facebook', nombre: 'Facebook', color: 'bg-blue-500' },
    { key: 'email', nombre: 'Email', color: 'bg-gray-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mensajes</h3>
        {total > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            {total} sin leer
          </span>
        )}
      </div>
      <div className="space-y-3">
        {canales.map((canal) => {
          const count = porCanal[canal.key as keyof typeof porCanal];
          return (
            <div key={canal.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${canal.color}`} />
                <span className="text-sm text-gray-600">{canal.nombre}</span>
              </div>
              <span className={`text-sm font-medium ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente Resumen de Obras
const ObrasResumen: React.FC = () => {
  const { obras } = useObrasStore();
  const obrasActivas = obras.filter((o) => o.estado === 'en_progreso');

  const totalPresupuestado = obrasActivas.reduce((sum, o) => sum + o.presupuesto_total, 0);
  const totalGastado = obrasActivas.reduce((sum, o) => sum + o.costo_actual, 0);
  const porcentajeGastado = totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Obras Activas</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Presupuesto vs Gastado</span>
          <span className="font-medium">{porcentajeGastado.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              porcentajeGastado > 90 ? 'bg-red-500' : porcentajeGastado > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Gastado: {formatCurrency(totalGastado)}</span>
          <span>Total: {formatCurrency(totalPresupuestado)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {obrasActivas.slice(0, 3).map((obra) => (
          <div key={obra.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{obra.nombre}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${obra.porcentaje_avance}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{obra.porcentaje_avance}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardPageV2: React.FC = () => {
  const { kpis, ventasPorMes, leadsPorEtapa, leadsPorOrigen, actividadReciente, eventosCalendario } =
    useDashboardStore();

  const salesData = ventasPorMes.map((v) => ({
    label: v.mes,
    value: v.ventas,
    max: v.meta,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          {...kpis.leadsNuevos}
          icon={<UsersIcon />}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          {...kpis.cotizacionesPendientes}
          icon={<DocumentIcon />}
          color="bg-yellow-100 text-yellow-600"
        />
        <KPICard
          {...kpis.obrasActivas}
          icon={<BuildingIcon />}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          {...kpis.ingresosMes}
          icon={<CashIcon />}
          color="bg-purple-100 text-purple-600"
        />
        <KPICard
          {...kpis.tasaConversion}
          icon={<TargetIcon />}
          color="bg-pink-100 text-pink-600"
        />
        <KPICard
          {...kpis.ticketPromedio}
          icon={<ChartIcon />}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart data={salesData} title="Ventas vs Meta (últimos 7 meses)" color="bg-blue-500" />
        <SalesFunnel data={leadsPorEtapa} />
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeadsOriginChart data={leadsPorOrigen} />
        <RecentActivity activities={actividadReciente} />
        <TodayEvents events={eventosCalendario} />
        <PendingTasks />
      </div>

      {/* Tercera fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UnreadMessages />
        <ObrasResumen />
      </div>
    </div>
  );
};

export default DashboardPageV2;
