import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Empresa } from './pages/Empresa';
import { Servicios } from './pages/Servicios';
import { ServicioDetalle } from './pages/ServicioDetalle';
import { Obras } from './pages/Obras';
import { ObraDetalle } from './pages/ObraDetalle';
import { Zonas } from './pages/Zonas';
import { Contacto } from './pages/Contacto';
import { Cotizar } from './pages/Cotizar';

// Admin
import {
  AdminLayout,
  LoginPage,
  LeadsPage,
} from './admin';
import { PipelinePage } from './admin/pages/PipelinePage';
import { CotizacionesPage } from './admin/pages/CotizacionesPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { InboxPage } from './admin/pages/InboxPage';
import { ObrasPage } from './admin/pages/ObrasPage';
import { TareasPage } from './admin/pages/TareasPage';
import { ClientesPage } from './admin/pages/ClientesPage';
import { ReportesPage } from './admin/pages/ReportesPageSimple';
import { ConfiguracionPage } from './admin/pages/ConfiguracionPageSimple';
import { IntegracionesPage } from './admin/pages/IntegracionesPage';
// PRO Pages - Enterprise Grade
import ObraDetallePagePro from './admin/pages/ObraDetallePagePro';
import ComprasPagePro from './admin/pages/ComprasPagePro';
import ProveedoresPagePro from './admin/pages/ProveedoresPagePro';
import FinanzasPagePro from './admin/pages/FinanzasPagePro';
// COS Pages - Construction Operating System
import CalidadPage from './admin/pages/CalidadPage';
import IncidentesPage from './admin/pages/IncidentesPage';
import CuadrillasPage from './admin/pages/CuadrillasPage';
import DocumentosPage from './admin/pages/DocumentosPage';
// ERP Pages - Financial Core
import CajaPage from './admin/pages/CajaPage';
import CobrosPage from './admin/pages/CobrosPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="empresa" element={<Empresa />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="servicios/:slug" element={<ServicioDetalle />} />
          <Route path="obras" element={<Obras />} />
          <Route path="obras/:slug" element={<ObraDetalle />} />
          <Route path="zonas" element={<Zonas />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="cotizar" element={<Cotizar />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="obras" element={<ObrasPage />} />
          <Route path="obras/:id" element={<ObraDetallePagePro />} />
          <Route path="cotizaciones" element={<CotizacionesPage />} />
          <Route path="tareas" element={<TareasPage />} />
          <Route path="compras" element={<ComprasPagePro />} />
          <Route path="proveedores" element={<ProveedoresPagePro />} />
          {/* Financiero - ERP Core */}
          <Route path="caja" element={<CajaPage />} />
          <Route path="cobros" element={<CobrosPage />} />
          <Route path="finanzas" element={<FinanzasPagePro />} />
          <Route path="calidad" element={<CalidadPage />} />
          <Route path="incidentes" element={<IncidentesPage />} />
          <Route path="cuadrillas" element={<CuadrillasPage />} />
          <Route path="documentos" element={<DocumentosPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
          <Route path="integraciones" element={<IntegracionesPage />} />
        </Route>
      </Routes>

      {/* Vercel Analytics & Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;

