/**
 * Reportes Page - Sistema de reportes y analíticas
 */

import React, { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useDashboardStore } from '../store/dashboardStore';
import { usePipelineStore, PIPELINE_STAGES } from '../store/pipelineStore';
import { useObrasStore } from '../store/obrasStore';

// Iconos
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Helpers
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(value);

// Tipos de reportes
type TipoReporte = 'ventas' | 'pipeline' | 'obras' | 'vendedores';

// Componente de gráfica de barras simple
const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; height?: number }> = ({
  data,
  height = 200,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <span className="text-sm font-medium text-gray-600 mb-1">
            {formatCurrency(item.value)}
          </span>
          <div
            className={`w-full rounded-t ${item.color || 'bg-blue-500'} transition-all`}
            style={{ height: `${(item.value / maxValue) * (height - 40)}px`, minHeight: 4 }}
          />
          <span className="text-xs text-gray-500 mt-2 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Componente de gráfica de dona
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            const endAngle = currentAngle;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium text-gray-900">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reporte de Ventas
const ReporteVentas: React.FC = () => {
  const { ventasPorMes, kpis } = useDashboardStore();

  const monthColors = [
    'bg-blue-400',
    'bg-blue-500',
    'bg-blue-600',
    'bg-blue-500',
    'bg-blue-600',
    'bg-blue-700',
  ];

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <CashIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos del Mes</p>
              <p className="text-xl font-bold">{formatCurrency(kpis.ingresosMes.valor)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <TrendUpIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tasa de Conversión</p>
              <p className="text-xl font-bold">{kpis.tasaConversion.valor}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <ChartIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ticket Promedio</p>
              <p className="text-xl font-bold">{formatCurrency(kpis.ticketPromedio.valor)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500">Leads Nuevos</p>
              <p className="text-xl font-bold">{kpis.leadsNuevos.valor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de ventas por mes */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ventas por Mes</h3>
        <BarChart
          data={ventasPorMes.map((item, i) => ({
            label: item.mes,
            value: item.ventas,
            color: monthColors[i % monthColors.length],
          }))}
          height={250}
        />
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Detalle de Ventas</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mes</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Ventas</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Meta</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Cumplimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ventasPorMes.map((item) => {
              const cumplimiento = item.meta > 0 ? Math.round((item.ventas / item.meta) * 100) : 0;
              return (
                <tr key={item.mes}>
                  <td className="px-4 py-3 font-medium">{item.mes}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.ventas)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.meta)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${cumplimiento >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {cumplimiento}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reporte de Pipeline
const ReportePipeline: React.FC = () => {
  const { leads } = usePipelineStore();
  const { leadsPorEtapa, leadsPorOrigen } = useDashboardStore();

  const etapaColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#22C55E', '#EF4444'];

  // Calcular stats del pipeline
  const pipelineStats = PIPELINE_STAGES.slice(0, 4).map((etapa) => {
    const count = leads.filter((l) => l.estado === etapa.id).length;
    const value = leads
      .filter((l) => l.estado === etapa.id)
      .reduce((sum, l) => sum + (l.presupuesto_estimado || 0), 0);
    return { ...etapa, count, value };
  });

  return (
    <div className="space-y-6">
      {/* Stats del pipeline */}
      <div className="grid grid-cols-4 gap-4">
        {pipelineStats.map((etapa) => (
          <div key={etapa.id} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{etapa.label}</p>
            <p className="text-2xl font-bold text-gray-900">{etapa.count} leads</p>
            <p className="text-sm text-gray-500">{formatCurrency(etapa.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Leads por etapa */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Etapa</h3>
          <DonutChart
            data={leadsPorEtapa.map((item, i) => ({
              label: item.etapa,
              value: item.cantidad,
              color: etapaColors[i % etapaColors.length],
            }))}
          />
        </div>

        {/* Leads por origen */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Origen de Leads</h3>
          <div className="space-y-4">
            {leadsPorOrigen.map((item) => {
              const maxCount = Math.max(...leadsPorOrigen.map((o) => o.cantidad));
              const percentage = maxCount > 0 ? (item.cantidad / maxCount) * 100 : 0;
              return (
                <div key={item.origen}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.origen}</span>
                    <span className="font-medium">{item.cantidad}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funnel de conversión */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Embudo de Conversión</h3>
        <div className="space-y-2">
          {PIPELINE_STAGES.slice(0, 6).map((etapa, index) => {
            const count = leads.filter((l) => l.estado === etapa.id).length;
            const firstCount = leads.filter((l) => l.estado === PIPELINE_STAGES[0]?.id).length || 1;
            const width = Math.max((count / firstCount) * 100, 20);
            return (
              <div key={etapa.id} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-40">{etapa.label}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="h-10 rounded flex items-center justify-center text-white font-medium"
                    style={{
                      width: `${width}%`,
                      backgroundColor: etapaColors[index % etapaColors.length],
                    }}
                  >
                    {count}
                  </div>
                  {index > 0 && (
                    <span className="text-xs text-gray-400">
                      {Math.round((count / firstCount) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Reporte de Obras
const ReporteObras: React.FC = () => {
  const { obras } = useObrasStore();

  const obrasPorEstado = [
    { estado: 'Planificación', count: obras.filter((o) => o.estado === 'planificacion').length, color: '#6B7280' },
    { estado: 'En Progreso', count: obras.filter((o) => o.estado === 'en_progreso').length, color: '#3B82F6' },
    { estado: 'Pausada', count: obras.filter((o) => o.estado === 'pausada').length, color: '#F59E0B' },
    { estado: 'Completada', count: obras.filter((o) => o.estado === 'completada').length, color: '#22C55E' },
    { estado: 'Cancelada', count: obras.filter((o) => o.estado === 'cancelada').length, color: '#EF4444' },
  ];

  const totalPresupuestado = obras.reduce((sum, o) => sum + o.presupuesto_total, 0);
  const totalGastado = obras.reduce((sum, o) => sum + o.costo_actual, 0);
  const margen = totalPresupuestado - totalGastado;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total Obras</p>
          <p className="text-2xl font-bold text-gray-900">{obras.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Presupuestado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPresupuestado)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Gastado</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalGastado)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Margen</p>
          <p className={`text-2xl font-bold ${margen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(margen)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Obras por estado */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Obras por Estado</h3>
          <DonutChart
            data={obrasPorEstado
              .filter((e) => e.count > 0)
              .map((item) => ({
                label: item.estado,
                value: item.count,
                color: item.color,
              }))}
          />
        </div>

        {/* Progreso de obras */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Progreso de Obras</h3>
          <div className="space-y-4">
            {obras
              .filter((o) => o.estado === 'en_progreso')
              .slice(0, 5)
              .map((obra) => (
                <div key={obra.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 truncate max-w-[200px]">{obra.nombre}</span>
                    <span className="font-medium">{obra.porcentaje_avance}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${obra.porcentaje_avance}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Tabla de obras */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Listado de Obras</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Obra</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Presupuesto</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Gastado</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Progreso</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {obras.map((obra) => (
              <tr key={obra.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium">{obra.nombre}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{obra.cliente_nombre}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: `${obrasPorEstado.find((e) => e.estado.toLowerCase().includes(obra.estado.replace('_', ' ')))?.color}20`,
                      color: obrasPorEstado.find((e) => e.estado.toLowerCase().includes(obra.estado.replace('_', ' ')))?.color || '#6B7280',
                    }}
                  >
                    {obra.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{formatCurrency(obra.presupuesto_total)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(obra.costo_actual)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${obra.porcentaje_avance}%` }}
                      />
                    </div>
                    <span className="text-sm">{obra.porcentaje_avance}%</span>
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

// Reporte de Vendedores
const ReporteVendedores: React.FC = () => {
  const { leads } = usePipelineStore();

  // Agrupar por responsable
  const vendedorStats = leads.reduce((acc: Record<string, { ventas: number; leads: number; valor: number }>, lead) => {
    const vendedor = lead.responsable_id || 'Sin asignar';
    if (!acc[vendedor]) {
      acc[vendedor] = { ventas: 0, leads: 0, valor: 0 };
    }
    acc[vendedor].leads++;
    acc[vendedor].valor += lead.presupuesto_estimado || 0;
    if (lead.estado === 'finalizado') {
      acc[vendedor].ventas++;
    }
    return acc;
  }, {});

  const vendedores = Object.entries(vendedorStats)
    .map(([nombre, stats]) => ({ nombre, ...stats }))
    .sort((a, b) => b.valor - a.valor);

  return (
    <div className="space-y-6">
      {/* Tabla de vendedores */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Rendimiento por Responsable</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Responsable</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Leads</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Ventas Cerradas</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Conversión</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Pipeline</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vendedores.map((vendedor, index) => (
              <tr key={vendedor.nombre} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{vendedor.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{vendedor.leads}</td>
                <td className="px-4 py-3 text-right">{vendedor.ventas}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      vendedor.leads > 0 && (vendedor.ventas / vendedor.leads) * 100 > 20
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {vendedor.leads > 0 ? Math.round((vendedor.ventas / vendedor.leads) * 100) : 0}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(vendedor.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfica comparativa */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Valor Pipeline por Responsable</h3>
        <BarChart
          data={vendedores.slice(0, 6).map((v) => ({
            label: v.nombre.split(' ')[0],
            value: v.valor,
            color: 'bg-blue-500',
          }))}
          height={200}
        />
      </div>
    </div>
  );
};

// Componente Principal
export const ReportesPage: React.FC = () => {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('ventas');
  const [fechaInicio, setFechaInicio] = useState(format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const reportes = [
    { id: 'ventas' as TipoReporte, label: 'Ventas', icon: <CashIcon /> },
    { id: 'pipeline' as TipoReporte, label: 'Pipeline', icon: <ChartIcon /> },
    { id: 'obras' as TipoReporte, label: 'Obras', icon: <ChartIcon /> },
    { id: 'vendedores' as TipoReporte, label: 'Vendedores', icon: <UsersIcon /> },
  ];

  const handleExport = (formato: 'excel' | 'pdf') => {
    alert(`Exportando a ${formato.toUpperCase()}...`);
    // TODO: Implementar exportación real
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500">Analítica y métricas del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <DownloadIcon /> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <DownloadIcon /> PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between mb-6">
        {/* Tabs de reportes */}
        <div className="flex gap-2">
          {reportes.map((reporte) => (
            <button
              key={reporte.id}
              onClick={() => setTipoReporte(reporte.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipoReporte === reporte.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {reporte.icon}
              {reporte.label}
            </button>
          ))}
        </div>

        {/* Rango de fechas */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-gray-400">a</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Contenido del reporte */}
      {tipoReporte === 'ventas' && <ReporteVentas />}
      {tipoReporte === 'pipeline' && <ReportePipeline />}
      {tipoReporte === 'obras' && <ReporteObras />}
      {tipoReporte === 'vendedores' && <ReporteVendedores />}
    </div>
  );
};

export default ReportesPage;
