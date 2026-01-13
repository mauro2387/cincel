/**
 * Reportes Page - En desarrollo
 */

import React from 'react';

export const ReportesPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600">Analítica y métricas del negocio</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reportes en Desarrollo
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Esta sección mostrará reportes y analíticas una vez que empieces a agregar leads, clientes y proyectos en el sistema.
        </p>
        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>✓ Los datos se conectarán automáticamente desde Supabase</p>
          <p>✓ Podrás ver métricas de ventas, conversión y proyectos</p>
          <p>✓ Gráficos y estadísticas en tiempo real</p>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
